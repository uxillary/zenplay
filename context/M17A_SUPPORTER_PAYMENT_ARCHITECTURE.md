# M17A — Supporter Monetisation and Payment Architecture

**Status:** Discovery recommendation; no provider account, product, price, schema, payment code, or deployment is created by this milestone. Provider facts checked against official documentation on 3 October 2026; commercial acceptance, exact fees, payout eligibility, and legal treatment must be confirmed before implementation.

> **Superseded owner decisions:** [M17A.2](M17A2_SUPPORTER_MONETISATION_DECISIONS.md) selects Stripe and £2 / £5 / £10 one-off offers, and names the supporter identity Aura. M17A remains security/payment architecture research; its conditional product recommendations and open provider/pricing conclusions are historical. Current Stripe acceptance and legal/provider checks remain necessary.

## Decision summary

- Keep all seven games free, account-optional for play, offline-capable, ad-free, and fully accessible.
- Start with an optional **one-off Support ZenPlay purchase** with one or a few clearly priced contribution choices. Describe it as a purchase/support payment, not a charitable donation or tax-deductible gift. No subscription or paid cosmetic store at launch.
- Require a signed-in ZenPlay account before checkout. Play remains account-free. This gives support a restorable owner and makes account deletion/refund handling coherent; explain the requirement before checkout.
- Prefer Paddle as the initial provider to evaluate, subject to vendor approval and operator eligibility. Its merchant-of-record service reduces cross-border indirect-tax and buyer-support operations. Lemon Squeezy is a close alternative. Stripe is a strong direct processor but leaves ZenPlay with more tax, refund, dispute, and buyer-support responsibility.
- Do not launch “ZenPlay Stars.” Use plain-language “total verified support” only if lifetime recognition proves useful after user research. No balance, points, tiers, or spending mechanic.
- Initial benefit: a modest, text-labelled supporter badge in the signed-in Profile, with no public visibility and no paid gameplay or accessibility feature. Defer cosmetics until each option passes accessibility review.
- Defer public supporter spotlight, subscriptions, guest purchases, cloud save/profile sync, and a store/catalog.
- Credit ownership and supporter status only after a verified server webhook. Browser redirects and client state are never proof of payment.

## 1. Existing concept audit

Repository evidence as inspected on 3 October 2026: src/components/SupporterExperience.tsx and src/lib/supporterDemo.ts are static, explicitly fictional prototype content. The Profile links to the prototype. There is no payment SDK, checkout, payment table/migration, webhook function, real Stars calculation, cosmetics entitlement, or public supporter endpoint. Current Supabase storage is limited to private_profiles; current delete-account removes Auth user and cascades that profile. README and service inventory report M16B production account deletion as owner-verified. These reported production facts were not independently queried from hosted services in this discovery task.

| Concept | Current state | M17A assessment |
| --- | --- | --- |
| Local profile and account | Implemented: local profile is device-only; optional Supabase account/private profile is separately and explicitly connected. | Preserve separation. Account is required only for a recoverable payment, never for play. |
| Support page / amounts / milestones | Static fictional prototype; amounts and thresholds are examples, not real offers/prices. | Remove from any launch copy until actual offer, price, terms, and provider are approved. |
| ZenPlay Stars | Not implemented. M13 calls cumulative recognition approved in principle, but the name, conversion, thresholds, and refund treatment are provisional. | Do not launch; see section 5. |
| Lifetime support recognition | Product principle in M13, not operational behavior. | Defer lifetime totals. A verified transaction history is enough initially. |
| Supporter badge / flair | Prototype examples only; no entitlement system. | One optional, text-labelled profile badge is a low-risk first recognition. |
| Cosmetic entitlements | Proposed only; no card backs, felt, boards, or themes implemented. | Defer purchase-for-cosmetic catalog. If later added, keep free default and separate cosmetic selection from accessibility settings. |
| Spotlight / public profiles | Fictional spotlight component only; no publication or remote public schema. M13 contains extensive proposed rotation and consent detail. | Defer until there is a concrete community need, moderation owner, age approach, and privacy process. |
| One-off purchases | Proposed only; none exist. | Recommended initial model: one-off support purchase with transparent amount and description. |
| Subscriptions | M13 explicitly did not propose one; providers can support them. | No recurring billing until users request it and cancellation/support obligations are resourced. |
| Cross-device restoration | No purchase state exists. Current remote profile is not cached for offline use. | Restore from signed-in account by fetching server-derived status. Do not promise restore before this flow ships. |

**Confirmed principles:** seven games remain free; no account/payment needed to play; offline game behavior remains; no ads, gameplay advantages/paywalls, paid hints/lives/energy, gambling, scarcity, pressure, or paid accessibility. Support and profiles remain optional. **Open:** final offer wording, amount/currency, whether any cosmetic is included, retention schedule, minimum age/guardian approach, privacy disclosures, refund policy, and final provider acceptance. M13 spotlight weighting and thresholds are illustrative, not approval.

## 2. Initial monetisation model

| Model | Comprehension | Accessibility / pressure | Complexity, refunds, account and offline | Audience fit |
| --- | --- | --- | --- | --- |
| One-off support purchase | Very clear if amount, one-off nature, and purpose are explicit. Use a small set of fixed choices; avoid an open amount field initially. | Lowest pressure when entry is quiet in Profile, no repeated prompt, no deadline, no progress bar, and no comparative spend cues. | Lowest operational complexity. Still needs receipts, refund/dispute handling, verified events and support. Account is recommended for restore. Purchase confirmation needs network; gameplay works offline. | Best fit for calm, optional support and simplest first release. |
| Cosmetic purchase | Clear only when user can preview exactly what changes and what remains free. | Can remain optional, but store/catalog, scarcity and visual hierarchy can create pressure. Accessibility risk depends on each asset. | Requires catalog, ownership, equip state, cross-device restoration, compatibility/fallback, refunds/revocation, and visual QA. Requires account for durable ownership; cached entitlement can be stale offline. | Possible later only for clearly decorative, accessible items. Not needed to validate support. |
| Recurring support | Must communicate amount, interval, renewal, cancellation and failed payment clearly. | Repeated charge and cancellation friction can pressure users; unsuitable without strong user demand and calm reminders. | Highest lifecycle burden: renewals, cancellation, dunning, failed/retried payments, portal, recurring tax/receipts, refund and dispute behavior. Account is mandatory in practice. | Defer; disproportionate to a small free game collection. |

**Recommendation:** begin with one-off support as a simple purchase that provides thanks and, if desired, an understated private badge. Do not call it a donation unless legal/accounting advice confirms that characterization. Avoid promising proceeds are tax-deductible. Amounts are intentionally undecided; all M13 numbers remain illustrative.

## 3. Provider comparison and recommendation

Provider documentation is time-sensitive. The following is a high-level comparison from official sources reviewed on **3 October 2026**, not a quote or eligibility decision. Fees depend on transaction details and can change.

| Provider | Model / taxes | Checkout, platform, lifecycle | Fees and individual-operator trade-off |
| --- | --- | --- | --- |
| **Paddle** | Merchant of record (MoR): Paddle says it is seller on record and calculates, collects and remits transaction taxes in supported markets. It handles buyer-facing payment/refund/dispute workflows under its terms. | Hosted, overlay or inline checkout; REST API, webhooks and separate sandbox. Checkout/webhook custom data can carry a ZenPlay internal identifier. Strong subscription and hosted customer-portal support if ever needed. | Current published standard checkout fee found: 5% + US$0.50; small-ticket/invoice exceptions may apply. High fixed fee on low amounts. UK/global seller eligibility and payout arrangements require approval and verification. |
| **Lemon Squeezy** | MoR for digital products; claims global sales-tax/VAT calculation, collection and remittance. | Hosted/overlay checkout, API, signed webhooks, test mode, custom checkout data; customer billing portal/receipts/refund facilities. Good digital-product fit. | Published base fee 5% + US$0.50; official fee docs add 1.5% international and some payment-method/subscription charges, and payout fees can vary. Low-value support payments are fee-sensitive. Seller/store activation is required. |
| **Stripe** | Direct payment processor; ZenPlay remains seller and responsible for its tax position, consumer terms, refunds, disputes, records and support. Stripe Tax is an additional product/service and does not make Stripe MoR. | Hosted Checkout, robust API, metadata, signed webhooks, test mode, receipts and customer portal; excellent flexibility and UK availability. | UK standard card pricing currently lists 1.5% + 20p for standard UK cards, with higher international/premium/FX rates; dispute fees and unrecovered original processing fees on refunds can apply. Lower base processing cost, but ZenPlay owns more compliance and operations. |

**Recommendation: Paddle, provisionally.** For a Scotland/UK individual operator with international web users and digital purchases, the MoR model is worth more than the headline fee savings because it can reduce global indirect-tax and buyer-payment support burden. Paddle's developer API, sandbox, webhook event lifecycle, custom metadata and hosted portal align with a small server-verified integration. Its recurring capabilities are available but should remain unused. The fixed fee makes tiny voluntary amounts unattractive, so owner should compare net proceeds on plausible prices before committing.

Paddle is not automatically the correct legal or business choice: confirm it accepts the operator and ZenPlay's specific “support” product, what seller disclosures it requires, payout currency/timing/minimums/fees, refund discretion, account reserves, and whether the buyer contract and tax treatment fit the actual offer. If rejected or poor fit, evaluate Lemon Squeezy on the same terms. Choose Stripe only if the owner is ready to own the relevant tax/accounting and buyer support responsibilities. Do not create provider accounts or products in M17A.

| Capability | Paddle | Lemon Squeezy | Stripe |
| --- | --- | --- | --- |
| UK seller availability | Verify onboarding and payout eligibility with provider. | Verify store approval and payout eligibility. | UK supported; verify business/individual account requirements. |
| VAT/sales tax | MoR handling for supported transactions; operator still accounts for payout income and other taxes. | MoR handling for platform transactions; operator still accounts for payout income and other taxes. | Seller remains responsible; Stripe Tax is a tool, not MoR. |
| Checkout and refunds | Hosted/overlay; provider-supported refund workflows; review provider terms and buyer process. | Hosted/overlay; refund controls and customer portal. | Hosted checkout; seller initiates refunds and handles disputes. |
| Webhooks / idempotency | Signed notifications; versioned API, webhook simulator/retries. Persist provider event and transaction IDs; enforce own DB uniqueness. | Signed X-Signature; test mode and webhook replay/simulation. Persist own idempotency records. | Signed webhook events and event IDs; robust test tooling. Persist own idempotency records. |
| Internal account link | Checkout custom data; send only opaque ZenPlay account ID and server-generated checkout reference. | Checkout custom data available on webhook. | Metadata on objects; send opaque internal ID only. |
| Customer data | Provider handles checkout/receipt details; ZenPlay should retain provider customer ID only if needed. | Provider stores customer/order data; portal available. | Direct processor exposes more control/data and corresponding obligations. |
| Future subscriptions | Strong lifecycle + portal, but no launch subscription. | Supports subscriptions; additional fee can apply. | Stripe Billing supports subscription lifecycle and portal; seller has more responsibility. |

Official sources (accessed 3 October 2026): [Paddle developer overview](https://developer.paddle.com/get-started/how-paddle-works/), [Paddle sandbox](https://developer.paddle.com/sdks/sandbox/), [Paddle supported countries and tax](https://developer.paddle.com/concepts/sell/supported-countries-locales/), [Paddle pricing / terms](https://www.paddle.com/legal/terms), [Paddle custom data](https://developer.paddle.com/build/transactions/custom-data/); [Lemon Squeezy pricing](https://www.lemonsqueezy.com/pricing), [fees](https://docs.lemonsqueezy.com/help/getting-started/fees), [VAT](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat), [webhooks](https://docs.lemonsqueezy.com/help/webhooks), [test mode](https://docs.lemonsqueezy.com/help/getting-started/test-mode); [Stripe UK pricing](https://stripe.com/gb/pricing), [Checkout](https://docs.stripe.com/payments/checkout/quickstarts), [metadata](https://docs.stripe.com/api/metadata), [refunds](https://docs.stripe.com/refunds), [webhooks](https://docs.stripe.com/webhooks).

## 4. Secure purchase architecture

The proposed flow is appropriate with one clarification: checkout creation must be server-controlled and a webhook is the only payment authority.

1. Signed-in user selects a server-defined offer in Profile. Browser sends an offer key, not a price, total, currency, entitlement, or provider ID it can choose freely.
2. Supabase Edge Function validates the user JWT, loads an enabled offer from server configuration, creates a random internal checkout intent tied to auth.uid(), and calls provider API with server credentials. It passes only the opaque account UUID and intent UUID as custom metadata. Function returns the provider checkout URL.
3. Browser navigates to provider-hosted checkout (prefer same-tab redirect for a simple accessible flow; preserve a return route). Provider collects payment details and sends its receipt. ZenPlay never receives raw card data.
4. Provider sends an event to a dedicated public Edge Function. That function reads raw request bytes, verifies signature using a server-only secret, validates event type, environment, amount/currency/offer/intent, and records event + financial state transactionally/idempotently.
5. The authenticated browser return page displays “Checking payment” and polls the authenticated status endpoint; ?payment=success is only a navigation hint.
6. Authenticated user reads their own derived support state via an Edge Function or tightly restricted RLS view. Never allow browser writes to ledger, provider mapping, derived status, or entitlement rows.

| Boundary | Responsibilities |
| --- | --- |
| Browser | Offer choice; authenticated checkout request; provider-hosted redirect; show pending/failed/verified state; read own support snapshot; cache display snapshot cautiously. Never set payment success, totals, Stars, badge ownership, or cosmetic ownership. No payment SDK is needed for hosted redirect. |
| Supabase Edge Functions | JWT validation; trusted offer/checkout intent; secret-bearing provider API request; raw-body webhook signature verification; event validation/deduplication; ledger/status derivation; authenticated own-state read; account deletion coordination. |
| Supabase Postgres | Durable intent, provider event/idempotency, payment ledger, customer mapping if needed, derived entitlements; transaction constraints and RLS. Service-role access only inside trusted functions. |
| Provider | Hosted payment entry, card credentials, buyer identity/billing, tax calculation/remittance as MoR, receipts, payment confirmation, refund/dispute channels and webhook delivery. |
| Secrets | Provider API key and webhook signing secret in Supabase Edge Function secret store, separate sandbox/live values. Never in Vite browser variables, browser storage, logs, or source. Rotate and scope where provider permits. |

## 5. Stars recommendation

**Remove Stars from the launch design.** They add a conversion rule, rounding/currency questions, refund corrections, threshold expectations, and a game-like number without giving players useful value. M13's “not spendable” safeguard is good but does not make the concept necessary. Current Stars are fictional prototype content only. Do not migrate or promise example counts.

If users later ask for recognition, show a factual “verified support” marker, perhaps “Supported ZenPlay” with a support date. Do not expose a cumulative currency-converted total: exchange rates, taxes, partial refunds and multiple currencies make that number confusing. If lifetime aggregate recognition is later reintroduced, describe exactly whether it means gross or net successful contributions, include reversals, show plain text rather than star-only graphics, and keep it non-transferable/non-spendable. That is a new product decision, not an M17A commitment.

## 6. Entitlements and accessibility

**Initial entitlement set:** one optional, private Profile badge reading “ZenPlay supporter” (text plus nonessential icon), granted after verified payment. No tier, threshold ladder, public badge, or gameplay-screen decoration is required. Consider whether recognition itself is sufficient before adding paid cosmetics.

Future cosmetics may include a card back, felt/table appearance, board theme, or profile flair only after user testing and accessibility review. Free defaults remain available. Every cosmetic must preserve legibility, card/suit identity, board state, contrast, labels, large text/pieces, high contrast, reduced motion, Simple Mode, keyboard behavior, screen-reader semantics, zoom/reflow and touch targets. No paid item changes rules, information, hints, lives, game state or interaction ease. Offer a preview and a one-step return to default. Avoid limited-time cosmetics and purchase streaks.

## 7. Account requirement

Require an authenticated ZenPlay account before creating checkout. The account stays optional for all play and local data. Benefits: verified ownership is linked to stable auth.users.id, support can be restored after reinstall/on another device, refund requests can be associated, and account deletion has a defined payment path. Avoid guest checkout plus unimplemented email claiming/recovery, which creates weak ownership and support risk.

Tell the user before checkout that purchases attach to their account and require signing in to restore. The provider collects the receipt email; it may differ from their ZenPlay email. Do not silently connect local profile fields or upload local profile ID, game activity, settings, or accessibility preferences. Delete account must not cancel or erase legally required provider transaction records; explain the separate treatment before confirmation.

## 8. Minimum conceptual data model (no migration in M17A)

Store money as integer minor units plus ISO currency; preserve provider-reported gross, tax and refund amounts where needed for reconciliation. Never assume amounts across currencies can be summed. Do not store card number, security code, bank credentials, billing address, receipt body, or unnecessary customer email.

| Entity (illustrative) | Purpose / authoritative writer | Browser access | Retention / deletion |
| --- | --- | --- | --- |
| support_checkout_intents | Server-created offer snapshot, account UUID, random intent UUID, environment, expected amount/currency, status, expiry. Writer: checkout function. | Owner can read minimal status via function; no browser insert/update/delete. | Abandoned/expired intents cleaned on a defined short schedule; keep only if needed for fraud/reconciliation. FK to Auth user may cascade only if no financial record is attached. |
| payment_events | Append-only normalized financial events: provider transaction/event IDs, type, amount/currency, occurrence/receipt time, reference to internal intent/user, test/live flag, minimal provider data hash. Writer: verified webhook function only. | No direct browser read/write; expose safe derived summary. | Retain/pseudonymise under approved accounting, dispute and privacy schedule. Link may be nulled/pseudonymised on account deletion; immutable financial facts may remain where required. |
| webhook_receipts / idempotency | Unique provider + environment + event ID, received/processed outcome, retry count/error class. Writer: webhook function. | No browser access. | Keep minimally for dedupe/replay period; redact payload and avoid secrets/PII. Financial event identity may need longer retention. |
| provider_customer_links (optional) | Provider customer ID ↔ Auth UUID for portal/refund support. Writer: verified webhook/function. | No direct access; function may issue a short-lived portal URL if needed. | Delete or sever account mapping during account deletion where provider/legal obligations allow; provider retains its own records. |
| supporter_state (derived view/table) | Current verified support flag, non-reversed support date, entitlement keys, revision/as-of. Recomputed from event ledger. Writer: database procedure/function only. | Authenticated owner read via function or SELECT RLS. No browser writes. | Remove on Auth deletion or detach from pseudonymised ledger. Never use as sole financial record. |
| entitlements (can be folded into derived state initially) | Explicit grant/revoke with stable key, source event/rule version and timestamps. Writer: trusted server. | Owner may read state only. | Derived/rebuildable. Revoked on full refund/chargeback if it only represents supporter recognition; retain grant/revoke evidence alongside payment ledger as required. |

Avoid adding a generic payment-customer table or separate entitlement table until implementation requires it. Keep profile RLS and private_profiles schema separate. Foreign keys and deletion behavior must be tested before migration; retain a pseudonymous ledger only with approved purpose and retention.

## 9. Webhook security and event processing

- Accept only HTTPS POST at a dedicated Edge Function; enforce provider signature over the exact raw body with constant-time comparison and correct timestamp/replay validation if supported. Reject invalid signatures before parsing/trusting payload.
- Store webhook/API secrets only in function secret storage. Use distinct test/live endpoint secrets, credentials and product IDs; fail closed on environment mismatch.
- Insert a unique (provider, environment, event_id) receipt before applying effects, in a transaction. A duplicate returns 2xx after confirming the original processing result; it never grants twice. Use provider transaction ID uniqueness too.
- Validate schema, event type, event status, product/offer, currency, amount, internal intent existence/expiry, and opaque auth UUID. Ignore client redirect claims. Treat provider metadata as an untrusted lookup hint and require it to match the server-created intent and expected offer. Never use arbitrary metadata as a target account without a valid intent.
- Keep event facts append-only. Derive current state from ordered events and effective timestamps/revisions. Do not assume delivery order. A refund/dispute may arrive before a related event; record it as pending/reconcile from provider API rather than granting or deleting history. Reconciliation job/operator path should fetch authoritative provider transaction state when events conflict.
- Checkout abandoned/expired: intent becomes expired; no entitlement. Failed payment: no grant. Pending/asynchronous method: remain pending until provider says paid. Do not create a local success state from redirect.
- Refund: record full/partial adjustment as a new event; recompute net eligible support. For this initial badge, revoke on full refund; partial refund has no cosmetic threshold effect because none exists. Keep recognition only if a successful net payment remains, under a published policy.
- Chargeback/dispute: record disputed state and provisionally revoke badge while unresolved; notify via calm account status if appropriate. If dispute is reversed in ZenPlay's favour, restore derived state from events. Never erase original charge/refund/dispute events.
- Malformed metadata, unknown user, deleted account, or unmatched intent: record minimal quarantine/error state; do not grant. Return a controlled response and alert only operators through a private operational channel. Avoid logging raw payloads, email, full address, secrets, or card data.
- Test duplicate, invalid signature, replay, malformed body, wrong amount/currency, unknown intent/user, refund-before-payment ordering, repeated/out-of-order refunds, chargeback/reversal and transient database failure before production.

## 10. Refunds, disputes and status behavior

| Provider event / outcome | Ledger | Badge / support state |
| --- | --- | --- |
| Checkout created/abandoned/expired | Keep minimal intent status; no payment event. | No supporter status. |
| Payment confirmed | Append verified payment event with gross amount, currency, provider transaction ID and necessary tax/fee facts. | Grant badge and set supported date after transaction commit. |
| Failed/pending payment | Record final failure or pending state if received; no successful payment event until paid. | No badge while pending/failed. |
| Partial refund | Append adjustment referencing original transaction; never mutate/delete original. | Badge remains while any eligible net support remains; no Stars or amount tiers. |
| Full refund | Append full adjustment and provider reason category where needed. | Revoke badge and mark payment reversed; keep ledger. |
| Dispute/chargeback | Append dispute/open and subsequent outcome events. | Temporarily revoke badge while open; restore only after favorable reversal/resolution. |
| Duplicate delivery | Idempotency record identifies prior event. | No duplicate effect. |

Publish a short buyer-facing refund/support policy before sales. Provider MoR terms do not remove the need to understand consumer rights and ZenPlay's own representations. Decide whether refunds are self-service through provider or routed through ZenPlay support; make that route and expected response clear.

## 11. Offline model

- Games, saves, settings, local profile and accessibility stay as today and never depend on payment connectivity.
- Account supporter state is fetched when online and may be cached locally as a display/use snapshot tagged with account ID, revision, and fetched time. Do not cache provider credentials or receipts.
- A verified cosmetic already downloaded may remain usable offline. Cached entitlement is a convenience, not authority; it can be stale after refund/chargeback until next sync. For the initial non-gameplay badge, stale display is tolerable but reconcile on reconnect and sign-out.
- On sign-out, hide account-backed recognition and clear the in-memory state; do not transfer it to another local profile. On account deletion, clear local supporter cache on that device as part of successful sign-out/deletion response. Other offline devices may retain stale visual state until they reconnect; this cannot affect gameplay.
- Network failure must show a calm “Support status unavailable while offline” message and retry route, never block Home/gameplay. No offline purchase claims or queued payment intents.

## 12. Minimal supporter journey

Profile → **Support ZenPlay** → plain-language explanation and fixed one-off options → sign in/create account if needed (with reason stated) → provider-hosted checkout → return to Profile → “Checking payment” until verified webhook → confirmation and optional badge. Same-tab navigation is simplest; return path must survive PWA installation and account session. A second tab is acceptable only if accessible and clearly explained.

Cancelled/failed checkout returns to a neutral state with no guilt copy. If checkout says paid but webhook is delayed, show “Payment is awaiting confirmation. Your games remain available. Check status again later.” Provide a retry/status refresh that cannot create another payment. On another device, sign in and fetch current server state. Signed-out visitors may read that ZenPlay is free and support is optional, but must sign in before checkout. Keep Home a game library; no banners, nags, timers, defaults, or “only X left” language.

## 13. Public spotlight

Defer. It is not necessary to accept support and creates moderation, consent withdrawal, name impersonation/abuse, age/minor safeguards, public API/cache, and ongoing operations. Do not publish profiles, supporter names, amounts, favourite games, statistics, or dates in M17. If revisited, require separate per-field opt-in, preview, moderation and takedown owner, withdrawal SLA, age/privacy review, and ensure private supporters receive equal benefits.

## 14. Privacy, account deletion and retention

Payment introduces provider customer ID, order/transaction ID, amount/currency/tax/refund/dispute data, provider-collected name/email/billing/location/device/IP/fraud signals, support correspondence, webhook event IDs and possibly a support-account link. ZenPlay should receive only webhook facts needed for entitlement/accounting/support; do not copy card data, billing address, or provider receipt email unless an approved support use requires it. Avoid analytics/cookies and payment tracking pixels. Document provider role, categories, international transfers, retention, contact route and account deletion effects in privacy notice before launch; review cookie/storage consent applicability for any provider scripts. Hosted full-page checkout minimizes browser exposure.

M16B currently deletes Auth user and cascades private_profiles. With payments, deletion flow must first explain that account access and badge/profile linkage will be removed, while provider-held receipt/payment records and a minimally necessary ZenPlay financial ledger or pseudonymous transaction reference may remain for applicable accounting, tax, fraud, dispute or legal duties. ZenPlay must not promise that provider customer/receipt records disappear with account deletion. Determine with UK privacy/legal/accounting advisers:

- whether the offer is a donation, digital content, or another consumer contract and what cancellation/refund disclosures apply;
- seller/operator legal status, income tax/bookkeeping treatment, VAT threshold/registration and MoR contract effect;
- minimum age/parental consent and provider age rules;
- lawful basis, data-controller/processor roles, international data transfers, retention periods and deletion exceptions;
- whether, when and how provider customer data can be erased, anonymised or retained after account deletion;
- accounting records and evidence needed for refunds, chargebacks, fraud and audits;
- whether current M16B deletion needs a payment-aware pre-delete function and atomic process.

Recommended deletion sequence after those decisions: authenticate and re-confirm; query open intents/active disputes; prevent new checkout; revoke public visibility if any future exists; sever provider customer mapping; clear derived supporter state and entitlement; delete Auth identity/private profile; retain only the approved pseudonymised transaction facts with no email/display name and restricted operator access; explain what remains and for how long before the final action. Do not delete/alter a provider transaction record from ZenPlay client code. Legal/accounting review is required; this is architecture, not legal advice.

## 15. Implementation sequence (future milestones)

Every milestone must use provider sandbox first. “Tests” below are acceptance targets for that future milestone, not run in M17A.

| Milestone | Objective and key implementation | Tests / owner action | Explicitly out of scope |
| --- | --- | --- | --- |
| **M17B — decisions and provider onboarding** | Finalize offer wording, amount/currency, account requirement, refund and retention policy; confirm Paddle eligibility/terms and payout details; update privacy/terms. | Owner obtains UK legal/accounting/privacy review; document provider approval and exact current fee schedule. Review copy with accessibility. | No production payment, migration, checkout, or deployment. |
| **M17C — server schema and boundaries** | Add minimal intent, event/idempotency and derived-state schema with RLS; define deletion retention and operator access. | SQL/RLS tests: anon and users cannot write/read others; service path only; cascade/sever behavior; uniqueness and transaction invariants. Owner reviews data retention. | Provider live catalog, client entitlement writes, public profiles. |
| **M17D — sandbox checkout intents** | Add authenticated Edge Function creating server-defined sandbox checkout from offer key; same-tab hosted redirect; no client price authority. | Test signed-out, bad offer, tampered price, expired intent, wrong user, sandbox secrets/environment isolation and accessible cancellation/return. | Live checkout and production product. |
| **M17E — webhook ledger** | Implement raw-body signature verification, idempotency, event validation, pending/reconciliation behavior and immutable payment/refund/dispute events. | Provider sandbox tests for success/fail/duplicate/replay/invalid signature/partial and full refund/dispute/reversal/out-of-order. | Live payment, subscriptions, Stars, cosmetics. |
| **M17F — supporter state and restore** | Derive private badge state from ledger; authenticated read endpoint; account sign-out/deletion/cache behavior. | Verify no browser write path, own-account-only reads, reinstall/second-device restore, stale/offline state, refund revocation. | Public recognition, gameplay access, cloud saves. |
| **M17G — profile UX and operational support** | Calm Profile journey, pending/failure/verified states, support contact/refund route, privacy/consumer disclosures; log only essential operational errors without payment analytics. | Screen reader, keyboard, zoom, large text, contrast, reduced motion, Simple Mode, offline and account deletion UX review. | Home fundraising surfaces, repeated prompts, recurring payments. |
| **M17H — production readiness and verification** | Owner creates approved live catalog/webhook and secrets only after review; deploy in controlled release; reconcile first transactions and exercise deletion/refund process. | End-to-end low-value production test/refund with owner; inspect no secret leakage; verify provider payout/accounting, webhook alerts and deletion lifecycle; rollback plan. | Cosmetic store, Stars, spotlight, subscriptions unless separately approved. |

## 16. Owner decisions before M17B

1. Approve or change the recommended one-off support purchase and private badge; decide whether support should provide recognition at all.
2. Confirm operator legal/business status, provider acceptance, payout currency and minimums, and whether the offer can be sold as described. No provider account or product exists from this work.
3. Set amount/currency options only after reviewing provider net proceeds and asking representative users about comprehension/accessibility. M13 sample numbers are not a price proposal.
4. Approve account-required checkout, buyer-facing refund/support path, age policy, privacy notice changes and the retention/deletion schedule with qualified UK advisers.
5. Decide if future cosmetics merit a separate milestone. Stars and public spotlight are not recommended for launch.

## 17. Verification and scope

This is a documentation-only discovery change. Repository inspection confirmed current static prototype and no payment implementation, provider SDK, payment migrations, or payment Edge Functions. Provider claims were checked against the official linked docs on 3 October 2026. No tests were run because no executable code changed. No provider account/product, migration, checkout, production service or deployment was created or modified.
