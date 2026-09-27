# M13 — Supporter System

**Status:** M13B local profile foundation implemented; remote identity, support, and public features remain unimplemented.
**Scope:** optional profiles, lifetime support recognition, cosmetic entitlements, and a privacy-first supporter spotlight.
**Working name:** ZenPlay Stars. The name and all example thresholds are provisional.

## Purpose and current state

ZenPlay's project context already supports voluntary contributions and optional cosmetic purchases, while prohibiting gameplay paywalls, ads, pressure mechanics, and paid accessibility. M13 refines that broad idea into an optional supporter system. Recognition should communicate lifetime support; Stars are not a spendable balance.

ZenPlay is a React/TypeScript Vite PWA. The game library works locally; IndexedDB stores versioned game saves and per-game statistics, while localStorage stores accessibility/game preferences and now the optional local profile. The production service worker caches the app shell and static assets. There is no server, authentication, payment, remote profile, or purchase verification infrastructure. Home remains a game library with a Profile entry point. Existing game save and statistics schemas remain out of scope for M13.

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

### Eventual payments requirements (not implementation or provider selection)

A later provider evaluation must assess UK-friendly one-off payments, PWA/browser and any future app-store constraints, supported currencies and bundles, purchase verification, durable idempotency, restore flows, refunds, chargebacks, server-authoritative totals, account linking, guest-purchase implications and recovery, customer support, receipts, fraud handling, and accounting. Resolve UK tax/VAT, consumer disclosures/refund rights, privacy, and record-retention duties with appropriate advice. Avoid client-only purchase callbacks as proof. Do not select a provider by analogy with another project.

Guest purchases are a material risk: device-only ownership can be lost on clearing storage or changing devices, while mandatory sign-in conflicts with low-friction support. Compare explicit account linking before checkout, post-purchase claim/recovery, and platform-managed purchase restoration. Explain limitations before payment; do not promise recoverability until implemented and tested.

## Threat and abuse analysis

| Threat | Required control before relevant feature ships |
| --- | --- |
| Forged Stars / modified localStorage | Treat browser storage and client requests as untrusted. Only a server ledger built from verified provider events may grant Stars or account-backed entitlements. Local profile/statistics edits affect local display only. |
| Replayed purchase confirmations | Verify provider signatures/server notifications; bind events to the correct transaction; maintain unique transaction and idempotency constraints; reject stale/invalid state transitions. |
| Duplicate purchase processing | Make ledger application transactional and idempotent across webhook retries, client retries, restore requests, and concurrent delivery. Reconcile provider records against the ledger. |
| Inappropriate or impersonating names | Validate and normalize input; reserve ZenPlay/staff names; moderate/report, suspend, rename, and appeal through a defined process; never publish unreviewed arbitrary text by default. |
| Profile enumeration/scraping | No public directory by default; opaque IDs; narrow spotlight response; server-side consent filtering; rate limits and abuse monitoring; avoid exposing lookup endpoints or bulk statistics. |
| Accidental exposure of private profiles | Enforce privacy on the server and API; minimize public fields; test direct requests, cache/service-worker behavior, consent withdrawal, account deletion, and stale replicas. Default private. |
| Refund/chargeback or compromised account | Define ledger reversal, cosmetic entitlement and appeal policy; alert/support flow; protect account recovery and audit administrative actions. |

Threat controls are release gates for their associated remote features, not work to simulate in a frontend prototype.

## Accessibility review

- Use visible text such as “ZenPlay supporter” and “14 lifetime Stars”; a star glyph alone never conveys status or amount. Provide accessible names for decorative icons and avoid duplicate announcements.
- All profile, support, consent, restore, and deletion flows must be keyboard-operable, screen-reader labelled, zoom/reflow friendly, and usable with large text, high contrast, touch targets, and Simple Mode.
- Explain costs, what is received, whether payment is one-off, and recovery/refund limits in plain language before checkout. Avoid countdowns, urgency, confusing defaults, preselected public visibility, or pressured confirmation.
- Respect `prefers-reduced-motion` and ZenPlay's reduced-motion setting for flair, transitions, and rotating spotlights. Rotation must not auto-change content while focused or announce repeated updates; provide pause/next controls or a static alternative.
- Cosmetics may not reduce contrast, obscure game pieces, alter semantics, or be required for a readable board. Every visual reward needs an accessible text equivalent and must remain optional.
- Profile and payment errors need calm, actionable text. Network/auth failures must not steal focus or strand gameplay.

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
| **M13C — Supporter UX prototype and content review** | Review the shipped profile flow and prototype clearly-labelled, non-production supporter/supporter-benefit screens, including privacy and offline/error states; no payment or public service. | M13B; content/privacy copy review |
| **M13D — Remote identity and service design** | Choose and document account, API, deployment, data separation, security, recovery, moderation operations, and provider evaluation criteria; validate legal/privacy ownership. A design gate before building services. | M13C findings; open decisions below |
| **M13E — Account/profile service foundation** | Minimal optional identity and profile claim/sync, server-side authorization, deletion and recovery foundations, private-by-default profile API; no purchases. | M13D approval |
| **M13F — Purchase verification and support ledger** | Evaluate/select provider; implement one-off checkout, server verification, idempotent ledger, restore, refunds/chargebacks, receipts/support handling, and guest/account-link rules. | M13E; legal, tax/VAT, and provider decisions |
| **M13G — Stars and cosmetic entitlements** | Derive lifetime Stars and milestone grants from verified ledger; display accessible supporter status; define reversal/versioning and offline cache behavior. | M13F; approved benefits and thresholds |
| **M13H — Cosmetic experience** | Ship a small accessible set of optional badge/flair/card/table/board themes; free baseline and accessibility parity verified. | M13G; visual/accessibility review |
| **M13I — Public spotlight** | Consent preview/withdrawal, moderation, server-filtered bounded rotation, anti-enumeration, cache/privacy controls; algorithm tested for fair visibility. | M13E, M13G; moderation and privacy readiness |
| **M13J — Lifecycle, security, and release review** | End-to-end privacy/deletion/recovery, legal/consumer review, threat review, accessibility, offline/PWA, abuse operations, support runbooks, and release gates. | Relevant prior milestones |

The order may be adjusted after M13D, but remote accounts must not be started before the service/security/privacy design gate. Spotlight is independently optional and should not delay private support or cosmetics.

## Open questions

1. Is Stars the final name, and what precisely does one Star represent? What purchase bundles and amounts, if any, will be offered?
2. Are free profiles worth adding before remote accounts, given the additional local-data lifecycle and the current “no accounts” copy? Which fields are useful enough to justify them?
3. How can a guest purchase be restored or claimed without forcing an account before gameplay? What are the recovery guarantees and limitations?
4. Which platform(s) will initially accept payment: browser PWA, Android wrapper, or both? What store/payment rules apply to each?
5. What UK-friendly providers meet verification, refund, chargeback, restore, tax reporting, privacy, and support needs? No provider is selected.
6. What age approach applies to purchases and public profiles, especially minors? What legal review and retention schedule are required?
7. Which profile/statistic fields are safe and useful for spotlight, and how long should consent/rotation state be retained?
8. Should Stars affect spotlight eligibility at all? Which rotation model gives small supporters a real chance without reward gaming or spend ranking?
9. How should refunds/chargebacks affect lifetime Stars, supporter-since, and already-unlocked cosmetics? What appeal process is appropriate?
10. Who owns display-name moderation and reports, and what response/removal expectations can ZenPlay support?
11. Which data can sync or be recovered, and what conflicts result when local statistics differ across devices? Local statistics should be labelled as self-reported unless there is a separately approved verification mechanism.

## Deferred ideas

- Final Star name, conversion, purchase prices/bundles, milestone thresholds, and cosmetic catalogue.
- Provider selection, implementation details, backend/vendor, authentication method, API schemas, and production hosting.
- Cross-device statistics synchronization, cloud saves, family/carer profiles, shared profiles, or team/group support.
- Public spotlight weighting, exact schedule, recency rules, and public profile search.
- Additional paid content such as puzzle packs; this needs a separate review because it changes content availability rather than merely recognition/cosmetics.

## Recommended next bounded prompt

**M13C — Prototype the supporter experience without real support infrastructure.** Review the implemented profile flow. Build only a clearly-labelled, non-production UI prototype for explaining voluntary support and potential cosmetic recognition, including privacy choices and offline/error states. Use no real prices, checkout, account, backend, Stars balance, public profiles, analytics, or production entitlements. Test the copy and accessible flow, update this document, and stop after M13C.
