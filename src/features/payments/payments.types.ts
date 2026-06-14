export type BillingInterval = "monthly" | "yearly";

export type PaymentPlan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingInterval: BillingInterval;
  features: string[];
};

export type PaymentMethod = "pix" | "boleto" | "card";

export type CheckoutStatus =
  | "draft"
  | "pending"
  | "processing"
  | "approved"
  | "refused"
  | "cancelled"
  | "renewed";

export type DemoPaymentStatus = "approved" | "refused" | "cancelled" | "renewed";

export type DemoCheckoutSession = {
  id: string;
  providerSessionId: string;
  status: CheckoutStatus;
  ownerLabel: string;
};

export type DemoPaymentResult = {
  status: DemoPaymentStatus;
  checkoutSessionId: string;
  paymentEventId: string;
  subscriptionId: string | null;
  title: string;
  description: string;
  timeline: string[];
};
