import { getSupabaseClient } from "@/shared/lib/supabase";

import type { BillingInterval, PaymentPlan } from "./payments.types";

type DbPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  billing_interval: BillingInterval;
  features: unknown;
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

export function formatPlanPrice(plan: Pick<PaymentPlan, "price" | "billingInterval">) {
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(plan.price);

  return `${price}/${plan.billingInterval === "yearly" ? "ano" : "mês"}`;
}

function normalizeFeatures(features: unknown) {
  if (!Array.isArray(features)) {
    return [];
  }

  return features
    .map((feature) => (typeof feature === "string" ? feature.trim() : ""))
    .filter(Boolean);
}
