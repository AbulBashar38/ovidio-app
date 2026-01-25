export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  booksIncluded: number;
  additionalBookCents: number;
  isActive: boolean;
}

export interface CreditPackage {
  id: string;
  credits: number;
  priceCents: number;
  currency: string;
  label: string;
  popular?: boolean;
  savings?: string;
}

export interface CheckoutRequest {
  planId?: string;
  additionalBooks?: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface GetPlansResponse {
  plans: SubscriptionPlan[];
}
