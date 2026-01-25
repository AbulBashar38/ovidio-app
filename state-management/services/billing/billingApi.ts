import { api } from "@/state-management/apiConfig";
import {
  CheckoutRequest,
  CheckoutResponse,
  GetPlansResponse,
} from "@/type/billing";

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
    }),
  });

export const {
  useGetPlansQuery,
  useCreateCheckoutMutation,
  useGetBillingPortalMutation,
} = billingApi;
