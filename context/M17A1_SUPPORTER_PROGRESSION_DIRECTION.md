# M17A.1 — Supporter Progression and Collectibles Product Direction

**Status:** Product direction for future discovery; not an implementation approval. No prices, provider, progression formula, reward catalog, public profile, leaderboard, data model, migration, account, or deployment is approved by this document. This document supersedes conflicting M17A product recommendations while preserving its payment-security architecture and provider research. M17A remains useful historical discovery; this addendum is the current product direction.

## Direction summary

ZenPlay may offer optional account-backed progression and visual collectibles alongside free games. Every game remains free, ad-free, offline-capable, and accessible. Accounts remain optional for play and required before purchase. Spending never affects game mechanics, score, odds, information, or accessibility. There are no subscriptions, paid gameplay benefits, scarcity pressure, gambling, or paid random rewards.

The preferred support recognition is one persistent account emblem whose visual form evolves with verified support progression. Keep progression value and the emblem distinct in both domain and presentation: the value is never spendable, and the emblem is one evolving symbol, not a wallet or repeated star balance. “Star,” “Star Level,” and “Support Level” are working names only; naming is unresolved. Do not show a purchase tier such as Bronze/Silver/Gold.

Support choices may eventually be offered at small, medium, larger, and generous levels, with a genuinely low impulse-level entry and no final prices set here. A larger support amount may advance the emblem further, but must not unlock essential or uniquely desirable gameplay. All offers remain one-off unless a later decision explicitly changes this direction.

## Benefits and collectibles

Potential tangible benefits include the evolving emblem, profile frames/accents/flair, Solitaire card backs, table/felt appearances, cosmetic board appearances, and profile showcase slots. These are candidates for later accessibility review, not a launch catalog. Keep the free/default presentation excellent. No paid item may change rules, reveal hidden information, provide hints/lives/energy, improve odds, replace an accessibility feature, or make interaction objectively easier than the accessible free baseline. Paid visuals must preserve readability, contrast, semantic information, reduced-motion behavior, and all accessibility settings. Do not launch a large cosmetics store in the first payment implementation.

Treat collectibles as account-backed entitlements that may be granted for different reasons: support progression, achievements, gameplay accomplishments, future events/content, and possibly future platform systems. A future domain model should retain the source and reason for each grant; do not assume ownership always came from payment. This is an architectural requirement for later design, not a schema request.

## Reveal presentation and randomness boundary

ZenPlay may explore a box, pack, or reward-reveal presentation only when it reveals rewards already determined and earned. For example: verified support → a reward package is made available → the player opens it → the known emblem evolution and predetermined cosmetic(s) are shown. The animation is presentation, not a chance to win.

**Paid random rewards are not part of ZenPlay.** Do not implement paid loot boxes, randomized paid rarity, purchasable keys/crates, chance-based paid cosmetics, probability tables, duplicate paid drops, or repeat-purchase chasing. Future gameplay-earned random drops, if ever considered, require a separate review and must not be conflated with paid randomness.

## Profiles, privacy, and Featured Players

Explore a richer optional profile with display name, favourite game, evolving emblem, support progression, achievements, collectible showcase, unlocked cosmetics, selected game statistics/personal bests, and supporter-since information. The profile remains private/account-only by default. No field becomes public automatically.

| Treatment | Candidate fields |
| --- | --- |
| Private/account-only by default | Account-linked support/payment-derived details, exact progression value, unselected statistics, and any fields not explicitly published by the player. |
| Potentially public only after explicit opt-in | Display name, favourite game, emblem, selected achievements/collectibles, selected statistics/personal bests, and supporter-since information, each independently reviewed for privacy and age suitability. |
| Never public | Email, payment details, provider/customer/account IDs, internal identifiers, and private support correspondence. |

Public profiles need a deliberate allowlisted projection, consent and withdrawal, privacy/age review, moderation/reporting and suspension handling, deletion/cache behavior, and an accountable operator before release. Do not automatically expose exact spending or imply that a profile must be public to receive benefits.

Reconsider the deferred supporter spotlight as a broader future **Featured Players** surface. Reasons could include a notable gameplay accomplishment, achievement, interesting profile/collectible, community or support recognition, or editorial/fair random selection. Paying must never guarantee top placement or buy ranking. Selection, fairness, cadence, moderation, privacy, age/guardian consent, withdrawal, and abuse handling require later decisions. Featured Players remains outside the first payment implementation; no algorithm is approved here.

## Game rank and progression from play

Future game leaderboards are a separate product and architecture track. **Money must not affect game rank.** A free player must be able to hold the #1 score. An emblem may appear beside a supporter as identity/prestige only, with no scoring effect.

Current statistics are local/device-recorded and cannot be uploaded as trusted competitive results. Online leaderboards require a separate security and product milestone for authoritative score submission, tampering/cheating, validation and impossible scores, rate limits, moderation, privacy, account deletion, and each game's definition of a comparable score. No leaderboard is implemented or designed in M17A/M17A.1.

Keep play accomplishment and support as two related, distinguishable sources of progression:

- Achievements and play-earned collectibles can recognize skill, persistence, or exploration.
- The evolving Star/emblem can recognize verified support.
- A profile may show both, so a skilled or long-term non-paying player can have a rich and impressive profile.

Do not invent a general XP economy or imply that play achievements need payment. Exact interaction between these sources remains open.

## Refunds, disputes, and reversals

Preserve M17A's immutable financial event history and derive current progression deterministically from verified payment history. A refund or chargeback should create a reversal event and trigger recalculation; it should not erase the original transaction record. A disputed payment may require a pending state; a reversed dispute should restore the appropriate derived progression from the same history. Partial refunds need a defined proportional or transaction-level rule before implementation. Crossing an evolution threshold should be handled by recomputing the current emblem from eligible net/verified support, with an auditable rule and calm explanation.

Still open: whether a full reversal revokes supporter-only cosmetics already revealed or collected; treatment of partial refunds, fees/tax and multiple currencies in progression; how long a chargeback holds progression; and appeal/support handling. Decide these before progression entitlements ship. Never delete financial history to make an entitlement disappear.

## Provider economics and platform-neutral architecture

M17A's dated provider research remains background, not a selection. The low impulse-level option makes fixed per-transaction fees material. M17B must model realistic net proceeds at plausible low price points for **Paddle, Lemon Squeezy, and Stripe**, including payment method, region, currency conversion, refunds, and payout costs, and compare operational/legal responsibility. Paddle and Lemon Squeezy are Merchant-of-Record options; Stripe is a capable payment processor that generally leaves seller responsibilities with ZenPlay unless separate services and arrangements address them. Do not characterize Stripe as inherently unsuitable. Confirm current fees, eligibility, terms, tax responsibilities, and operator burden from primary sources before deciding. Provider choice remains an owner decision.

Keep progression, collectibles, and entitlements independent of any one payment vendor. Conceptually:

`payment/platform adapter → verified ZenPlay event → progression/entitlement system`

Potential future grant sources include web purchases, Steam, achievements, and promotional/manual grants if separately approved. Internal records should preserve source and reason. This is a design constraint for future work, not an abstraction to implement now.

Steam is a future feasibility exploration only. A later desktop distribution could offer discovery, achievements, leaderboards, native purchases, profile integration, or offline play. Do not change the current web/PWA architecture or add Steam SDK/API support now. At that future milestone, check Valve's then-current commercial and platform rules; do not assume web purchases can be reused in Steam.

## Payment trust model retained from M17A

Keep the security boundary unchanged:

`browser → authenticated server-created checkout → hosted provider payment → verified webhook → immutable/idempotent financial events → derived progression/entitlements`

The browser must never claim payment success, supporter progression, emblem evolution, collectible ownership, or entitlement ownership. Checkout is account-bound and server-created. Only verified provider events can affect the financial ledger; derived progression and grants are server-controlled. Preserve M17A's webhook signature, event validation, idempotency, least-data, RLS, deletion/retention, and reconciliation requirements. No payment SDK/provider product/account, migration, or implementation is authorized by this product-direction document.

## Revised milestone sequence

This is a bounded proposal; each implementation milestone needs its own approval and prerequisites. Payments can launch before public profiles, Featured Players, leaderboards, or Steam.

| Milestone | Scope and gate |
| --- | --- |
| **M17B — Commercial and provider decisions** | Approve offer framing, account requirement, low-price scenarios, refund/support/retention/age/privacy terms, operator burden, and provider after realistic Paddle/Lemon Squeezy/Stripe net-proceeds comparison. No implementation. |
| **M17C — Payment ledger and trust boundary** | Implement server-created checkout intents, immutable/idempotent financial events, verified webhooks, reconciliation, account binding/deletion retention, and private read path. Keep supporter benefit minimal until next gate. |
| **M17D — Support progression rules** | Define deterministic progression inputs, thresholds/form evolution, source separation, reversals, restore, and accessible private display. No broad cosmetics catalog. |
| **M17E — Collectibles and entitlement grants** | Define reason/source-aware grants, ownership, revocation/recalculation, equip state, compatibility and privacy. Include gameplay/achievement sources in the model; no payment-only assumption. |
| **M17F — Supporter UX and deterministic reward reveal** | Build the approved one-off support journey, pending/verified/refund states, reward reveal for predetermined earned rewards, and a small reviewed set of benefits. No public surfaces or paid randomness. |
| **M17G — Rich private profiles** | Add optional private presentation of selected play achievements, statistics, collectibles, and support emblem; privacy controls and device-recorded labels. |
| **M17H — Public profiles and Featured Players discovery** | Separate approval after moderation, consent, age, privacy, fairness and operational ownership are ready. No pay-to-rank. |
| **M17I — Online leaderboard architecture** | Separate game-by-game competitive trust, score validation, anti-cheat, moderation, privacy and deletion design. Money has no rank effect. |
| **M17J — Steam feasibility** | Evaluate packaging, platform/commercial rules, purchase-source verification and progression integration. No commitment to distribute or integrate. |

Existing M17A phases for checkout, verified webhook ledger, account restore and operational readiness remain useful implementation detail but must be rescheduled and expanded under the gates above; old M17A's provider preference and initial private-badge-only benefit are superseded. No implementation begins automatically from this sequence.

## Owner decisions still required

1. Choose the eventual progression terminology and whether the emblem is explicitly a Star; no name is final.
2. Approve a progression rule and thresholds, including whether only net verified support advances it and how currencies/tax/refunds are normalized.
3. Set actual one-off price points only after the M17B fee/net-proceeds and legal/operational comparison.
4. Decide which deterministic cosmetics, if any, accompany support and which are earned through play; approve each after accessibility review.
5. Decide full/partial refund and chargeback treatment for progression and already-revealed/owned cosmetics; provide appeal/support handling.
6. Confirm account, age/guardian, consumer terms, privacy, retention and provider obligations with appropriate advisers before checkout.
7. Decide whether profiles may later be public and whether Featured Players is worth operating; define consent, moderation owner and withdrawal/deletion behavior first.
8. Approve separate future scopes for competitive leaderboards and Steam only if pursued.

## Verification and scope

Documentation only. The implementation/prototype audit is recorded in M17A: supporter fixtures and UX remain fictional; there is no payment SDK, payment schema/migration, checkout, webhook, real progression, collectible entitlement, public profile endpoint, or leaderboard. No code, game mechanics, provider account/product, migration, or deployment changed as part of this direction. No tests were run because executable behavior did not change.
