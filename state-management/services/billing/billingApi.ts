import { api } from "@/state-management/apiConfig";
import { ENDPOINTS } from "@/state-management/endpoint";
import {
  CheckoutRequest,
  CheckoutResponse,
  GetPlansResponse,
} from "@/type/billing";

interface RevenueCatSubscription {
  productId: string;
  expiresDate: string;
  purchaseDate: string;
  store: string;
  willRenew: boolean;
  periodType: string;
}

interface RevenueCatSubscriberResponse {
  subscriber: {
    original_app_user_id: string;
    subscriptions: Record<
      string,
      {
        expires_date: string;
        purchase_date: string;
        original_purchase_date: string;
        store: string;
        is_sandbox: boolean;
        unsubscribe_detected_at: string | null;
        billing_issues_detected_at: string | null;
      }
    >;
    entitlements: Record<
      string,
      {
        expires_date: string;
        purchase_date: string;
        product_identifier: string;
      }
    >;
    first_seen: string;
    original_application_version: string;
    management_url: string;
  };
}

interface RevenueCatCheckSubscriptionResponse {
  hasActiveSubscription: boolean;
  entitlementId: string;
  expiresDate: string;
}

interface RevenueCatActiveSubscriptionsResponse {
  activeSubscriptions: RevenueCatSubscription[];
}

const billingApi = api
  .enhanceEndpoints({ addTagTypes: ["billing"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getPlans: builder.query<GetPlansResponse, void>({
        query: () => "billing/plans",
        providesTags: ["billing"],
      }),
      createCheckout: builder.mutation<CheckoutResponse, CheckoutRequest>({
        query: (data) => ({
          url: "billing/checkout",
          method: "POST",
          body: data,
        }),
      }),
      getBillingPortal: builder.mutation<
        { url: string },
        { returnUrl: string }
      >({
        query: (data) => ({
          url: "billing/portal",
          method: "POST",
          body: data,
        }),
      }),
      getRevenueCatSubscriber: builder.query<
        RevenueCatSubscriberResponse,
        void
      >({
        query: () => ENDPOINTS.revenuecat_subscriber,
      }),
      checkRevenueCatSubscription: builder.query<
        RevenueCatCheckSubscriptionResponse,
        string | void
      >({
        query: (entitlementId) => ({
          url: ENDPOINTS.revenuecat_check_subscription,
          params: entitlementId ? { entitlementId } : undefined,
        }),
      }),
      getRevenueCatActiveSubscriptions: builder.query<
        RevenueCatActiveSubscriptionsResponse,
        void
      >({
        query: () => ENDPOINTS.revenuecat_active_subscriptions,
      }),
    }),
  });

export const {
  useGetPlansQuery,
  useCreateCheckoutMutation,
  useGetBillingPortalMutation,
  useGetRevenueCatSubscriberQuery,
  useCheckRevenueCatSubscriptionQuery,
  useGetRevenueCatActiveSubscriptionsQuery,
} = billingApi;
