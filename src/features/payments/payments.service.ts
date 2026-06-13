import type { UserType } from "@/features/auth/auth.types";
import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  BillingInterval,
  DemoCheckoutSession,
  DemoPaymentResult,
  DemoPaymentStatus,
  PaymentMethod,
  PaymentPlan,
} from "./payments.types";

type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  billing_interval: BillingInterval;
  features: unknown;
};

type DbCheckoutSession = {
  id: string;
  provider_session_id: string | null;
  status: string;
};

type DbCompany = {
  id: string;
  name: string;
};

type DbSubscription = {
  id: string;
  provider_subscription_id: string | null;
};

type PaymentOwner = {
  profileId: string | null;
  companyId: string | null;
  label: string;
};

type CreateDemoCheckoutParams = {
  method: PaymentMethod;
  plan: PaymentPlan;
  profileId: string;
  userType: UserType;
};

type ProcessDemoPaymentParams = CreateDemoCheckoutParams & {
  checkoutSession: DemoCheckoutSession;
  status: DemoPaymentStatus;
};

const eventTypeByStatus: Record<DemoPaymentStatus, string> = {
  approved: "payment.approved",
  refused: "payment.refused",
  cancelled: "payment.cancelled",
  renewed: "payment.renewed",
};

export async function listPaidPaymentPlans(): Promise<PaymentPlan[]> {
  const { data, error } = await getSupabaseClient()
    .from("plans")
    .select("id, name, description, price, billing_interval, features")
    .eq("active", true)
    .gt("price", 0)
    .order("price", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DbPlan[]).map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price ?? 0),
    billingInterval: plan.billing_interval,
    features: normalizeFeatures(plan.features),
  }));
}

export async function createDemoCheckoutSession({
  method,
  plan,
  profileId,
  userType,
}: CreateDemoCheckoutParams): Promise<DemoCheckoutSession> {
  const supabase = getSupabaseClient();
  const owner = await resolvePaymentOwner(profileId, userType);
  const providerSessionId = buildDemoIdentifier("checkout");

  const { data, error } = await supabase
    .from("checkout_sessions")
    .insert({
      profile_id: owner.profileId,
      company_id: owner.companyId,
      plan_id: plan.id,
      provider: "demo",
      provider_session_id: providerSessionId,
      status: "pending",
      checkout_url: `linka://payments/demo/${providerSessionId}?method=${method}`,
    })
    .select("id, provider_session_id, status")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const session = data as DbCheckoutSession;

  return {
    id: session.id,
    providerSessionId: session.provider_session_id ?? providerSessionId,
    status: normalizeCheckoutStatus(session.status),
    ownerLabel: owner.label,
  };
}

export async function processDemoPaymentWebhook({
  checkoutSession,
  method,
  plan,
  profileId,
  status,
  userType,
}: ProcessDemoPaymentParams): Promise<DemoPaymentResult> {
  const supabase = getSupabaseClient();
  const owner = await resolvePaymentOwner(profileId, userType);
  const now = new Date();
  const checkoutStatus = status === "renewed" ? "approved" : status;
  const eventType = eventTypeByStatus[status];
  const eventProviderId = buildDemoIdentifier("evt");
  const payload = {
    demo: true,
    provider: "demo",
    status,
    method,
    amount: plan.price,
    currency: "BRL",
    plan_id: plan.id,
    plan_name: plan.name,
    billing_interval: plan.billingInterval,
    checkout_session_id: checkoutSession.id,
    provider_session_id: checkoutSession.providerSessionId,
    profile_id: owner.profileId,
    company_id: owner.companyId,
    processed_at: now.toISOString(),
  };

  const { data: eventData, error: eventError } = await supabase
    .from("payment_events")
    .insert({
      provider: "demo",
      provider_event_id: eventProviderId,
      event_type: eventType,
      payload,
      processed_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (eventError) {
    throw new Error(eventError.message);
  }

  await updateCheckoutSessionStatus(checkoutSession.id, checkoutStatus);

  const subscriptionId = await syncDemoSubscription({
    owner,
    plan,
    status,
    processedAt: now,
  });

  return buildDemoPaymentResult({
    checkoutSessionId: checkoutSession.id,
    paymentEventId: String(eventData.id),
    subscriptionId,
    status,
  });
}

export function formatPlanPrice(plan: Pick<PaymentPlan, "price" | "billingInterval">) {
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(plan.price);

  return `${price}/${plan.billingInterval === "yearly" ? "ano" : "mês"}`;
}

async function resolvePaymentOwner(profileId: string, userType: UserType): Promise<PaymentOwner> {
  if (userType !== "company") {
    return {
      profileId,
      companyId: null,
      label: userType === "investor" ? "investidor" : "perfil",
    };
  }

  const { data, error } = await getSupabaseClient()
    .from("companies")
    .select("id, name")
    .eq("owner_id", profileId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const company = data as DbCompany | null;

  if (!company) {
    return {
      profileId,
      companyId: null,
      label: "perfil da empresa",
    };
  }

  return {
    profileId: null,
    companyId: company.id,
    label: company.name,
  };
}

async function updateCheckoutSessionStatus(
  checkoutSessionId: string,
  status: Exclude<DemoPaymentStatus, "renewed">,
) {
  const { error } = await getSupabaseClient()
    .from("checkout_sessions")
    .update({ status })
    .eq("id", checkoutSessionId);

  if (error) {
    throw new Error(error.message);
  }
}

async function syncDemoSubscription({
  owner,
  plan,
  processedAt,
  status,
}: {
  owner: PaymentOwner;
  plan: PaymentPlan;
  processedAt: Date;
  status: DemoPaymentStatus;
}) {
  if (status === "refused") {
    return null;
  }

  const existingSubscription = await findExistingDemoSubscription(owner, plan.id);

  if (status === "cancelled") {
    if (!existingSubscription) {
      return null;
    }

    const { data, error } = await getSupabaseClient()
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: processedAt.toISOString(),
        updated_at: processedAt.toISOString(),
      })
      .eq("id", existingSubscription.id)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return String(data.id);
  }

  const periodStart = processedAt.toISOString();
  const periodEnd = getBillingPeriodEnd(processedAt, plan.billingInterval).toISOString();
  const subscriptionPayload = {
    company_id: owner.companyId,
    profile_id: owner.profileId,
    plan_id: plan.id,
    provider: "demo",
    provider_subscription_id:
      existingSubscription?.provider_subscription_id ?? buildDemoIdentifier("sub"),
    status: "active",
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancelled_at: null,
    updated_at: periodStart,
  };

  if (existingSubscription) {
    const { data, error } = await getSupabaseClient()
      .from("subscriptions")
      .update(subscriptionPayload)
      .eq("id", existingSubscription.id)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return String(data.id);
  }

  const { data, error } = await getSupabaseClient()
    .from("subscriptions")
    .insert(subscriptionPayload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return String(data.id);
}

async function findExistingDemoSubscription(owner: PaymentOwner, planId: string) {
  let query = getSupabaseClient()
    .from("subscriptions")
    .select("id, provider_subscription_id")
    .eq("plan_id", planId)
    .eq("provider", "demo")
    .order("created_at", { ascending: false })
    .limit(1);

  if (owner.companyId) {
    query = query.eq("company_id", owner.companyId);
  } else {
    query = query.eq("profile_id", owner.profileId ?? "");
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbSubscription | null;
}

function buildDemoPaymentResult({
  checkoutSessionId,
  paymentEventId,
  status,
  subscriptionId,
}: {
  checkoutSessionId: string;
  paymentEventId: string;
  status: DemoPaymentStatus;
  subscriptionId: string | null;
}): DemoPaymentResult {
  const copyByStatus: Record<DemoPaymentStatus, Pick<DemoPaymentResult, "title" | "description" | "timeline">> = {
    approved: {
      title: "Pagamento aprovado",
      description: "Webhook demonstrativo processado, assinatura ativa e acesso liberado.",
      timeline: ["Sessão criada", "Pagamento aprovado", "Webhook validado", "Acesso liberado"],
    },
    refused: {
      title: "Pagamento recusado",
      description: "Webhook demonstrativo registrado sem liberar assinatura ou acesso.",
      timeline: ["Sessão criada", "Pagamento recusado", "Webhook validado", "Acesso mantido bloqueado"],
    },
    cancelled: {
      title: "Pagamento cancelado",
      description: "Sessão cancelada e assinatura demo encerrada quando existia uma ativa.",
      timeline: ["Sessão criada", "Cancelamento recebido", "Webhook validado", "Assinatura encerrada"],
    },
    renewed: {
      title: "Assinatura renovada",
      description: "Renovação demonstrativa processada e novo período de acesso registrado.",
      timeline: ["Sessão localizada", "Renovação aprovada", "Webhook validado", "Novo período liberado"],
    },
  };

  const copy = copyByStatus[status];

  return {
    checkoutSessionId,
    paymentEventId,
    status,
    subscriptionId,
    title: copy.title,
    description: copy.description,
    timeline: copy.timeline,
  };
}

function buildDemoIdentifier(prefix: string) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `demo_${prefix}_${Date.now()}_${randomPart}`;
}

function getBillingPeriodEnd(startDate: Date, billingInterval: BillingInterval) {
  const nextDate = new Date(startDate);

  if (billingInterval === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

function normalizeCheckoutStatus(status: string) {
  if (["pending", "approved", "refused", "cancelled"].includes(status)) {
    return status as DemoCheckoutSession["status"];
  }

  return "pending";
}

function normalizeFeatures(features: unknown) {
  if (!Array.isArray(features)) {
    return [];
  }

  return features
    .map((feature) => (typeof feature === "string" ? feature.trim() : ""))
    .filter(Boolean);
}
