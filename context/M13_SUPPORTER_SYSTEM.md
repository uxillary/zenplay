# M13 — Supporter System

**Status:** M13E repository implementation complete; Supabase production configuration remains owner action required. Payments, Stars, entitlements, cosmetics, public supporter profiles, and account deletion remain unimplemented.
**Scope:** optional profiles, lifetime support recognition, cosmetic entitlements, and a privacy-first supporter spotlight.
**Working name:** ZenPlay Stars. The name and all example thresholds are provisional.

## Purpose and current state

ZenPlay's project context already supports voluntary contributions and optional cosmetic purchases, while prohibiting gameplay paywalls, ads, pressure mechanics, and paid accessibility. M13 refines that broad idea into an optional supporter system. Recognition should communicate lifetime support; Stars are not a spendable balance.

ZenPlay is a React/TypeScript Vite PWA. The game library works locally; IndexedDB stores versioned game saves and per-game statistics, while localStorage stores accessibility/game preferences and the optional local profile. The production service worker caches the app shell and static assets. M13E adds an optional Supabase Auth/private-profile path inside Profile, disabled when configuration is missing; no live Supabase project is configured or verified in this repository. There are still no payments, Stars, purchase verification, entitlements, or public supporter profiles. Home remains a game library with a Profile entry point. Existing game save and statistics schemas remain out of scope for M13.

## Confirmed product principles

- Games remain fully playable without payment, account, network access, ads, lives, energy, paid hints, or gameplay advantages.
- Accessibility features are never paid features. Core games, saves, and settings remain usable offline after the app is available locally.
- Profiles and support are optional. No account is required to open ZenPlay or play.
- Support is cumulative lifetime recognition: a purchase adds to a lifetime total; ordinary cosmetics do not consume Stars or reduce that total.
- Supporter recognition and cosmetic benefits are visual-only. Any supporter status communicated by an icon or Stars also has clear text for assistive technology.
- Public visibility requires explicit opt-in. A private supporter can still support and receive any eligible benefits.
- No real name is required or presumed. Do not create a social network or a highest-spender leaderboard.
- Avoid recurring prompts, scarcity, FOMO, competitive spend cues, and monetisation analytics.

## Proposed design decisions

### Profile availability

Recommend a free local profile for everyone who wants one: chosen display name, favourite game, locally held statistics, and any future achievements. Profiles are optional and local by default. A supporter profile adds verified lifetime Stars, a supporter badge, optional cosmetic entitlements, and the ability to request public spotlight visibility. Do not make basic identity, statistics, or community participation contingent on payment. Do not claim that local statistics are independently verified.

The account/profile connection is a later design decision: local profile creation must not silently create a remote identity. Claiming or syncing a profile should be an explicit, explained action with a recovery path. The product must explain what data leaves the device.

### Stars and benefits

Treat “Stars” as a display unit representing the verified cumulative support total, not as a wallet, credit, or consumable. Purchases are one-off in the initial scope; no subscription is proposed. Bundle size, currency amounts, Star conversion, rounding, refunds, and any milestone values require a separate commercial decision. The example levels (1, 3, 5, 10, 20, 50) are illustrations only and must not appear as approved prices or promises.

Potential benefits are an understated supporter badge, optional profile flair, card backs, felt/table or board appearances, themes, and milestone cosmetics. Maintain a clear free baseline and ensure all cosmetic variants preserve contrast, recognizability, readable labels, and every accessibility setting. Do not sell high-contrast modes, large text/pieces, reduced motion, or other usability. Cosmetics should not imply better play or hide game state.

### Supporter spotlight

Recommend a small, rotating, consent-based selection titled, for example, “Made possible by players like these.” Do not rank by Stars or publish a total-spend leaderboard. Public profile fields should be individually reviewed and previewed before opting in; withdrawing consent should remove the profile from public surfaces promptly.

For exploration, use a bounded pool of eligible consenting profiles and a deterministic, auditable rotation that gives each eligible profile a meaningful chance over a published time window. Consider capped support bands or a small eligibility boost for support milestones, but never make one-Star supporters effectively invisible. A rotation can mix first-time/recent supporters, returning profiles, and a broad pool; it must cap repeat appearances and exclude profiles that have appeared recently. Pure random, milestone pools, and recency weighting remain alternatives. The final weighting, window, tie-breaking, abuse controls, and whether Stars affect eligibility are open questions; decide using simulations and privacy review before launch.

“Favourite game,” selected statistics, supporter-since date, and flair are candidates, not defaults. The profile owner selects each field, sees the rendered preview, and can opt out entirely. Avoid precise dates or statistics if they create unwanted identifiability. Do not expose email, account IDs, purchase receipts, device identifiers, location, age/date of birth, or real name.

### Conceptual data model (illustrative only; not a schema)

- **Local profile:** locally scoped opaque profile ID; display name; optional favourite game; optional local-statistics selections; created/updated timestamps; local profile preferences. Keep local game saves and their schemas independent.
- **Remote identity:** server-issued opaque account/profile ID; authentication/recovery references held separately from public profile data; link state and timestamps. Never use a public display name as identity or authorization.
- **Support record/status:** server-owned purchase/ledger references, provider transaction ID, idempotency key, verification/refund/chargeback state, currency and amount as required for accounting, verified Star delta, and event timestamps. Derived status and lifetime Stars are computed from accepted ledger events, not client input.
- **Lifetime Stars:** server-derived cumulative amount plus ledger revision/as-of time. Never accept a client-supplied total as authoritative. Refunds/chargebacks need an explicit policy for correcting lifetime recognition and already-unlocked cosmetics.
- **Cosmetic entitlement:** stable entitlement ID, source/reason (including milestone rule version), granted/revoked state and timestamp. Entitlements are not spendable currency. Cache a signed or otherwise server-verifiable entitlement snapshot only if later architecture supports offline use safely.
- **Visibility preference:** private by default; explicit public opt-in timestamp, consent/version, chosen public fields, and withdrawal timestamp. Consent must be independently reversible.
- **Supporter-since:** derived from the first successfully verified, non-reversed support event under a documented policy. Do not use profile creation time. Whether a refund/chargeback changes this date needs a policy decision.

M13B implements only the local profile portion. Its version 1 record contains `schemaVersion`, stable `profileId`, trimmed `displayName`, ISO `createdAt`, optional stable `favouriteGameId`, and `visibility: 'private'`. It is stored as a versioned envelope under its own `zenplay-local-profile` localStorage key. Unknown favourite game IDs are retained safely and displayed as unavailable; visibility is always normalized to private. Invalid/unsupported records read as no profile, and unavailable/throwing storage fails without blocking app use. Display names are 2–32 Unicode code points after trimming and reject C0/C1 control characters. Profile removal deletes only this key. This deliberately avoids changing IndexedDB versions, settings, or existing save/statistics schemas.

No remote identity, support, payment, Stars, or public schema is implemented. Do not extend `GameSave`, `GameStatistics`, settings, or IndexedDB to prepare for those concepts.

### Privacy, moderation, and community boundaries

Keep profiles deliberately constrained: no biography, uploaded avatar/photo, comments, direct messages, followers, location, or searchable social graph. A display name needs length/character limits, normalization, reserved-name and impersonation checks, reporting/removal workflow, and a moderation policy. Consider pre-moderated names or a modest safe-name vocabulary if free-form moderation is disproportionate. Never promise public visibility until moderation and response ownership exist.

Profiles should not be enumerable by sequential IDs or unrestricted API queries. Public endpoints should return only opted-in, approved fields and a small curated/rotating result; rate-limit and monitor abuse without building advertising or monetisation analytics. Avoid exposing profile lookup/search unless separately justified. Private profiles must be excluded server-side, not merely hidden in the client. Design cache headers and service-worker behavior so private account or purchase responses are never stored in shared/public caches. Test withdrawal, deletion, stale caches, and direct API access.

Age policy is unresolved. Before public profiles or purchases, decide whether the feature is adult-only, requires parental involvement, or has another UK-appropriate age approach; obtain legal/privacy review for minors, consent, data retention, consumer rights, and tax/VAT obligations. Do not collect date of birth merely to simplify this question. A user must be able to remove public presence independently of retaining purchase/accounting records that law may require; explain any retained records and retention period before account deletion.

### Offline and network boundary

**Must work offline:** launch and play existing games; read/write existing local saves, statistics, and settings; use locally available profile presentation and already-cached cosmetics if introduced; retain queued user intent only where the later design can safely reconcile it. Network errors must not block Home or gameplay. A local profile may be created and edited offline.

**Requires network:** create/claim/authenticate a remote identity; verify a purchase; restore purchases; retrieve authoritative lifetime Stars and remote entitlements; submit a public visibility request or changes; load the current public spotlight; moderate/report public content; process refunds and chargebacks. These features should show a clear offline state and retry path, without turning failure into a gameplay blocker.

Do not let an offline client award verified Stars. If offline cosmetics are supported, define signed entitlement expiry/revocation and account-sharing behavior first. Otherwise, the public spotlight and account-backed support data can simply be unavailable offline while local play continues.

## M13D — Remote identity and service design

This is a design decision, not an implementation. No service, account, API, payment, or remote data exists in the app as a result of M13D.

### Capability boundary

| Capability | Classification | M13D decision |
| --- | --- | --- |
| Open/play games; game saves and settings | **LOCAL ONLY** | No account or network dependency; keep existing IndexedDB/localStorage schemas and offline behavior. |
| Local profile, favourite game, local statistics | **LOCAL ONLY** | Keep the M13B profile and device-recorded statistics on-device. A remote account does not replace them. |
| Verified Stars and supporter-since | **REMOTE REQUIRED** | Only server-calculated from verified, non-reversed support records. |
| Cosmetic entitlements | **REMOTE REQUIRED** | Server grants/revokes account-backed entitlements; any later offline copy is a display/use cache, never authority. |
| Purchase recovery | **REMOTE REQUIRED** | Requires a remote account linked before checkout or an explicitly designed later claim/recovery process. Never promise email-only restoration. |
| Multiple devices | **OPTIONAL REMOTE ENHANCEMENT** | Sign in to the same account for supporter state and entitlements. Local saves, settings, and profile do not sync. |
| Public supporter profile and spotlight | **OPTIONAL REMOTE ENHANCEMENT** | Separate explicit opt-in; private by default; may be omitted entirely without affecting support or play. |
| Delete local profile | **LOCAL ONLY** | Remove only the local profile key; leave saves, statistics, settings, and any remote account untouched. |
| Delete remote account | **REMOTE REQUIRED** | Separate authenticated account-deletion flow with public withdrawal, session revocation, deletion/anonymisation, and any disclosed legally required retention. |
| Public display-name moderation | **REMOTE REQUIRED** | Only for a name the owner asks to publish. Local-only names are not submitted for moderation. |
| Cloud saves/statistics sync, public search/directory, social graph | **DEFERRED** | No current need; requires separate product, conflict, privacy, and abuse review. |

### Recommended service and deployment shape

**CONFIRMED requirement:** Cloudflare is identified as the current deployment host in the M13D request. **Repository finding:** this checkout has a Vite/PWA configuration, static precaching, and a GitHub remote, but no tracked Cloudflare Pages/Workers deployment manifest or workflow. Confirm the live Pages project and deployment settings outside this repository before infrastructure work; this design does not assume they are configured here.

**RECOMMENDED:** Keep the PWA's static build on Cloudflare Pages. For the first remote-service phase, use one managed Supabase project for Auth, Postgres, and a small number of server-side Edge Functions. Keep support-ledger, entitlement, account-deletion, public projection, and moderation writes behind server functions; use database permissions and Row Level Security as defense in depth. The client may read narrowly scoped account data under its authenticated user, but it must never write purchases, ledger entries, Stars totals, or entitlements. A public spotlight function returns only a small approved projection. Do not add a separate Cloudflare Worker/API tier at launch unless a specific routing or security need appears.

This choice minimizes solo-operator glue: Supabase provides passwordless email auth, a relational Postgres model, RLS, and server TypeScript functions suitable for verified webhooks. It introduces vendor coupling and still leaves ZenPlay responsible for policies, purchase reconciliation, security review, and support operations. Keep domain data in ordinary SQL and isolate provider-specific auth/payment identifiers so later migration remains possible. Verify region/data-location options, data-processing terms, backups/restore, custom SMTP requirements, quotas, and current costs before creating a production project.

| Option | Fit for ZenPlay | Trade-off / decision |
| --- | --- | --- |
| Cloudflare Worker + D1 | Small edge API and SQL database; D1 supports transactional batches. | Credible Cloudflare-native alternative, but email identity still needs a separate managed auth service or custom auth. Two vendors or bespoke auth increases maintenance. **Not first recommendation.** |
| Cloudflare KV / Durable Objects / Turnstile | KV may cache non-authoritative public data; Durable Objects suit coordinated state; Turnstile can challenge abusive forms. Worker rate-limiting can blunt abuse. | None is needed for the initial relational ledger. Do not use KV as the financial ledger or rate-limit accounting; Cloudflare describes Worker rate limits as permissive/eventually consistent. Add only for a measured need; Turnstile is not a default login barrier. |
| Supabase Auth + Postgres + Edge Functions | Managed passwordless identity, relational ledger/constraints, RLS, server functions/webhook boundary. | **Recommended initial service.** Less custom infrastructure; vendor and region dependency; production email delivery and quotas/cost require review. |
| Firebase | Managed identity and serverless functions with broad ecosystem. | Credible, but its document model is a less direct fit for a correction-friendly relational purchase ledger; adds a different security/rules model. Not selected. |
| Self-hosted/conventional API + Postgres | Strong portability and relational fit. | More patching, availability, email delivery, backups, monitoring, and incident response for a solo developer. Not justified at expected early scale. |

At the expected early supporter scale, one relational service and a few low-volume functions should be sufficient. Avoid microservices, queues, KV, analytics, image storage, and always-on application servers at first. No pricing is selected here; estimate actual auth-email, database, function, backup, and egress costs using current provider plans before launch.

The recommendation is supported by the providers' current documentation: [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Edge Functions and webhook use](https://supabase.com/docs/guides/functions), [Cloudflare D1 transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/), and [Cloudflare Worker rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). These links describe capabilities, not a provider contract or launch approval.

### Authentication and local-profile connection

**RECOMMENDED phase 1:** managed email passwordless authentication. Offer a one-time email code as the primary flow, with a magic link as an alternative if the user prefers it. Use short-lived, single-use challenges, allowlisted return URLs, resend limits, generic responses that do not reveal account existence, and a clear “check your email / enter code” state. The email address is private authentication/recovery data and is never a public profile field. A verified email is not proof of age or purchase ownership by itself.

| Method | Decision |
| --- | --- |
| Email magic link / one-time code | **RECOMMENDED first method.** Low setup burden and familiar recovery; code entry avoids cross-browser/PWA link handoff, while links remain an option. Depends on reliable email delivery and access to that inbox; protect against interception, forwarding, enumeration, and resend abuse. |
| Passkeys/WebAuthn | **DEFERRED phase 2.** Strong phishing resistance and convenient repeat sign-in, but recovery, device portability, browser support, and support flows add product work. Consider only after demand and a tested recovery path. |
| Social OAuth | **DEFERRED.** More providers, scopes, redirect cases, account linking, and third-party disclosure than needed for an optional supporter account. Reconsider only for evidenced user demand. |
| Email/password | **NOT RECOMMENDED.** Creates password reset and credential-storage/support burden without a clear benefit here. |
| Purchase-email-only recovery | **NOT AUTHENTICATION.** Receipt inbox access alone must not let a caller claim, merge, or take over an account; purchase restoration is tied to the authenticated account and provider-verified transaction. |

**Local profile claim:** creating an account is a separate, user-initiated action. Keep the existing `profileId` device-local and never send it to the service. The user may explicitly copy the local display name and optionally favourite game into a new server-owned supporter profile; preview/confirm that transfer and explain that it leaves this device. Do not upload local statistics, saves, settings, or the local profile ID. The remote profile receives a server-generated opaque account/profile identifier. The local profile remains independently editable and deletable.

One remote account may be used on multiple devices; each device has its own local profile, saves, and settings. A device holds at most one active remote session at a time; sign-out revokes that session and removes its local auth material, but preserves local data. Switching accounts never merges/deletes local profiles automatically. Offline, the local profile and games continue; remote account changes wait for a connection and are never queued as verified support. Reconnecting requires normal authentication, not matching a local ID or display name.

Use the provider's maintained PKCE/session mechanisms, tightly allowlist redirects, rotate/revoke sessions on sign-out/deletion, and set a short practical session lifetime. Treat any browser-held credential as exposed to same-origin script compromise: ship a restrictive Content Security Policy and security headers, avoid unsafe HTML/script injection, keep privileged keys server-only, and make every API authorization check server-side. M13E must verify the chosen session storage/refresh-token behavior for installed PWAs and make logout/revocation reliable. CORS is not authorization; if cookie credentials are introduced, add SameSite/CSRF protections and Origin checks.

### Minimum conceptual remote model

This is a domain sketch, not a migration plan. Keep authentication identities and payment-provider data private and outside public projections.

| Record | Purpose and minimum fields | Authority, visibility, and lifecycle |
| --- | --- | --- |
| Auth identity | Provider-owned subject ID and verified email; session/recovery metadata stays with the auth provider. | Auth provider is authoritative; private. Do not duplicate email in application tables unless a documented function requires it. Delete through account lifecycle; retain no ZenPlay copy by default. |
| Supporter profile | `account_id` (provider subject, private FK), bounded display name, optional favourite game, created/updated time, moderation state, current public-field choices and consent version/time. | Server-owned; private by default. Public details are copied through a separately curated projection only after consent and approval. Delete/anonymise with account; preserve minimum consent evidence only for a justified retention period. |
| Purchase | Opaque purchase ID, account ID, provider transaction ID (unique per provider), currency/amount as required for accounting, verified state, timestamps, reversal/refund state. | Provider webhook + server verification are authority; strictly private. Retain only as long as needed for support/accounting/chargeback duties; never retain raw card data. |
| Support ledger entry | Opaque entry ID, purchase/reference ID, account ID, signed Star delta, reason (grant/refund/chargeback/correction), event time, and rule version. | Append-only server record applied transactionally and idempotently; private. Financially required references may outlive account deletion in minimized/pseudonymised form. |
| Entitlement | Account ID, stable cosmetic code, source ledger/rule version, grant/revocation state and time. | Derived and server-owned; private. Reconcile from ledger/rules; remove access on qualifying reversal per policy and on account deletion. |
| Public profile projection | Random opaque `publicProfileId`, approved display name, optional favourite game/flair/year, generic supporter label; no account ID. | Materialized/served only for consented, approved, currently visible profiles. Revoke/delete promptly on opt-out, moderation action, or account deletion; never expose its backing private row. |

Do not persist local profile IDs remotely. Do not create device fingerprint, analytics, public directory, or public lookup table. Record current consent state on the profile; add an immutable consent-event record only if legal review requires durable evidence and defines its retention.

**Stars decision — RECOMMENDED:** append-only ledger is authoritative; derive the total from entries and maintain a transactionally updated cached aggregate/revision for reads. Reconcile the cached aggregate against the ledger. Do not use a mutable total as the source of truth. Reversals add compensating entries rather than editing history; the effective total is clamped/validated by policy, never client-supplied. Purchase/event unique constraints, provider signature verification, account binding, and idempotent transaction processing prevent forged or replayed grants. Validate currency/amount and transaction status with the provider; reject mismatched account, duplicate, stale, or invalid transitions. Store event IDs/hashes and processing outcomes, not unnecessary full webhook payloads.

Refunds, chargebacks, partial refunds, and provider corrections map to distinct normalized ledger events and must be applied exactly once in a database transaction. Support status and milestone eligibility are recalculated from the effective ledger; whether a reversed purchase removes a previously granted cosmetic or changes supporter-since is **OPEN** and must be stated before checkout. Purchase restoration requests only trigger server/provider reconciliation; the client cannot restore by posting a Star count. Provider delays produce pending/unavailable display, not provisional client credit. Offline cached totals are labelled as last confirmed and cannot unlock or authorize anything.

### Public data, consent, spotlight, and moderation

Private account/contact data and public profile output have separate access paths. The public endpoint/function has a fixed allowlist and returns only `publicProfileId`, moderated display name, generic “ZenPlay supporter” text, and fields individually selected by the owner (initial candidates: favourite game, broad flair, supporter-since year). It never returns email, auth/account/local IDs, payment/provider IDs, history, private flags, exact purchase totals, moderation notes, or statistics by default. A random public ID is not authorization; avoid per-profile lookup/search routes and sequential IDs.

**RECOMMENDED:** exact Stars stay private by default. A person can opt into public recognition without showing an exact count. Whether to offer a separate opt-in count or broad support band is **OPEN**; never rank spotlight entries by spend. Public visibility is independent from supporting and can be withdrawn at any time. Consent is a separate clear choice with a rendered preview, field-level selection, and no preselected checkbox.

**Spotlight flow:** Home requests a small, bounded set (for example, no more than five cards) from a server function. The function selects only currently opted-in, approved, non-suspended profiles; returns only public projection fields; uses no public query parameter that permits scanning; and enforces rate limits/abuse controls. The fairness policy must give small supporters a meaningful chance, cap repeats, avoid spend ordering, and be tested for gaming before release. Do not finalize weighting in M13D. At first, skip persistence in the service worker and avoid caching the response. If scale later justifies shared edge caching, cache only the public projection briefly, provide an invalidation path, and set a maximum withdrawal/moderation-removal delay. Never cache private account/purchase responses in the browser, service worker, or shared CDN.

Moderate only publication requests: enforce the existing 2–32 Unicode-code-point size as a starting point, trim/normalize, reject control and unsafe invisible/bidi override characters, reserve ZenPlay/staff impersonation names, and rate-limit renames. Do not build an unbounded profanity classifier or moderate local names. Before public launch, define report/contact route, manual review owner, temporary unpublish/suspend/rename controls, response expectations, and appeal handling. Until an operator can actually perform those duties, keep public profiles and spotlight disabled.

### UK privacy and age gates

Before production data collection, the operator must document controller/processor roles, a lawful basis and specific purpose for each field, recipient/processor list and region, access/export/correction/deletion handling, a retention schedule, security/incident ownership, and a route for privacy requests. Collect only what the account, recovery, support accounting, or separately opted-in publication needs; do not reuse support/account data for analytics or advertising. Keep publication consent separate, informed, affirmative, field-specific, and as easy to withdraw as to grant. Assess whether a DPIA or other formal review is required before introducing public profiles or payment-linked data. Confirm processor terms, international transfers, and any UK/EU residency requirement against the selected service configuration; a hosting region alone does not answer every transfer question.

Do not invent an age gate or collect date of birth in M13D. Before offering accounts, purchases, or public names, obtain product/legal/provider guidance on minors, capacity/parental involvement, public-name consent, payment-provider age rules, and any age-assurance duty. If the operator cannot meet the resulting requirements, keep the affected feature unavailable. These are architecture release gates, not formal legal advice.

### Account and deletion lifecycle

1. **Local only:** no remote record or session. Local profile deletion removes only its localStorage key; game saves, statistics, and settings remain.
2. **Remote account created:** create an optional auth identity and private remote profile. No Stars/purchase exists until provider verification. Explain email use and data leaving the device.
3. **Connect device:** authenticate the same remote identity; keep device-local data separate. Multiple devices share only remote account-backed supporter information, not saves/settings/local statistics.
4. **Sign out/disconnect:** revoke the current session/refresh token and clear its local auth state. Keep local profile/data; the remote account, supporter record, purchases, and other devices remain.
5. **Public opt-in/out:** independently record field choices and consent. On withdrawal immediately suppress profile in origin queries, purge any edge cache, and ensure no service-worker cache can serve it. Benefits and private supporter status remain.
6. **Delete remote account:** clearly separate from “Delete local profile”; require recent reauthentication/confirmation, revoke sessions, withdraw public consent, suppress public records immediately, delete auth/profile/entitlements and non-required personal data, and provide an export path before deletion where appropriate. Deletion does not delete local saves/settings/profile.
7. **Required financial retention:** before account deletion, identify any exact transaction/tax/chargeback records that must remain, their legal basis, fields, access restriction, and expiry. Detach/anonymise account links where lawful and feasible; do not retain public names or auth email just because a financial row remains. The eventual confirmation must explain what cannot be erased and why. No retention duration is invented in M13D.
8. **Later refunds/chargebacks:** process against a minimized retained transaction reference, record compensating ledger event if an account still exists, otherwise retain only records required for finance/provider dispute obligations. Restore/relink requires authenticated proof and a documented policy; never silently recreate a deleted account.

Account export/access, correction, deletion timing, processor/subprocessor terms, UK/EU region, international transfer basis, retention schedules, children/minor handling, payment disclosure/refund rights, VAT/tax/accounting, and age policy require operator/legal/provider review before the affected feature ships. Do not collect DOB unless counsel/provider policy establishes a real need. There is no verified moderation, DSAR, incident, or customer-support owner in this repository; the product operator must name that owner and a contact route before remote accounts are exposed to users, and moderation must be staffed before public profiles.

### Failure and offline behavior

| Failure | User-facing behavior |
| --- | --- |
| Backend/auth service unavailable | Games, saves, settings, and local profile continue. Sign-in/account actions say “Supporter information isn't available right now” with retry; no blank blocking screen. |
| Offline | Existing games and local data work. Account/profile changes, restore, purchases, authoritative Stars/entitlements, and visibility changes are unavailable and clearly marked. Do not queue purchase or consent requests silently. |
| Support data refresh fails | Keep only a clearly labelled last-confirmed display snapshot if one exists; show its as-of time and a retry. Do not unlock from stale data or present it as current authority. |
| Spotlight unavailable/empty | Omit the spotlight quietly or show calm non-error copy; Home layout and navigation remain intact. Fail closed. |
| Payment provider/webhook delayed or down | No success claim or Stars until verified; show pending/try again/support path without repeating a completed charge. Reconcile provider event idempotently. |
| Sign-in email delayed/expired | Offer resend after rate-limit window, alternate code/link method, and cancel back to local play. Do not reveal whether an email already has an account. |

### Provider-neutral payment boundary

The later M13F adapter verifies provider signatures/server lookup and normalizes events into a small internal event contract: provider + unique event/transaction IDs; authenticated account binding; event kind; verified paid amount/currency; timestamps; refund/chargeback/partial-reversal amount and status. It rejects client assertions and invalid state transitions, then passes accepted events to one transactional purchase/ledger/entitlement service. Provider-specific webhooks, IDs, and retry behavior stop at this adapter; UI and Stars calculations depend only on normalized verified records. The eventual provider must offer signed/retrievable server events, stable unique IDs, refunds/chargebacks/partial refunds, idempotent retries, account metadata/linking, customer receipts/support, reconciliation/export, supported PWA/browser payments, and suitable UK consumer/tax reporting. Provider and prices remain unselected.

### M13D threat priorities

Severity is the security priority for the relevant feature, not a judgement about users. Every HIGH item is a release blocker until its controls are implemented and verified.

| Priority | Threat | Required mitigation |
| --- | --- | --- |
| **HIGH** | Forged Stars, client profile/localStorage tampering, or entitlement rollback | Treat browser state as untrusted; only verified server events grant value; server-authorize every entitlement read/write; ledger-derived totals and reconciliation; never accept client totals. |
| **HIGH** | Forged/replayed/duplicate webhook; purchase bound to wrong account | Verify signature and provider state; unique event/transaction constraints; account-binding checks; transactional idempotency; replay/stale-transition rejection; reconciliation and alerting. |
| **HIGH** | Account takeover, intercepted magic link/code, stolen session or session fixation | Single-use short-lived challenges; generic sign-in responses; redirect allowlist; PKCE/provider session safeguards; rotate/revoke sessions; reauthenticate sensitive deletion/email changes; strict CSP/XSS prevention; no privileged secrets in client; test cross-device link behavior. |
| **HIGH** | Private/public data boundary failure, including deleted/private profile in cache | RLS/grants on every exposed table; server-only privileged writes; allowlisted public projection; no private caching/service-worker route; immediate origin suppression and cache purge on opt-out, suspension, deletion; direct-request privacy tests. |
| **HIGH** | Cross-site request abuse (if cookies), CSRF, or same-origin XSS | Prefer bearer-authenticated requests with strict server authorization; if cookies are used, SameSite + anti-CSRF token + Origin checks; CSP, output encoding, dependency review, and no unsafe HTML. CORS alone is not a control. |
| **MEDIUM** | Enumeration/scraping, rate-limit abuse, or spotlight gaming | No directory/search endpoint; opaque random IDs; small bounded response; server selection; per-route/account/IP limits, monitoring, abuse response; test fairness and scraping resistance. Platform rate limits are a throttle, not financial correctness. |
| **MEDIUM** | Display-name abuse, impersonation, report overload | Normalize/validate; reserved names; rename limits; manual prepublication/review and fast unpublish; publish only after moderation operations exist. |
| **MEDIUM** | Refund/chargeback or delayed provider events leave stale totals/entitlements | Append compensating ledger events exactly once; explicit reversal and benefit policy; pending state; reconciliation; revocation checks and support appeal path. |
| **MEDIUM** | Email enumeration/resend abuse or provider outage | Uniform responses and timing where practical; resend/attempt limits; delivery monitoring; cancel to local use; no auth dependency for games. |
| **LOW** | Local profile ID or unverified local stats accidentally treated as server identity/evidence | Keep them local, omit from remote requests, and label any later local statistic as device-recorded/unverified. |

### Decisions and remaining gates

- **CONFIRMED:** normal play/local data remain local and account-free; Stars are server-authoritative lifetime recognition; support, public recognition, and gameplay remain separate; public is private by default; no cloud saves, public directory, or M13D code.
- **RECOMMENDED:** Cloudflare static host plus Supabase Auth/Postgres/Edge Functions for first remote phases; managed email OTP with magic-link alternative; append-only verified ledger plus derived/cached aggregate; distinct public projection; no Worker/D1/KV/Durable Object/Turnstile until a measured need.
- **OPEN before relevant launch:** production region and data-processing terms; auth email delivery/cost and session-storage spike; age/minor policy; named privacy/support/moderation operator; UK legal advice for consent, access/export, retention/deletion, payments, refunds, VAT/tax, and consumer disclosures; exact Stars/refund/entitlement policy; exact public fields/count display, withdrawal service level, and fair rotation; payment provider and prices.
- **DEFERRED after M13D:** payment integration, Stars/cosmetics, public profile/spotlight, cloud sync, and policy/terms publication. M13E has since added only optional identity and a private profile; production service configuration remains outstanding.

## M13E — account/profile foundation

**Repository implementation: COMPLETE. Supabase production configuration: OWNER ACTION REQUIRED.** The app includes a single optional email-code flow and a private remote profile path. Configuration is read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; missing/invalid values disable the account section without initializing a network client or affecting application startup. The exact setup and migration commands are in the repository README.

**Authentication:** the Profile screen asks for an email, sends one-time email OTP, then verifies the six-digit code. No password, OAuth, passkey, or username authentication is added. Supabase JS owns session persistence/refresh in browser storage; sign-out explicitly uses local-session scope so other devices stay signed in. Email is sent to/held by Supabase Auth, may appear in the Profile sign-in form while signing in, and is never stored in the local profile or remote profile table. The client does not log credentials or raw provider errors. Hosted Supabase must be configured to send the OTP template's `{{ .Token }}`.

**Remote profile:** `public.private_profiles` contains only the Auth user UUID (`id`), `display_name`, optional `favourite_game_id`, `created_at`, and server-updated `updated_at`. There is no email column. RLS permits authenticated users to read, insert, and update only their row; row ownership defaults to `auth.uid()`, and clients cannot write the ID or timestamps, delete the row, or access it anonymously. The migration also validates name length/control characters and restricts favourite game IDs. A pgTAP policy test covers owner access, cross-account denial, reassignment, deletion deferral, and anonymous denial.

Connecting is a separate checked action. It sends only the chosen display name and a current supported favourite game; an unsupported old favourite is omitted. It never sends local profile ID, local created date, visibility placeholder, local statistics, saves, settings, or accessibility choices. The local profile remains authoritative for that device; edits do not silently sync. Remote profile edits require an explicit save. The Auth session is SDK-managed in browser storage; remote profile details exist only in app memory and are not cached for offline use. Local profile/game behavior continues if Auth or the profile request fails. The M13C fictional supporter fixtures remain unchanged and have no service connection.

Remote account deletion, account data export, purchase-linked retention, and complete recovery/lifecycle support remain deferred to **M13J**. M13E provides no fake account deletion control. No live Supabase project was available for connectivity or hosted RLS verification; the migration and local pgTAP test are committed for reproducible verification when the owner sets up the project.

### Owner action required

- Create a Supabase project and choose its region after the required privacy/data-location review.
- Put the project URL and publishable key in local `.env.local` and the Cloudflare Pages build environment. The publishable key is expected to be public; never use a secret/service-role key or database password in the browser.
- Set the Auth Site URL to ZenPlay's canonical origin; allowlist required local and production origins. Enable email OTP, use a six-digit code and `{{ .Token }}` email template, configure resend/expiry limits, and set up verified production SMTP.
- Install/run the Supabase CLI and local Docker stack if available; run `supabase start` and `supabase test db`. To apply remotely, `supabase login`, `supabase link --project-ref …`, `supabase db push --dry-run`, review the plan, then `supabase db push`.
- Confirm the deployed project and migration before exposing account access to users. No credentials, Dashboard configuration, migration application, or live connectivity are claimed complete here.

### Eventual payments requirements (not implementation or provider selection)

A later provider evaluation must assess UK-friendly one-off payments, PWA/browser and any future app-store constraints, supported currencies and bundles, purchase verification, durable idempotency, restore flows, refunds, chargebacks, server-authoritative totals, account linking, guest-purchase implications and recovery, customer support, receipts, fraud handling, and accounting. Resolve UK tax/VAT, consumer disclosures/refund rights, privacy, and record-retention duties with appropriate advice. Avoid client-only purchase callbacks as proof. Do not select a provider by analogy with another project.

Guest purchases are a material risk: device-only ownership can be lost on clearing storage or changing devices, while mandatory sign-in conflicts with low-friction support. Compare explicit account linking before checkout, post-purchase claim/recovery, and platform-managed purchase restoration. Explain limitations before payment; do not promise recoverability until implemented and tested.

## Threat and abuse analysis

See [M13D threat priorities](#m13d-threat-priorities) for the expanded severity-ranked threat model and concrete release controls. Threat controls are release gates for their associated remote features, not work to simulate in a frontend prototype.

## Accessibility review

- Use visible text such as “ZenPlay supporter” and “14 lifetime Stars”; a star glyph alone never conveys status or amount. Provide accessible names for decorative icons and avoid duplicate announcements.
- All profile, support, consent, restore, and deletion flows must be keyboard-operable, screen-reader labelled, zoom/reflow friendly, and usable with large text, high contrast, touch targets, and Simple Mode.
- Explain costs, what is received, whether payment is one-off, and recovery/refund limits in plain language before checkout. Avoid countdowns, urgency, confusing defaults, preselected public visibility, or pressured confirmation.
- Respect `prefers-reduced-motion` and ZenPlay's reduced-motion setting for flair, transitions, and rotating spotlights. Rotation must not auto-change content while focused or announce repeated updates; provide pause/next controls or a static alternative.
- Cosmetics may not reduce contrast, obscure game pieces, alter semantics, or be required for a readable board. Every visual reward needs an accessible text equivalent and must remain optional.
- Profile and payment errors need calm, actionable text. Network/auth failures must not steal focus or strand gameplay.

## M13C content review

### Confirmed

- “Stars” remains the working term for **lifetime support recognition**, never spendable currency. Use “14 lifetime Stars” or “support level”; do not say balance, wallet, spend, or “buy an item for X Stars.”
- Keep the free profile useful on its own. Profile creation stays optional, local, and private by default; supporter information must not make the free profile feel deliberately incomplete.
- Supporter status always has visible text as well as any decorative star or badge. Do not use repeated star icons to represent a count.
- M13C supporter profiles, milestone descriptions, and spotlight entries are static fictional fixtures only. They are not local-profile data, are not saved, and do not imply that support or public profiles exist today. This copy is explicit in the Home spotlight and Support ZenPlay prototype.
- M13C offers no payment controls or fake purchase-success flow. Amount examples carry no GBP prices and are explicitly labelled as discussion concepts.
- Support never changes gameplay or accessibility. Public visibility is a later, separate opt-in; private supporters receive the same eligible benefits.

### Proposed

- Show available local game-completion statistics read-only on a free profile. Label them as recorded on this device, show only statistics the existing system actually records, and do not describe them as verified, global, or necessarily “wins.” These counters are informational and not a condition of support.
- Present the Home spotlight as a small, static set of example cards under “Made possible by players like these,” with a prominent preview notice. Do not sort by Stars. The implemented sample set deliberately places 14, 1, and 1,247 Stars in a non-ranked sequence and labels the records fictional; this does not select the eventual live rotation design.
- Use a restrained supporter-profile hierarchy: display name and favourite game first, a single star glyph plus readable “N lifetime Stars” text, then optional selected statistic, supporter-since year, and a quiet flair label. Group large counts in text; never draw one icon per Star.
- Use plain language on the future support page: ZenPlay is free and ad-free; support is optional; Stars recognise lifetime support; extras are cosmetic; accessibility and gameplay remain free. Example 1, 5, 10, and 25 Star amounts are concepts only, not bundles, conversion rates, or prices.
- Treat milestones as quiet thank-you acknowledgements, not a progress track. Current examples pair 1/5/10/25 Stars with a badge, profile accent, card back, and table appearance. Avoid “only X away,” progress pressure, timers, popularity labels, or urgency.
- Keep the future public-visibility explanation separate from support: private by default; opt in separately; supporting never publishes a profile; visibility can later be turned off; private supporters keep their benefits. M13C explains this but does not offer a visibility switch.
- Recommended first M13H cosmetic categories: **profile accent/flair** (outside gameplay) and **Solitaire card backs** (the card faces and suit/rank recognition remain unchanged). Add table/felt or board appearance only after contrast and focus-state checks. Defer Sudoku palettes, Pairs faces, Mahjong tile faces, and app-wide themes because they can alter recognition, state, or accessibility presentation more directly.
- The prototype is static and uses no automatic rotation or decorative animation. Any eventual spotlight rotation must get a separate reduced-motion/static alternative and must not move content under keyboard focus.
- Free-profile statistics use the existing per-game `gamesCompleted` values. They are labelled as recorded on this device, shown as completions rather than wins, omitted when zero, and never treated as verified.

### Open

- Is “ZenPlay Stars” the final public name, and how will future wording explain the link between financial support and a lifetime Star total without implying virtual currency?
- Are the proposed 1/5/10/25 milestone examples useful and affordable to operate? What support-to-Star mapping and price, if any, will be approved? No economic decision is made here.
- Should a live spotlight exist, which eligible profile fields should be shown, and which fair rotation model, appearance cap, time window, and withdrawal latency should it use? Stars should not create a spending leaderboard.
- Which local game statistics are sufficiently understandable and safe to show on a future public profile, and should any be omitted to reduce identifiability?
- What moderation, age, retention, and public-profile operations can ZenPlay support before public visibility ships?

### Deferred

- Real account-backed supporter state, Stars totals, supporter-since calculation, cosmetic entitlements, and their presentation from verified server data.
- Real checkout, bundle selection, prices, provider, refunds, restore, or any purchase-completion state.
- Persisting supporter data in the local profile, publishing fixture records, network requests, spotlight selection/rotation, or public visibility controls.
- Implementing game/application cosmetics or changing game rendering and save schemas.

## Explicit M13 non-goals

- Chat, comments, followers, private messaging, social feeds, or a general user directory.
- Competitive paid advantages, paid hints, subscriptions required for gameplay, ads, or paywalled accessibility.
- User-uploaded avatars, photos, biographies, or arbitrary profile content beyond a moderated display name and bounded selections.
- Global gameplay leaderboards, unless separately approved after a distinct product and privacy review.
- Monetisation-specific analytics, daily rewards, streak pressure, loot boxes, random paid rewards, scarcity, or spending rankings.
- Changing existing game mechanics, save schemas, statistics schemas, or offline game behavior to accommodate support.
- A forced account, remote service dependency, payment provider choice, or public profile participation.

## Proposed M13 milestone sequence

All milestones remain on the existing M13 branch; no M13 sub-branches.

| Milestone | Bounded outcome | Depends on |
| --- | --- | --- |
| **M13A — Product and architecture specification** | This specification, context update, principles, threat/accessibility/privacy review, open questions, and next prompt. | Complete |
| **M13B — Local profile foundation** | Optional local-only profile model and storage isolated from game saves/settings; create/edit/delete locally; no account, network, support claims, or public fields. | Complete |
| **M13C — Supporter UX prototype and content review** | Review the shipped profile flow and prototype clearly-labelled, non-production supporter/supporter-benefit screens, including privacy and offline/error states; no payment or public service. | Complete |
| **M13D — Remote identity and service design** | Documented recommended service/auth design, data separation, trust boundaries, lifecycle, security, failure behavior, and remaining legal/provider gates. No infrastructure or app behavior. | Complete |
| **M13E — Account/profile service foundation** | Optional email OTP identity, explicit local-field connection, private remote profile and RLS; no purchases or remote deletion. | Repository implementation complete; owner Supabase setup/region/email configuration and privacy/legal gates before production use |
| **M13F — Purchase verification and support ledger** | Evaluate/select provider; implement one-off checkout, server verification, idempotent ledger, restore, refunds/chargebacks, receipts/support handling, and guest/account-link rules. | M13E; legal, tax/VAT, and provider decisions |
| **M13G — Stars and cosmetic entitlements** | Derive lifetime Stars and milestone grants from verified ledger; display accessible supporter status; define reversal/versioning and offline cache behavior. | M13F; approved benefits and thresholds |
| **M13H — Cosmetic experience** | Ship a small accessible set of optional badge/flair/card/table/board themes; free baseline and accessibility parity verified. | M13G; visual/accessibility review |
| **M13I — Public spotlight** | Consent preview/withdrawal, moderation, server-filtered bounded rotation, anti-enumeration, cache/privacy controls; algorithm tested for fair visibility. | M13E, M13G; moderation and privacy readiness |
| **M13J — Lifecycle, security, and release review** | End-to-end privacy/deletion/recovery, legal/consumer review, threat review, accessibility, offline/PWA, abuse operations, support runbooks, and release gates. | Relevant prior milestones |

The order may be adjusted after M13D, but remote accounts must not be exposed to users before the service/security/privacy gates in the M13D decisions are resolved. Spotlight is independently optional and should not delay private support or cosmetics.

## Open questions

1. Is Stars the final name, and what precisely does one Star represent? What purchase bundles and amounts, if any, will be offered?
2. What account-linking/guest-purchase policy and recovery guarantees can a chosen provider support without making sign-in necessary for gameplay?
3. Which platform(s) will initially accept payment: browser PWA, Android wrapper, or both? What store/payment rules apply to each?
4. Which UK-friendly payment provider meets verification, refund, chargeback, restore, tax reporting, privacy, and support needs?
5. What age approach applies to purchases and public profiles, especially minors? What legal review and retention schedule are required?
6. Which public fields/count display are useful and safe; what withdrawal service level and fair rotation rules can be operated?
7. How should refunds/chargebacks affect lifetime Stars, supporter-since, and already-unlocked cosmetics? What appeal process is appropriate?
8. Who owns privacy requests, display-name moderation, reports, and account support, and what response/removal expectations can ZenPlay meet?
9. Which data can sync or be recovered in a later, separate milestone, and how would conflicting local statistics be handled? Local statistics remain device-recorded/unverified.
10. Which service region, data-processing terms, email delivery plan, and current provider costs meet the operator's requirements?

## Deferred ideas

- Final Star name, conversion, purchase prices/bundles, milestone thresholds, and cosmetic catalogue.
- Provider selection, integration details, remote schema/migrations, production hosting configuration, and session implementation.
- Cross-device statistics synchronization, cloud saves, family/carer profiles, shared profiles, or team/group support.
- Public spotlight weighting, exact schedule, recency rules, and public profile search.
- Additional paid content such as puzzle packs; this needs a separate review because it changes content availability rather than merely recognition/cosmetics.

## Recommended next bounded prompt

**M13F — Purchase verification and support ledger.** Separately evaluate and select a payment provider only after owner Supabase configuration and legal/privacy/provider gates are understood. Implement provider verification, account binding, idempotent purchase/support ledger, restoration, refunds/chargebacks, and support handling; do not add public profiles/spotlight or game sync. M13E repository implementation is complete. Do not begin M13F until explicitly requested.
