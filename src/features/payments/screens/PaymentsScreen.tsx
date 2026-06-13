import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_HEIGHT } from "@/config/layout";
import { useTheme } from "@/features/accessibility/hooks";
import { useAuth } from "@/features/auth/auth.context";
import { useNotificationsUnread } from "@/features/notifications/useNotificationsUnread";
import { AppTopBar } from "@/shared/components/layout/AppTopBar";
import { AnimatedScreenScrollView } from "@/shared/components/layout/AnimatedScreenScrollView";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import { showAppToast } from "@/shared/components/ui/molecules/Toast/showAppToast";

import {
  createDemoCheckoutSession,
  formatPlanPrice,
  listPaidPaymentPlans,
  processDemoPaymentWebhook,
} from "../payments.service";
import type {
  CheckoutStatus,
  DemoCheckoutSession,
  DemoPaymentResult,
  DemoPaymentStatus,
  PaymentMethod,
  PaymentPlan,
} from "../payments.types";

const paymentMethods: {
  id: PaymentMethod;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "pix",
    title: "Pix",
    description: "Confirmação instantânea via QR Code demonstrativo.",
    icon: "qr-code-outline",
  },
  {
    id: "boleto",
    title: "Boleto",
    description: "Vencimento em 3 dias com baixa simulada.",
    icon: "barcode-outline",
  },
  {
    id: "card",
    title: "Cartão",
    description: "Crédito ou débito com parcelamento visual.",
    icon: "card-outline",
  },
];

const checkoutSteps = [
  "Sessão criada",
  "Pagamento pendente",
  "Webhook recebido",
  "Acesso liberado",
];

const operationalFlows: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: string;
}[] = [
  {
    title: "Assinaturas",
    description: "Planos mensais para estudantes, empresas e investidores com renovação simulada.",
    icon: "repeat-outline",
    status: "unpaid -> active -> paid -> past_due",
  },
  {
    title: "Cursos e eventos pagos",
    description: "Checkout demonstrativo antes de matrícula ou inscrição quando houver preço.",
    icon: "lock-open-outline",
    status: "checkout aprovado libera acesso",
  },
  {
    title: "Investimento em projetos",
    description: "Proposta financeira acompanha status até análise, aceite ou cancelamento.",
    icon: "trending-up-outline",
    status: "enviada -> em análise -> aceita",
  },
  {
    title: "Eventos de pagamento",
    description: "Linha do tempo mostra payload, processamento e tratamento de recusas ou renovações.",
    icon: "pulse-outline",
    status: "payment_events sem gateway real",
  },
];

const planAccentClasses = [
  "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30",
  "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30",
  "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30",
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Não foi possível carregar os planos.";
}

function getToastVariantForPaymentStatus(status: DemoPaymentStatus) {
  if (status === "approved" || status === "renewed") {
    return "success";
  }

  if (status === "refused") {
    return "warning";
  }

  return "info";
}

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const { user, userType } = useAuth();
  const { unreadCount } = useNotificationsUnread(user?.id);

  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix");
  const [checkoutSession, setCheckoutSession] = useState<DemoCheckoutSession | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<DemoPaymentResult | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("draft");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutStarting, setIsCheckoutStarting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentMethod = useMemo(
    () => paymentMethods.find((method) => method.id === selectedMethod) ?? paymentMethods[0],
    [selectedMethod],
  );

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const nextPlans = await listPaidPaymentPlans();
      setPlans(nextPlans);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  async function openCheckout(plan: PaymentPlan) {
    if (!user || !userType) {
      showAppToast({
        variant: "warning",
        title: "Entre para continuar",
        description: "O checkout demonstrativo precisa de um perfil autenticado.",
      });
      return;
    }

    try {
      setSelectedPlan(plan);
      setSelectedMethod("pix");
      setCheckoutSession(null);
      setCheckoutResult(null);
      setCheckoutStatus("processing");
      setIsCheckoutStarting(true);

      const session = await createDemoCheckoutSession({
        method: "pix",
        plan,
        profileId: user.id,
        userType,
      });

      setCheckoutSession(session);
      setCheckoutStatus("pending");
      showAppToast({
        variant: "info",
        title: "Sessão demo criada",
        description: `Checkout ${session.providerSessionId} pronto para simulação.`,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setSelectedPlan(null);
      setCheckoutSession(null);
      setCheckoutStatus("draft");
      showAppToast({
        variant: "error",
        title: "Não foi possível iniciar o checkout",
        description: message,
      });
    } finally {
      setIsCheckoutStarting(false);
    }
  }

  async function handleSimulatePayment(status: DemoPaymentStatus) {
    if (!user || !userType || !selectedPlan || !checkoutSession || isProcessingPayment) {
      return;
    }

    try {
      setCheckoutStatus("processing");
      setIsProcessingPayment(true);

      const result = await processDemoPaymentWebhook({
        checkoutSession,
        method: selectedMethod,
        plan: selectedPlan,
        profileId: user.id,
        status,
        userType,
      });

      setCheckoutResult(result);
      setCheckoutStatus(status);
      showAppToast({
        variant: getToastVariantForPaymentStatus(status),
        title: result.title,
        description: result.description,
      });
    } catch (error) {
      setCheckoutStatus("pending");
      showAppToast({
        variant: "error",
        title: "Webhook demo não processado",
        description: getErrorMessage(error),
      });
    } finally {
      setIsProcessingPayment(false);
    }
  }

  function closeCheckout() {
    setSelectedPlan(null);
    setCheckoutSession(null);
    setCheckoutResult(null);
    setCheckoutStatus("draft");
  }

  return (
    <SafeAreaView className="flex-1 bg-[#002B5B]" edges={["top"]}>
      <View className="flex-1 bg-white dark:bg-zinc-900">
        <AppTopBar
          title="Pagamentos"
          rightIcon="notifications-outline"
          onRightPress={() => router.push("/notifications" as Href)}
          notificationUnreadCount={unreadCount}
        />

        <AnimatedScreenScrollView
          showsVerticalScrollIndicator={false}
          className="bg-white dark:bg-zinc-900"
          contentContainerStyle={{
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24,
          }}
        >
          <View className="bg-[#002B5B] px-5 pb-12 pt-2">
            <View className="self-start rounded-full bg-white/15 px-3 py-1">
              <AccessibleText className="text-xs font-atkinson-bold text-white">
                Ambiente demonstrativo
              </AccessibleText>
            </View>
            <AccessibleText className="mt-4 text-3xl font-atkinson-bold text-white">
              Checkout visual para planos e acessos pagos
            </AccessibleText>
            <AccessibleText className="mt-2 text-base font-atkinson text-[#DDE6F2]">
              Fluxo completo sem transação real: plano, método, status, webhook e liberação.
            </AccessibleText>
          </View>

          <View className="-mt-8 rounded-t-[34px] bg-white px-5 pt-6 dark:bg-zinc-900">
            <SectionHeader
              title="Planos pagos"
              description="Dados carregados dos planos ativos no Supabase."
            />

            {isLoading ? (
              <LoadingState />
            ) : errorMessage ? (
              <StateCard
                title="Não foi possível carregar"
                description={errorMessage}
                actionLabel="Tentar novamente"
                onAction={() => void loadPlans()}
              />
            ) : (
              <View className="gap-4">
                {plans.map((plan, index) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    accentClassName={planAccentClasses[index % planAccentClasses.length]}
                    isFeatured={plan.name.toLowerCase().includes("empresa")}
                    onPress={() => openCheckout(plan)}
                  />
                ))}
              </View>
            )}

            <SectionHeader
              title="Fluxos cobertos"
              description="Leitura das epics de pagamentos e investimentos aplicada como demonstração operacional."
            />
            <View className="gap-3">
              {operationalFlows.map((flow) => (
                <FlowRow key={flow.title} {...flow} />
              ))}
            </View>

            <SectionHeader
              title="Status e webhook"
              description="Estados previstos para assinatura, compra avulsa e proposta de investimento."
            />
            <View className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <StatusLine
                label="Checkout"
                value="pending, approved, refused, cancelled"
                icon="swap-horizontal-outline"
              />
              <StatusLine
                label="Assinatura"
                value="unpaid, active, paid, cancelled, past_due"
                icon="refresh-circle-outline"
              />
              <StatusLine
                label="Webhook"
                value="payload recebido, validado e processado"
                icon="git-branch-outline"
              />
              <StatusLine
                label="Acesso"
                value="curso/evento liberado após aprovação"
                icon="shield-checkmark-outline"
                isLast
              />
            </View>
          </View>
        </AnimatedScreenScrollView>

        <CheckoutModal
          isDarkMode={isDarkMode}
          method={currentMethod}
          onClose={closeCheckout}
          isProcessing={isProcessingPayment}
          isStarting={isCheckoutStarting}
          onMethodChange={setSelectedMethod}
          onSimulate={handleSimulatePayment}
          plan={selectedPlan}
          result={checkoutResult}
          selectedMethod={selectedMethod}
          session={checkoutSession}
          status={checkoutStatus}
        />
      </View>
    </SafeAreaView>
  );
}

type SectionHeaderProps = {
  title: string;
  description: string;
};

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <View className="mb-4 mt-7">
      <AccessibleText className="text-xl font-atkinson-bold text-[#002B5B] dark:text-blue-100">
        {title}
      </AccessibleText>
      <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
        {description}
      </AccessibleText>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="items-center justify-center rounded-3xl bg-zinc-50 py-10 dark:bg-zinc-950">
      <ActivityIndicator color="#002B5B" size="large" />
      <AccessibleText className="mt-3 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
        Carregando planos ativos...
      </AccessibleText>
    </View>
  );
}

type StateCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

function StateCard({ title, description, actionLabel, onAction }: StateCardProps) {
  return (
    <View className="rounded-3xl bg-red-50 p-5 dark:bg-red-950/30">
      <AccessibleText className="text-lg font-atkinson-bold text-red-800 dark:text-red-200">
        {title}
      </AccessibleText>
      <AccessibleText className="mt-2 text-sm font-atkinson text-red-700 dark:text-red-200">
        {description}
      </AccessibleText>
      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-4 rounded-2xl bg-red-700 py-3"
        onPress={onAction}
      >
        <AccessibleText className="text-center text-sm font-atkinson-bold text-white">
          {actionLabel}
        </AccessibleText>
      </TouchableOpacity>
    </View>
  );
}

type PlanCardProps = {
  plan: PaymentPlan;
  accentClassName: string;
  isFeatured: boolean;
  onPress: () => void;
};

function PlanCard({ plan, accentClassName, isFeatured, onPress }: PlanCardProps) {
  return (
    <View className={`rounded-3xl border p-5 ${accentClassName}`}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <AccessibleText className="text-xl font-atkinson-bold text-zinc-900 dark:text-white">
              {plan.name}
            </AccessibleText>
            {isFeatured ? <Badge label="Mais usado" /> : null}
          </View>
          {plan.description ? (
            <AccessibleText className="mt-2 text-sm leading-5 font-atkinson text-zinc-600 dark:text-zinc-300">
              {plan.description}
            </AccessibleText>
          ) : null}
        </View>
        <View className="items-end">
          <AccessibleText className="text-lg font-atkinson-bold text-[#002B5B] dark:text-blue-100">
            {formatPlanPrice(plan)}
          </AccessibleText>
          <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
            recorrente
          </AccessibleText>
        </View>
      </View>

      <View className="mt-4 gap-2">
        {plan.features.map((feature) => (
          <View key={feature} className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={17} color="#059669" />
            <AccessibleText className="flex-1 text-sm font-atkinson text-zinc-700 dark:text-zinc-200">
              {feature}
            </AccessibleText>
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-[#002B5B] py-4"
        onPress={onPress}
      >
        <Ionicons name="lock-closed-outline" size={18} color="#FFFFFF" />
        <AccessibleText className="text-base font-atkinson-bold text-white">
          Simular checkout
        </AccessibleText>
      </TouchableOpacity>
    </View>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-[#FFD700] px-3 py-1">
      <AccessibleText className="text-xs font-atkinson-bold text-[#002B5B]">
        {label}
      </AccessibleText>
    </View>
  );
}

type FlowRowProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: string;
};

function FlowRow({ title, description, icon, status }: FlowRowProps) {
  return (
    <View className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <View className="flex-row gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#002B5B]">
          <Ionicons name={icon} size={21} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <AccessibleText className="text-base font-atkinson-bold text-zinc-900 dark:text-white">
            {title}
          </AccessibleText>
          <AccessibleText className="mt-1 text-sm leading-5 font-atkinson text-zinc-500 dark:text-zinc-400">
            {description}
          </AccessibleText>
          <AccessibleText className="mt-2 text-xs font-atkinson-bold uppercase text-[#002B5B] dark:text-blue-100">
            {status}
          </AccessibleText>
        </View>
      </View>
    </View>
  );
}

type StatusLineProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  isLast?: boolean;
};

function StatusLine({ label, value, icon, isLast = false }: StatusLineProps) {
  return (
    <View
      className={`flex-row items-center gap-3 py-3 ${
        isLast ? "" : "border-b border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <Ionicons name={icon} size={20} color="#002B5B" />
      <View className="flex-1">
        <AccessibleText className="text-sm font-atkinson-bold text-zinc-900 dark:text-white">
          {label}
        </AccessibleText>
        <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
          {value}
        </AccessibleText>
      </View>
    </View>
  );
}

type CheckoutModalProps = {
  isDarkMode: boolean;
  isProcessing: boolean;
  isStarting: boolean;
  method: (typeof paymentMethods)[number];
  onClose: () => void;
  onMethodChange: (method: PaymentMethod) => void;
  onSimulate: (status: DemoPaymentStatus) => void;
  plan: PaymentPlan | null;
  result: DemoPaymentResult | null;
  selectedMethod: PaymentMethod;
  session: DemoCheckoutSession | null;
  status: CheckoutStatus;
};

function CheckoutModal({
  isDarkMode,
  isProcessing,
  isStarting,
  method,
  onClose,
  onMethodChange,
  onSimulate,
  plan,
  result,
  selectedMethod,
  session,
  status,
}: CheckoutModalProps) {
  if (!plan) {
    return null;
  }

  const hasFinalResult = Boolean(result);
  const isBusy = isStarting || isProcessing || status === "processing";
  const timelineSteps = result?.timeline ?? checkoutSteps;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
        <Pressable className="max-h-[92%] rounded-t-[32px] bg-white px-5 pb-8 pt-5 dark:bg-zinc-900">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <AccessibleText className="text-xl font-atkinson-bold text-zinc-900 dark:text-white">
                Checkout demonstrativo
              </AccessibleText>
              <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                Nenhum pagamento será processado.
              </AccessibleText>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              className="h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800"
              onPress={onClose}
              disabled={isBusy}
            >
              <Ionicons name="close" size={20} color={isDarkMode ? "#FFFFFF" : "#18181B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="rounded-3xl bg-[#002B5B] p-5">
              <AccessibleText className="text-sm font-atkinson text-blue-100">
                Plano selecionado
              </AccessibleText>
              <AccessibleText className="mt-1 text-2xl font-atkinson-bold text-white">
                {plan.name}
              </AccessibleText>
              <AccessibleText className="mt-2 text-lg font-atkinson-bold text-[#FFD700]">
                {formatPlanPrice(plan)}
              </AccessibleText>
            </View>

            <ModalSection title="Sessão e método">
              <View className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#002B5B]">
                    {isStarting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
                    )}
                  </View>
                  <View className="flex-1">
                    <AccessibleText className="text-sm font-atkinson-bold text-zinc-900 dark:text-white">
                      {session ? "Sessão criada no Supabase" : "Criando sessão demo"}
                    </AccessibleText>
                    <AccessibleText className="mt-1 text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
                      {session?.providerSessionId ?? "Aguarde a preparação do checkout visual."}
                    </AccessibleText>
                  </View>
                </View>
              </View>
            </ModalSection>

            <ModalSection title="Método de pagamento">
              <View className="gap-3">
                {paymentMethods.map((paymentMethod) => (
                  <TouchableOpacity
                    key={paymentMethod.id}
                    activeOpacity={0.85}
                    className={`flex-row items-center gap-3 rounded-2xl border p-4 ${
                      selectedMethod === paymentMethod.id
                        ? "border-[#002B5B] bg-blue-50 dark:border-blue-300 dark:bg-blue-950/40"
                        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                    } ${hasFinalResult || isBusy ? "opacity-70" : ""}`}
                    onPress={() => onMethodChange(paymentMethod.id)}
                    disabled={hasFinalResult || isBusy}
                  >
                    <Ionicons name={paymentMethod.icon} size={22} color="#002B5B" />
                    <View className="flex-1">
                      <AccessibleText className="text-sm font-atkinson-bold text-zinc-900 dark:text-white">
                        {paymentMethod.title}
                      </AccessibleText>
                      <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
                        {paymentMethod.description}
                      </AccessibleText>
                    </View>
                    {selectedMethod === paymentMethod.id ? (
                      <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </ModalSection>

            {selectedMethod === "card" ? (
              <View className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                <AccessibleText className="text-sm font-atkinson-bold text-zinc-900 dark:text-white">
                  Parcelamento visual
                </AccessibleText>
                <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                  1x de {formatPlanPrice(plan).replace("/mês", "")} ou 3x sem juros no demonstrativo.
                </AccessibleText>
              </View>
            ) : null}

            <ModalSection title="Linha do tempo">
              <View className="gap-3">
                {timelineSteps.map((step, index) => {
                  const isStepActive = Boolean(result) || (session && index < 2) || index === 0;
                  return (
                    <View key={`${step}-${index}`} className="flex-row items-center gap-3">
                      <View
                        className={`h-8 w-8 items-center justify-center rounded-full ${
                          isStepActive ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <AccessibleText className="text-xs font-atkinson-bold text-white">
                          {index + 1}
                        </AccessibleText>
                      </View>
                      <AccessibleText className="flex-1 text-sm font-atkinson-bold text-zinc-800 dark:text-zinc-100">
                        {step}
                      </AccessibleText>
                    </View>
                  );
                })}
              </View>
            </ModalSection>

            <View className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <AccessibleText className="text-sm font-atkinson-bold text-zinc-900 dark:text-white">
                Resultado atual
              </AccessibleText>
              <AccessibleText className="mt-1 text-sm font-atkinson text-zinc-500 dark:text-zinc-400">
                {result
                  ? result.description
                  : isBusy
                    ? "Processando etapa demonstrativa no Supabase."
                    : `${method.title} pendente. Aguardando confirmação simulada do webhook.`}
              </AccessibleText>
              {result ? (
                <View className="mt-3 gap-1">
                  <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
                    Checkout: {result.checkoutSessionId}
                  </AccessibleText>
                  <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
                    Evento: {result.paymentEventId}
                  </AccessibleText>
                  {result.subscriptionId ? (
                    <AccessibleText className="text-xs font-atkinson text-zinc-500 dark:text-zinc-400">
                      Assinatura: {result.subscriptionId}
                    </AccessibleText>
                  ) : null}
                </View>
              ) : null}
            </View>

            {hasFinalResult ? (
              <TouchableOpacity
                activeOpacity={0.85}
                className="mt-5 rounded-2xl bg-emerald-600 py-4"
                onPress={onClose}
              >
                <AccessibleText className="text-center text-base font-atkinson-bold text-white">
                  Concluir demonstração
                </AccessibleText>
              </TouchableOpacity>
            ) : (
              <View className="mt-5 gap-3">
                <TouchableOpacity
                  activeOpacity={0.85}
                  className={`rounded-2xl py-4 ${isBusy || !session ? "bg-zinc-400" : "bg-[#002B5B]"}`}
                  onPress={() => onSimulate("approved")}
                  disabled={isBusy || !session}
                >
                  <AccessibleText className="text-center text-base font-atkinson-bold text-white">
                    {isProcessing ? "Processando webhook..." : "Simular pagamento aprovado"}
                  </AccessibleText>
                </TouchableOpacity>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    activeOpacity={0.85}
                    className={`flex-1 rounded-2xl py-3 ${isBusy || !session ? "bg-zinc-200" : "bg-amber-100"}`}
                    onPress={() => onSimulate("refused")}
                    disabled={isBusy || !session}
                  >
                    <AccessibleText className="text-center text-sm font-atkinson-bold text-amber-900">
                      Recusar
                    </AccessibleText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    className={`flex-1 rounded-2xl py-3 ${isBusy || !session ? "bg-zinc-200" : "bg-red-100"}`}
                    onPress={() => onSimulate("cancelled")}
                    disabled={isBusy || !session}
                  >
                    <AccessibleText className="text-center text-sm font-atkinson-bold text-red-800">
                      Cancelar
                    </AccessibleText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type ModalSectionProps = {
  title: string;
  children: ReactNode;
};

function ModalSection({ title, children }: ModalSectionProps) {
  return (
    <View className="my-5">
      <AccessibleText className="mb-3 text-base font-atkinson-bold text-zinc-900 dark:text-white">
        {title}
      </AccessibleText>
      {children}
    </View>
  );
}
