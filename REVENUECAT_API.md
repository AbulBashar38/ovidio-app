# RevenueCat API Documentation

## Overview

This project integrates RevenueCat as a dual payment gateway alongside Stripe, specifically handling iOS/Android in-app purchases for mobile applications. RevenueCat manages subscription lifecycle events, entitlements, and provides a unified API for cross-platform mobile payments.

## Table of Contents

- [Architecture](#architecture)
- [Setup & Configuration](#setup--configuration)
- [API Endpoints](#api-endpoints)
- [Webhook Events](#webhook-events)
- [Service Layer](#service-layer)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Security](#security)

---

## Architecture

### Payment Flow

```
Mobile App (iOS/Android)
    ↓
RevenueCat SDK
    ↓
RevenueCat Backend
    ↓ (webhook)
Your API Server (/api/billing/revenuecat/webhook)
    ↓
Database (UserSubscription)
    ↓
Mobile App (subscription status check)
```

### Key Design Decisions

- **User ID as App User ID**: The application's user ID (cuid format) serves as RevenueCat's `app_user_id`
- **Dual Gateway System**: Stripe handles web payments, RevenueCat handles mobile in-app purchases
- **Unified Database**: Both payment systems share the same `UserSubscription` model
- **Real-time Updates**: Webhook processing ensures immediate subscription status updates

---

## Setup & Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# RevenueCat Configuration
# Get these from RevenueCat dashboard: https://app.revenuecat.com

# Required: Secret API key for backend operations
REVENUECAT_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx

# Recommended: Webhook authorization secret
REVENUECAT_WEBHOOK_SECRET=your_webhook_authorization_value

# Optional: Public API key for client-side SDK
REVENUECAT_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxxxxxxx
```

### Getting Your Keys

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to your project
3. Go to **API Keys** section
4. Copy the **Secret Key** as `REVENUECAT_API_KEY`
5. Set up a webhook in **Integrations** → **Webhooks**
6. Use the webhook URL: `https://your-domain.com/api/billing/revenuecat/webhook`
7. Copy the **Authorization** value as `REVENUECAT_WEBHOOK_SECRET`

### Product Setup

Configure your products in RevenueCat dashboard and ensure they map to your plans:

| RevenueCat Product ID | Plan Name |
| --------------------- | --------- |
| `silver_monthly`      | silver    |
| `gold.monthly`        | gold      |
| `platinum.monthly`    | platinum  |

---

## API Endpoints

Base URL: `/api/billing/revenuecat`

### 1. Get Subscriber Information

**Endpoint:** `GET /subscriber`

**Authentication:** Required (JWT Bearer Token)

**Description:** Retrieves complete subscriber information from RevenueCat for the authenticated user.

**Response:**

```json
{
  "subscriber": {
    "original_app_user_id": "cm4a1b2c3d4e5f6g7h8i9",
    "subscriptions": {
      "gold.monthly": {
        "expires_date": "2026-03-11T10:00:00Z",
        "purchase_date": "2026-02-11T10:00:00Z",
        "original_purchase_date": "2026-01-11T10:00:00Z",
        "store": "app_store",
        "is_sandbox": false,
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      }
    },
    "entitlements": {
      "premium": {
        "expires_date": "2026-03-11T10:00:00Z",
        "purchase_date": "2026-02-11T10:00:00Z",
        "product_identifier": "gold.monthly"
      }
    },
    "first_seen": "2026-01-11T10:00:00Z",
    "original_application_version": "1.0.0",
    "management_url": "https://apps.apple.com/account/subscriptions"
  }
}
```

### 2. Check Subscription Status

**Endpoint:** `GET /check-subscription`

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**

- `entitlementId` (optional): Specific entitlement to check

**Description:** Checks if the authenticated user has an active subscription.

**Response:**

```json
{
  "hasActiveSubscription": true,
  "entitlementId": "premium",
  "expiresDate": "2026-03-11T10:00:00Z"
}
```

### 3. Get Active Subscriptions

**Endpoint:** `GET /active-subscriptions`

**Authentication:** Required (JWT Bearer Token)

**Description:** Retrieves all active subscriptions with detailed information.

**Response:**

```json
{
  "activeSubscriptions": [
    {
      "productId": "gold.monthly",
      "expiresDate": "2026-03-11T10:00:00Z",
      "purchaseDate": "2026-02-11T10:00:00Z",
      "store": "app_store",
      "willRenew": true,
      "periodType": "normal"
    }
  ]
}
```

### 4. Webhook Endpoint

**Endpoint:** `POST /webhook`

**Authentication:** Webhook Authorization Header (see [Security](#security))

**Description:** Receives and processes RevenueCat webhook events.

**Request Headers:**

```
Authorization: Bearer your_webhook_secret
Content-Type: application/json
```

**Request Body:** See [Webhook Events](#webhook-events)

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## Webhook Events

### Supported Event Types

The webhook handler processes the following RevenueCat events:

#### 1. INITIAL_PURCHASE

Triggered when a user makes their first purchase.

**Handler:** `handleInitialPurchase`

**Actions:**

- Creates new `UserSubscription` record
- Sets status to `ACTIVE`
- Records subscription period and product details
- Logs the event in `WebhookEvent` table

#### 2. RENEWAL

Triggered when a subscription renews successfully.

**Handler:** `handleRenewal`

**Actions:**

- Updates `currentPeriodStart` and `currentPeriodEnd`
- Ensures status is `ACTIVE`
- Updates `autoRenew` flag

#### 3. CANCELLATION

Triggered when a user cancels their subscription.

**Handler:** `handleCancellation`

**Actions:**

- Sets status to `CANCELED`
- Records `canceledAt` timestamp
- Sets `autoRenew` to `false`
- Subscription remains active until period end

#### 4. UNCANCELLATION

Triggered when a user reactivates a previously canceled subscription.

**Handler:** `handleUncancellation`

**Actions:**

- Sets status back to `ACTIVE`
- Clears `canceledAt` timestamp
- Sets `autoRenew` to `true`

#### 5. NON_RENEWING_PURCHASE

Triggered for one-time purchases or consumables.

**Handler:** `handleNonRenewingPurchase`

**Actions:**

- Creates subscription with `autoRenew` set to `false`
- Records purchase details

#### 6. SUBSCRIPTION_PAUSED

Triggered when a subscription is paused (Android only).

**Handler:** `handleSubscriptionPaused`

**Actions:**

- Sets status to `PAUSED`
- Retains period information

#### 7. EXPIRATION

Triggered when a subscription expires without renewal.

**Handler:** `handleExpiration`

**Actions:**

- Sets status to `EXPIRED`
- Records final expiration date

#### 8. BILLING_ISSUE

Triggered when there's a problem with billing (payment failed).

**Handler:** `handleBillingIssue`

**Actions:**

- Sets status to `PAST_DUE`
- Subscription may be recovered if payment succeeds

#### 9. PRODUCT_CHANGE

Triggered when a user upgrades or downgrades their plan.

**Handler:** `handleProductChange`

**Actions:**

- Updates `planId` to new plan
- Updates period dates
- Maintains subscription continuity

### Webhook Event Structure

```typescript
interface RevenueCatWebhookEvent {
  event: {
    type: string;
    app_user_id: string;
    original_app_user_id: string;
    product_id: string;
    period_type: string;
    purchased_at_ms: number;
    expiration_at_ms: number;
    store: string;
    environment: string;
    is_trial_conversion: boolean;
    price_in_purchased_currency: number;
    currency: string;
    original_transaction_id: string;
    new_product_id?: string; // For PRODUCT_CHANGE
  };
}
```

---

## Service Layer

### RevenueCatService

**File:** `src/services/revenuecat.service.ts:1`

The `RevenueCatService` class provides a comprehensive interface to the RevenueCat API.

#### Methods

##### `getSubscriber(appUserId: string)`

Fetches complete subscriber information from RevenueCat.

```typescript
const subscriber = await revenueCatService.getSubscriber(userId);
console.log(subscriber.subscriptions);
console.log(subscriber.entitlements);
```

##### `hasActiveSubscription(appUserId: string, entitlementId?: string)`

Checks if a user has an active subscription or specific entitlement.

```typescript
const hasActive = await revenueCatService.hasActiveSubscription(userId);
const hasPremium = await revenueCatService.hasActiveSubscription(
  userId,
  "premium",
);
```

##### `getActiveSubscriptions(appUserId: string)`

Returns detailed information about all active subscriptions.

```typescript
const subscriptions = await revenueCatService.getActiveSubscriptions(userId);
subscriptions.forEach((sub) => {
  console.log(`${sub.productId} expires ${sub.expiresDate}`);
});
```

##### `grantPromotionalEntitlement(appUserId: string, entitlementId: string, duration: string)`

Grants promotional access to a user (for testing or promotions).

```typescript
await revenueCatService.grantPromotionalEntitlement(
  userId,
  "premium",
  "P1M", // ISO 8601 duration: 1 month
);
```

##### `revokePromotionalEntitlement(appUserId: string, entitlementId: string)`

Revokes a previously granted promotional entitlement.

```typescript
await revenueCatService.revokePromotionalEntitlement(userId, "premium");
```

##### `deleteSubscriber(appUserId: string)`

Deletes all subscriber data (for GDPR compliance or testing).

```typescript
await revenueCatService.deleteSubscriber(userId);
```

##### `updateSubscriberAttributes(appUserId: string, attributes: object)`

Updates custom attributes for a subscriber.

```typescript
await revenueCatService.updateSubscriberAttributes(userId, {
  displayName: "John Doe",
  email: "john@example.com",
});
```

##### `parseWebhookEvent(event: any)`

Parses and validates webhook event payloads.

```typescript
const parsed = await revenueCatService.parseWebhookEvent(webhookBody);
console.log(parsed.type, parsed.userId, parsed.productId);
```

---

## Database Schema

### UserSubscription Model

**File:** `prisma/schema.prisma:1`

```prisma
model UserSubscription {
  id                   String             @id @default(cuid())
  userId               String
  planId               String
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  autoRenew            Boolean            @default(true)
  booksRemaining       Int                @default(0)
  stripeSubscriptionId String?            @unique
  canceledAt           DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  user                 User               @relation(fields: [userId], references: [id])
  plan                 SubscriptionPlan   @relation(fields: [planId], references: [id])
}
```

**Note:** The `stripeSubscriptionId` field is reused for RevenueCat's `original_transaction_id` to maintain a unified subscription database.

### SubscriptionStatus Enum

```prisma
enum SubscriptionStatus {
  ACTIVE      // Currently active and valid
  PAST_DUE    // Payment failed, grace period
  CANCELED    // User canceled, active until period end
  EXPIRED     // Subscription ended
  PAUSED      // Temporarily paused (Android)
}
```

### WebhookEvent Model

```prisma
model WebhookEvent {
  id        String   @id @default(cuid())
  provider  String   // "revenuecat" or "stripe"
  eventType String   // Event type (e.g., "RENEWAL")
  payload   Json     // Full webhook payload
  createdAt DateTime @default(now())
}
```

---

## Testing

### Test Script

**File:** `test-revenuecat.js:1`

The project includes a standalone testing script for validating RevenueCat integration.

**Usage:**

```bash
# Set up test user ID in the script
# Make sure .env is configured
# Ensure server is running on localhost:3001

node test-revenuecat.js
```

**What it tests:**

1. ✅ Direct RevenueCat API connectivity
2. ✅ Subscriber information retrieval
3. ✅ Webhook endpoint with mock event
4. ✅ Webhook authentication

### Testing Protected Endpoints

Protected endpoints require authentication. Use curl or Postman:

```bash
# Get authentication token
TOKEN="your_jwt_token_here"

# Test subscriber endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/billing/revenuecat/subscriber

# Test subscription check
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/billing/revenuecat/check-subscription

# Test active subscriptions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/billing/revenuecat/active-subscriptions
```

### Testing Webhooks Locally

Use RevenueCat's webhook testing feature or simulate with curl:

```bash
curl -X POST http://localhost:3001/api/billing/revenuecat/webhook \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "type": "INITIAL_PURCHASE",
      "app_user_id": "your_user_id",
      "product_id": "gold.monthly",
      "period_type": "normal",
      "purchased_at_ms": 1707649200000,
      "expiration_at_ms": 1710241200000,
      "store": "app_store",
      "environment": "PRODUCTION",
      "original_transaction_id": "1000000123456789"
    }
  }'
```

---

## Security

### Webhook Verification

**File:** `src/middleware/verify-revenuecat-webhook.ts:1`

All webhook requests are verified using the `verifyRevenueCatWebhook` middleware.

**How it works:**

1. Extracts `Authorization` header from request
2. Expects format: `Bearer YOUR_WEBHOOK_SECRET`
3. Compares against `REVENUECAT_WEBHOOK_SECRET` environment variable
4. Returns 401 Unauthorized if validation fails

**Setup:**

```typescript
// In RevenueCat dashboard webhook configuration
Authorization: Bearer your_secret_value_here

// In your .env file
REVENUECAT_WEBHOOK_SECRET=your_secret_value_here
```

### Best Practices

1. **Keep API Keys Secret**: Never commit API keys to version control
2. **Use HTTPS**: Always use HTTPS for webhook endpoints in production
3. **Validate Event Data**: The webhook handler validates all incoming events
4. **Log Events**: All webhook events are logged to `WebhookEvent` table for auditing
5. **Rate Limiting**: Consider implementing rate limiting on public webhook endpoints
6. **Idempotency**: Webhook handlers should be idempotent (safe to retry)

### Error Handling

All endpoints implement comprehensive error handling:

- **400 Bad Request**: Invalid input or missing parameters
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: User or subscription not found
- **500 Internal Server Error**: Server-side errors (logged for debugging)

---

## Integration Guide

### Mobile App Setup

1. **Install RevenueCat SDK**

   ```bash
   # iOS (Swift Package Manager)
   # Add: https://github.com/RevenueCat/purchases-ios

   # Android (Gradle)
   implementation 'com.revenuecat.purchases:purchases:7.+'
   ```

2. **Initialize SDK**

   ```swift
   // iOS
   Purchases.configure(withAPIKey: "YOUR_PUBLIC_API_KEY", appUserID: userId)

   // Android
   Purchases.configure(this, "YOUR_PUBLIC_API_KEY", userId)
   ```

3. **Make Purchase**

   ```swift
   // iOS
   Purchases.shared.purchase(package: package) { transaction, customerInfo, error, userCancelled in
     if let error = error {
       // Handle error
     } else {
       // Purchase successful
       // Check customerInfo.entitlements
     }
   }
   ```

4. **Check Subscription Status**

   Call your API endpoint to verify subscription:

   ```swift
   // GET /api/billing/revenuecat/check-subscription
   // with user's JWT token
   ```

### Backend Integration

The backend integration is already complete. Key files:

- ✅ Routes: `src/modules/billing/revenuecat.routes.ts:1`
- ✅ Controller: `src/modules/billing/revenuecat.controller.ts:1`
- ✅ Service: `src/services/revenuecat.service.ts:1`
- ✅ Middleware: `src/middleware/verify-revenuecat-webhook.ts:1`

---

## Troubleshooting

### Common Issues

**1. Webhook not receiving events**

- Verify webhook URL is publicly accessible
- Check `REVENUECAT_WEBHOOK_SECRET` matches dashboard
- Ensure HTTPS is used in production
- Check webhook logs in RevenueCat dashboard

**2. Subscription not updating**

- Check webhook event logs in database (`WebhookEvent` table)
- Verify product IDs match the mapping in `mapProductToPlan`
- Check for errors in application logs

**3. Authentication failures**

- Verify JWT token is valid and not expired
- Check user ID matches RevenueCat `app_user_id`
- Ensure `Authorization: Bearer <token>` header format

**4. Subscriber not found**

- User must make at least one purchase in RevenueCat
- Verify user ID is correct (check casing, spaces)
- Test with RevenueCat sandbox environment first

### Debug Mode

Enable detailed logging:

```typescript
// In src/services/revenuecat.service.ts
// Add console.log statements to track API calls

// Check webhook event logs
SELECT * FROM "WebhookEvent"
WHERE provider = 'revenuecat'
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [RevenueCat API Reference](https://docs.revenuecat.com/reference)
- [Webhook Events Reference](https://docs.revenuecat.com/docs/webhooks)
- [iOS SDK Guide](https://docs.revenuecat.com/docs/ios)
- [Android SDK Guide](https://docs.revenuecat.com/docs/android)

---

## Contributing

When adding new RevenueCat features:

1. Update the service layer (`revenuecat.service.ts`)
2. Add controller handlers (`revenuecat.controller.ts`)
3. Define routes (`revenuecat.routes.ts`)
4. Update database schema if needed (`prisma/schema.prisma`)
5. Add tests to `test-revenuecat.js`
6. Update this documentation

---

## License

This integration is part of the Audiofy Backend project.

---

_Last Updated: 2026-02-11_
