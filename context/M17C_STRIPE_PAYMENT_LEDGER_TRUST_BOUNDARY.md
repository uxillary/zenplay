# M17C-A — Stripe Payment Ledger & Trust Boundary Foundation

**Status:** Repository foundation implemented; no Stripe dashboard setup, provider credentials, live/test Checkout configuration, deployment, or charge is included. M17A.2 remains the authoritative product decision record. The payment functions are scaffolds that remain unusable until M17C-B configuration is supplied.

## Implemented architecture

```text
authenticated ZenPlay account
  → create-support-checkout (server offer allowlist + configured Stripe Price validation)
  → Stripe-hosted Checkout
  → stripe-support-webhook (raw-body signature verification)
  → unique normalized provider event + server-maintained payment projection
  → later Aura/entitlement derivation (not implemented)
```

Browser code uses only the existing public Supabase URL and publishable key. It has no payment table access and never supplies the account identity, amount, currency, Stripe Price ID, payment status, Aura value, or entitlement. `create-support-checkout` authenticates the Supabase caller, accepts exactly one `offerId`, reads server secrets for its Stripe Price mapping and return URLs, checks that the configured active Stripe Price is in test mode, GBP, and has the expected amount, then creates hosted Checkout with server-controlled metadata. It returns only the Stripe Checkout URL. Missing configuration fails closed; mismatched Prices fail closed. This foundation rejects non-test Stripe API keys and live-mode webhook events, so live payment state cannot be activated through this code.

The success return is a navigation destination only. It does not change payment state. Provider facts enter only through `stripe-support-webhook`, which reads the raw body, verifies the `Stripe-Signature` HMAC and timestamp tolerance before parsing or writing, and rejects requests when the signing secret is absent or invalid. It normalizes supported Checkout, PaymentIntent, refund, and dispute events. Unsupported event types are acknowledged and ignored.

## Schema and event model

Migration `20261004090000_create_support_payment_ledger.sql` adds:

- `public.support_payments`: server-maintained current projection with internal account UUID, provider, internal offer, expected amount/currency, lifecycle state, Checkout Session/PaymentIntent references, and timestamps.
- `public.support_payment_events`: minimal normalized facts with provider event ID/type, provider object reference, optional internal payment/account association, normalized event type, relevant amount/currency, provider occurrence time, and ingestion time. Raw Stripe payloads and billing/card information are not stored.
- `record_verified_support_payment_event(...)`: a service-role-only transaction that checks payment/account association, inserts a unique Stripe event idempotently, and updates the current projection only when a new event is inserted.

Stable internal offer IDs and server-side expected amounts are:

| Internal ID | Amount | Currency | Server Price secret name |
| --- | ---: | --- | --- |
| `support_2_gbp` | 200 minor units | GBP | `STRIPE_PRICE_SUPPORT_2_GBP` |
| `support_5_gbp` | 500 minor units | GBP | `STRIPE_PRICE_SUPPORT_5_GBP` |
| `support_10_gbp` | 1000 minor units | GBP | `STRIPE_PRICE_SUPPORT_10_GBP` |

Normalized events cover initiation, success, failure, cancellation, partial/full refund, dispute opened, dispute won, and dispute lost. Projection states include initiated, paid, partially refunded, refunded, disputed, dispute lost, failed, and cancelled. A dispute stores the prior paid/refund state so a won dispute can restore it. Stripe can report one purchase through multiple distinct success event types; future progression must derive at most once per internal payment, not count raw success events. Refund event amounts use Stripe's cumulative `amount_refunded` snapshot. Aura progression and entitlements are not calculated here.

## Security and account deletion

RLS is enabled and all table privileges are revoked from `public`, `anon`, and `authenticated`. No user-facing payment-history read is exposed in this milestone. Writes use the server-side Supabase admin client; browser roles cannot read, create, update, or delete payment/event rows. Provider events reject update/delete, including from the service role. The existing `private_profiles` migration and owner-only RLS policy are unchanged; its Auth cascade remains intact.

Payment `account_id` deliberately has no foreign key to `auth.users`, so the existing `delete-account` function can continue deleting the Auth user without a cascade deleting potentially retained financial facts. The account UUID may remain linked in payment records after deletion. Retention periods, whether and when that link must be pseudonymised/severed, handling of Stripe customer references, and accounting records require an owner/legal decision before payments launch. This milestone neither blocks deletion nor silently chooses that policy.

## Configuration boundary

Only these values belong in Supabase Edge Function secrets/server configuration, never Vite variables or source control:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SIGNING_SECRET`
- `STRIPE_PRICE_SUPPORT_2_GBP`
- `STRIPE_PRICE_SUPPORT_5_GBP`
- `STRIPE_PRICE_SUPPORT_10_GBP`
- `STRIPE_CHECKOUT_SUCCESS_URL`
- `STRIPE_CHECKOUT_CANCEL_URL`

No secret or Price ID is present in this repository. `supabase/config.toml` disables Supabase JWT verification only for the Stripe webhook function; Stripe signature verification is mandatory inside that handler. Checkout still verifies a signed-in Supabase user itself.

## Deliberately not implemented

No Stripe account/dashboard onboarding, Products/Prices, credentials, webhook subscriptions, deployment, test/live charges, Aura values/levels/forms/algorithm, collectible entitlements, reward reveal, refund policy/legal copy, consumer-consent wording, tax, public profiles, Featured Players, leaderboards, Steam, or subscriptions. Configured customer-facing success/cancel destinations also require owner confirmation.

## M17C-B handoff — Stripe Account & Test Configuration

The owner should complete these manual steps before enabling test Checkout:

1. Confirm Stripe account/business onboarding and that Stripe accepts the described ZenPlay one-off support offer and associated deterministic digital rewards. Resolve any account/product classification questions with Stripe; record acceptance outside the codebase without sharing secrets.
2. Use **test mode** only. Create three one-time GBP Prices for exactly £2, £5, and £10. Confirm each is active and its currency/unit amount matches. Do not create subscriptions or invent a progression value. Record the resulting Price IDs in the corresponding server-only secret names above; do not put them in Vite configuration.
3. Store a test-mode Stripe secret API key as `STRIPE_SECRET_KEY` in the intended Supabase project's Edge Function secrets. Never paste it into source, `.env.example`, or chat.
4. Deploy the migration and the two functions to a confirmed non-production/test project only after reviewing project identity and migration dry-run. Configure a public Stripe webhook destination at the deployed `stripe-support-webhook` function URL, using Stripe's current dashboard flow. Select the Checkout Session completion/expiration/async-payment events, PaymentIntent succeeded/failed events, `charge.refunded`, and dispute created/closed events handled by the code. Verify exact event availability/names against Stripe's current dashboard/API when setting up.
5. Copy that endpoint's test-mode signing secret to `STRIPE_WEBHOOK_SIGNING_SECRET` in Supabase Edge Function secrets. Never use an API key as the signing secret. Confirm invalid signatures are rejected and Stripe retries are idempotent before any broader test.
6. Choose and configure `STRIPE_CHECKOUT_SUCCESS_URL` and `STRIPE_CHECKOUT_CANCEL_URL` as HTTPS destinations on the approved ZenPlay origin. The success page must explain that verified status may take time; redirects are not proof of payment. Owner must supply final customer-facing business/trader identity, support route, and legally reviewed checkout/refund/instant-supply wording separately before launch.
7. Run only Stripe test-mode flows after the test setup is reviewed: each offer, cancellation, delayed/failed test payment where available, duplicate webhook delivery, partial/full refund, dispute lifecycle, and account deletion with payment records. Do not configure live credentials or create real charges as part of M17C-B.

Stripe dashboard labels and event availability can change; verify them manually during setup. Do not invent Price IDs, endpoint secrets, legal text, or business identity values. M17C-B is a manual configuration milestone and is not performed by this implementation.
