export const ENDPOINTS = {
  register: "auth/register",
  login: "auth/login",
  logout: "auth/logout",
  refresh: "auth/token/refresh",
  book_submit: "books/submit",
  books: "books",
  me: "auth/me",
  revenuecat_subscriber: "billing/revenuecat/subscriber",
  revenuecat_check_subscription: "billing/revenuecat/check-subscription",
  revenuecat_active_subscriptions: "billing/revenuecat/active-subscriptions",
} as const;
