# AudioFy Backend

# AudioFy Backend API

TypeScript/Express backend that ingests book PDFs, converts them to narrated audio with optional background music, and manages authentication and billing.

This README documents all API endpoints for frontend integration. A live, machine-readable spec is also available at `/docs` (Swagger UI).

## Quick Start

1. Install dependencies
   ```bash
   npm install
   ```
2. Generate Prisma client and apply migrations
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
3. Seed default plans
   ```bash
   npx prisma db seed
   ```
4. (Optional) Start local Redis via Docker
   ```bash
   docker compose -f docker-compose.redis.yml up -d
   ```
   Then set `REDIS_URL=redis://localhost:6379` in `.env`.
5. Run API server
   ```bash
   npm run dev
   ```
6. Run background worker (separate terminal)
   ```bash
   npm run worker
   ```

Server port is configurable via `PORT` in `.env`. Default from config is `4000`. Swagger UI: `http://localhost:<PORT>/docs`.

## Base URL & Auth

- Base path: `http://localhost:<PORT>/api`
- Auth: Bearer JWT in `Authorization` header.
- Email must be verified to access protected endpoints.
- Token TTLs: Access `15m`, Refresh `30d`.

Example header:

```http
Authorization: Bearer <accessToken>
```

## Error Format

- Validation errors: `400 { message: "Validation failed", errors: { ...zodFlatten } }`
- Known errors: `4xx/5xx { message: "..." }`
- Unknown errors: `500 { message: "Internal server error" }`

## Endpoints

### System

- GET `/api/health`
  - Response: `{ status: "ok" }`

### Auth

- POST `/api/auth/register`
  - Body: `{ email, password (>=8), firstName, lastName }`
  - Response: `{ user, accessToken, refreshToken, emailVerified }`
  - Notes: Sends verification email; user can call protected endpoints only after verification.

- POST `/api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ user, accessToken, refreshToken, emailVerified }`

- POST `/api/auth/token/refresh`
  - Body: `{ refreshToken }`
  - Response: `{ user, accessToken, refreshToken }`

- POST `/api/auth/verify-email`
  - Body: `{ token }` (from verification email link)
  - Response: `{ message: "Email verified" }`

- POST `/api/auth/password/forgot`
  - Body: `{ email }`
  - Response: `{ message: "If the email exists, a reset link has been sent." }`

- POST `/api/auth/password/reset`
  - Body: `{ token, password (>=8) }`
  - Response: `{ message: "Password updated" }`

- GET `/api/auth/me` (protected)
  - Headers: `Authorization: Bearer <accessToken>`
  - Response: `{ user: { ...user, profilePhotoUrl } }`

- POST `/api/auth/profile/photo` (protected)
  - Body: `{ imageUrl }` (publicly accessible URL)
  - Response: `{ profilePhotoUrl }`

### Books (protected)

All Books endpoints require a verified user. If the user has no credits, book submission fails with `403`.

- POST `/api/books/submit`
  - Body: `{ pdfUrl, originalFilename?, backgroundAudio? (default true) }`
  - Response: `{ job }` with status `202 Accepted`
  - Behavior: Decrements user credit by 1, enqueues processing job.

- GET `/api/books`
  - Response: `{ jobs: Job[] }` (most recent first)

- GET `/api/books/:jobId`
  - Response: `{ job }`

- GET `/api/books/:jobId/progress`
  - Response: `{ status, currentStep, events }`
  - `events`: chronological list of steps with `progress` 0–100.

- GET `/api/books/:jobId/audio`
  - Response: `{ url, format, backgroundTrack }`
  - Notes: `url` is a signed S3 link (expires in ~1 hour). Returns `400` until the audio is ready.

### Billing

- GET `/api/billing/plans`
  - Response: `{ plans: SubscriptionPlan[] }`
  - Each plan: `{ id, name, description?, priceCents, currency, booksIncluded, additionalBookCents, isActive }`

- POST `/api/billing/checkout` (protected)
  - Choose one flow:
    - Subscription: Body `{ planId, successUrl, cancelUrl }`
    - Credit top-up: Body `{ additionalBooks, successUrl, cancelUrl }`
  - Response: `{ url, sessionId }` (Stripe Checkout)
  - Notes: Frontend should redirect user to `url`.

- POST `/api/billing/portal` (protected)
  - Body: `{ returnUrl }`
  - Response: `{ url }` (Stripe Billing Portal)

- POST `/api/billing/webhook`
  - Stripe webhook endpoint (server-side). Expects raw body and header `Stripe-Signature`.
  - Handles: `checkout.session.completed`, `customer.subscription.updated|deleted`, `invoice.payment_failed|succeeded`.

## Integration Guide

### Auth Flow

1. Register or login → store `accessToken` and `refreshToken`.
2. Use `Authorization: Bearer <accessToken>` for protected endpoints.
3. If a protected call returns `401`, refresh tokens via `/api/auth/token/refresh` using `refreshToken`.
4. If a protected call returns `403 Email verification required`, prompt user to verify.

### Book Conversion Flow

1. Submit `{ pdfUrl }` to `/api/books/submit`.
2. Poll `/api/books/:jobId/progress` until `status=COMPLETED`.
3. Fetch `/api/books/:jobId/audio` and play `url`.

### Billing Flow (Stripe)

1. Fetch plans via `/api/billing/plans`.
2. Create checkout session → redirect user to `url`.
3. After returning to `successUrl`, credits/subscription are updated via webhook.
4. To manage subscription, open `/api/billing/portal` and redirect to `url`.

## Curl Examples

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"email":"user@example.com","password":"Password123","firstName":"Jane","lastName":"Doe"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"user@example.com","password":"Password123"}'

# Submit Book (replace <ACCESS>)
curl -X POST http://localhost:4000/api/books/submit \
   -H "Authorization: Bearer <ACCESS>" \
   -H "Content-Type: application/json" \
   -d '{"pdfUrl":"https://example.com/book.pdf","backgroundAudio":true}'

# Create Checkout (replace <ACCESS>)
curl -X POST http://localhost:4000/api/billing/checkout \
   -H "Authorization: Bearer <ACCESS>" \
   -H "Content-Type: application/json" \
   -d '{"planId":"silver","successUrl":"https://app.example.com/success","cancelUrl":"https://app.example.com/cancel"}'
```

## Notes

- Swagger UI provides complete schemas at `/docs`.
- `backgroundAudio` defaults to `true` and can be disabled per job.
- Audio download URLs expire; re-fetch `/api/books/:jobId/audio` when needed.
- Protected endpoints require verified email; otherwise `403`.

## Services

- PostgreSQL: persistent storage
- Redis: BullMQ queues for processing
- **Tooling**: ts-node-dev, tsconfig-paths, Zod, Stripe SDK, Brevo SDK
- **CI/CD**: GitHub Actions with PM2-based deployments to dev/prod VPS hosts

## Repository Layout

- `src/`
  - `config/`: environment validation and configuration helpers.
  - `modules/`: domain modules such as audio background metadata.
  - `services/`: application services (PDF handling, audio synthesis, etc.).
  - `workers/`: BullMQ worker entry points (`bookProcessing.worker.ts`).
  - `docs/openapi.ts`: canonical OpenAPI schema for Swagger.
- `prisma/`: Prisma schema and migrations.
- `.github/workflows/`: CI/CD definitions.
- `docker-compose.redis.yml`: optional Redis container for local dev.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Redis instance
- AWS account (or S3-compatible storage)
- Stripe and Brevo credentials
- OpenAI API key with access to ChatGPT and TTS models

## Environment Configuration

Copy `.env.example` to `.env` and populate the following (representative subset):

| Variable                                                     | Description                                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `DATABASE_URL`                                               | PostgreSQL connection string                                      |
| `REDIS_URL`                                                  | Redis connection string for BullMQ/queues                         |
| `OPENAI_API_KEY`                                             | OpenAI API key for ChatGPT and TTS                                |
| `TTS_GCP_KEY`                                                | Google TTS key (legacy support; still required by schema)         |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` | IAM credentials for S3                                            |
| `S3_BUCKET_NAME`                                             | Bucket name for generated audio                                   |
| `BACKGROUND_AUDIO_BUCKET`                                    | Optional bucket/prefix for background tracks                      |
| `STRIPE_*`                                                   | Stripe keys and price IDs (web payments)                          |
| `REVENUECAT_*`                                               | RevenueCat API keys for mobile in-app purchases                   |
| `BREVO_API_KEY`                                              | Brevo transactional email API key                                 |
| `EMAIL_FROM_*`                                               | Sender identity for emails                                        |
| `JWT_*_SECRET`                                               | Secrets for access, refresh, email verification, and reset tokens |
| `APP_BASE_URL`                                               | Public base URL of the frontend                                   |

> Keep `.env` files out of source control and rotate credentials regularly.

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Generate Prisma client & run migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
3. **Seed default plans**
   ```bash
   npx prisma db seed
   ```
4. **Start Redis (optional helper)**
   ```bash
   docker compose -f docker-compose.redis.yml up -d
   # when done: docker compose -f docker-compose.redis.yml down
   ```
5. **Run the API server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3001`; Swagger UI at `/docs`.
6. **Run the background worker** (separate terminal)
   ```bash
   npm run worker
   ```

## Background Processing Pipeline

1. **Job Creation**: API requests enqueue a BullMQ job with the PDF URL and metadata.
2. **Download & Extraction**: Worker downloads the PDF, validates it, and extracts raw text via `pdf-parse`.
3. **Text Cleaning**: Heuristics remove non-narrative content; ChatGPT refines and segments text.
4. **Speech Synthesis**: Text chunks feed into OpenAI TTS (`tts-1` / `nova`), producing MP3 narration.
5. **Background Mixing**: ChatGPT selects a track; Fluent-ffmpeg loops/mixes audio at target gain.
6. **Upload & Notifications**: Final MP3 is uploaded to S3; progress events are persisted for the frontend.

## Audio Generation Details

- **Segmentation**: `splitTextIntoChunks` keeps chunks under ~4k characters and prefers sentence boundaries.
- **Narrative Filtering**: Regex-based filters remove TOCs, headers/footers, pagination artifacts.
- **OpenAI Usage**:
  - ChatGPT (`gpt-4o-mini`) cleans narrative segments and picks background tracks.
  - TTS model (`tts-1`, voice `nova`) creates narration; responses arrive as MP3 buffers.
- **Mixing**: ffmpeg mixes narration with looped background audio, auto-adjusting background gain.

## Billing & Credits

- **Stripe** handles web-based subscription purchases and credit top-ups.
- **RevenueCat** manages iOS/Android in-app purchases with automatic subscription sync.
- Both payment gateways update the same subscription database.
- Stripe webhooks (configure via `stripe listen` in development) update subscription status and user credits.
- RevenueCat webhooks sync mobile purchases in real-time.
- Credit consumption is handled during job creation; insufficient credits prevent job submission.

> **📱 Mobile App Payments**: See [REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md) for complete RevenueCat integration guide or [REVENUECAT_QUICKSTART.md](./REVENUECAT_QUICKSTART.md) for quick setup.

## API Documentation

- Swagger UI: `GET /docs`
- OpenAPI source: `src/docs/openapi.ts`
- Keep the schema current to unblock frontend client generation and third-party integrations.

## Testing & Quality

- Typecheck/Lint: `npm run lint`
- Add integration/unit tests with your preferred framework (e.g., Vitest/Jest) as the project grows.
- CI enforces typechecking on every push (see [CI/CD Pipeline](#cicd-pipeline)).

## Deployment

- **Process Manager**: PM2 runs the compiled app (`dist/index.js`).
- **Build**: `npm run build` (TypeScript compile + `tsc-alias`).
- **Ports**:
  - Production service: `PORT=3006`
  - Development/staging service: `PORT=3007`
- Ensure `dist/` output, `.env`, and background assets exist on the server.
- Set up reverse proxy (NGINX/Caddy) or firewall rules to expose ports 3006/3007 as needed.

## CI/CD Pipeline

- Workflow: `.github/workflows/ci-cd.yml`
- Triggers: pushes to `develop` (dev deploy) and `main` (prod deploy), plus manual `workflow_dispatch`.
- Steps:
  1. Checkout repository and set up Node 20.
  2. `npm ci` and `npm run lint` for verification.
  3. Deploy via `appleboy/ssh-action` to the appropriate VPS.
  4. On the VPS: pull latest code, install production deps, build, and restart PM2 (`audio-fy-dev` or `audio-fy-prod`).
- Required GitHub secrets:
  - Development: `DEV_SSH_HOST`, `DEV_SSH_USER`, `DEV_SSH_KEY`, optional `DEV_SSH_PORT`, `DEV_APP_DIR`.
  - Production: `PROD_SSH_HOST`, `PROD_SSH_USER`, `PROD_SSH_KEY`, optional `PROD_SSH_PORT`, `PROD_APP_DIR`.
- The workflow assumes PM2 is installed server-side and the repository has already been cloned into `APP_DIR`.

## Observability & Logging

- Application logging uses `pino` and `pino-http` for structured logs.
- Worker logs highlight job lifecycle events and external API interactions.
- Consider shipping logs to CloudWatch, ELK, or another log aggregator in production.
- For PM2-managed servers, `pm2 logs audio-fy-prod` is useful for quick diagnostics.

## Troubleshooting

- **Jobs stuck in queue**: Verify Redis connectivity and worker process status.
- **Audio generation failures**: Check OpenAI rate limits and ensure `OPENAI_API_KEY` has required model access.
- **Background track issues**: Confirm S3 bucket path matches entries in `src/modules/audio/backgrounds.ts`.
- **Stripe webhook errors**: Confirm webhook signature secrets and that your tunnel/forwarder targets `/api/billing/webhook`.
- **Deployment failures**: Inspect GitHub Actions logs; ensure SSH key permissions and PM2 availability on VPS.

## Security Practices

- Rotate API keys and secrets regularly; use AWS IAM users with least privilege.
- Enforce HTTPS/TLS termination via load balancer or reverse proxy.
- Store JWT secrets securely and avoid logging sensitive data.
- Validate all third-party webhooks with signature verification.
- Monitor dependency updates for security advisories.

---

For questions or contributions, open an issue or submit a pull request. Happy building!
