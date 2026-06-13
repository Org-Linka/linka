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

export type CheckoutStatus = "draft" | "pending" | "approved";
