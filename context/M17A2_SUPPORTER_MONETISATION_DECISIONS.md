# M17A.2 — Supporter Monetisation Decisions

**Status:** Authoritative owner decisions consolidating M17A.1 and M17B. Documentation only. These decisions supersede conflicting earlier recommendations; historical research remains useful context. No payment, progression, profile, leaderboard, or Steam implementation is approved here.

## Decided

### Product boundaries

- All seven games remain free, ad-free, local-first, and offline-capable after install/load. Accounts remain optional for play and required before a supporter purchase. Normal gameplay must continue when payment or network services are unavailable.
- ZenPlay remains accessibility-first and non-pay-to-win. Accessibility features, lives, hints, competitive advantage, gameplay progression, leaderboard position, artificial energy, and paid random rewards are never monetised.
- No general age gate is introduced. Play requires no account, date-of-birth collection, age verification, or payment.

### Aura identity and progression

- The persistent evolving supporter identity is **Aura**; its value is shown as **Aura Level**, and visual stages are **Aura Forms**. Do not use Stars, Star Level, Bronze/Silver/Gold purchase tiers, or a spendable supporter currency.
- Aura represents support, not gameplay skill. Only verified eligible supporter purchases/events grant Aura progression. Repeated eligible purchases contribute; gameplay never does.
- Do not present a direct GBP-to-points conversion. The future server model should let each verified offer/event grant a fixed integer progression value without tying Aura to GBP or one provider.
- Player-facing Aura UI shows Aura Level and a progress bar toward the next level. It does not expose a numeric Aura-points balance. Some progression detail remains behind the scenes.
- Refunds and reversals must permit Aura to be recalculated from authoritative events. Financial/provider events remain auditable and sufficiently immutable to derive current state.
- Gameplay progression is separate future work: intended direction is an overall Player Level and potentially per-game mastery. Its XP and rules are outside M17A.2 and M17C. Money never increases gameplay progression.

### Aura Forms and rewards

- Aura should change substantially at meaningful milestones. Higher Forms should be more impressive through possible changes to silhouette, depth, facets/details, surrounding elements, glow, or restrained animation, rather than colour alone. Cosmetic and animation work retains reduced-motion and accessibility alternatives.
- The first successful support purchase awakens Aura, establishes/shows Aura Level 1, reveals/activates its progress bar, and grants at least one tangible, deterministic cosmetic or collectible.
- By default, Aura displays the Form for the current Aura Level. Later, players can equip any previously unlocked Form; their real Aura Level remains visible while an older Form is equipped.
- Supporter cosmetics primarily follow cumulative Aura progression, not exclusive high-price tiers. Multiple smaller eligible purchases can reach the same cumulative rewards as larger purchases. Gameplay can independently award desirable collectibles.
- Future collection/entitlement records capture why and from what source a collectible was earned. Paid random rewards and loot boxes remain prohibited. Reward reveals may be exciting, but the reward is predetermined.

### Refunds, reversals, and support

- Minimise refund problems through clear purchase/support UX; do not imply refunds cannot happen. There is no casual one-click in-app self-service refund button. Requests go through an appropriate support/provider process, subject to applicable consumer rights and provider requirements.
- Before checkout launches, the final flow and wording must appropriately address immediate digital supply, cancellation/consumer rights, and any required consent/acknowledgement. This record does not invent final legal wording.
- The authoritative event model must represent valid full and partial refunds, reversals, and disputes/chargebacks, and recalculate eligible Aura and payment-derived entitlements. Support-derived rewards no longer qualified after a completed reversal may lock again and automatically return if the account later qualifies. Gameplay-earned progression, achievements, and collectibles are never removed due to payment refund.
- Refunds are not punishment or account strikes.

### Provider, offers, and pricing

- **Stripe is selected** for the initial ZenPlay web payment implementation. This owner decision supersedes M17B's conditional Paddle recommendation and provider uncertainty.
- Intended trust path: `Stripe Checkout → verified Stripe server/webhook event → authoritative ZenPlay payment event → derived Aura progression/entitlements`.
- The browser is never authoritative for payment success, Aura progression, or ownership. A success redirect/query parameter is not payment proof. Raw card/payment credentials are not stored by ZenPlay.
- Keep internal event/entitlement concepts provider-neutral so another verified platform source can be supported in the future.
- Initial offers are one-off support purchases at **£2, £5, and £10**. Repeat purchases are allowed. They are not subscriptions. Do not add £1 or £20+ to the initial launch set.
- Do not use `.99` prices, fake discounts, crossed-out reference prices, countdowns, artificial scarcity, manipulative “most popular” pressure, or Bronze/Silver/Gold paid tiers.
- The hidden Aura progression values granted by £2/£5/£10 are undecided; keep them an explicit future design decision.

### Profiles, Featured Players, and leaderboards

- Future account profiles are public by default, with a clear, easy privacy control. Only an explicit allowlist of safe fields may be public. Email, payment details/history, provider identifiers, internal account identifiers, local saves, and other sensitive/private data are never public.
- Possible public fields include display name, equipped Aura Form, Aura Level, Player Level, favourite game, selected achievements/collectibles, and suitable game records. Exact schema remains future work. As ZenPlay has no age gate, the first public-profile version remains deliberately constrained: no direct messages, comments, profile photos/uploads, location, external links, or free-form biography.
- A private profile is excluded from public discovery and Featured Players. Privacy, moderation, and abuse controls must be designed before public profiles ship.
- **Featured Players** is an intended future community feature, limited to eligible public profiles. Payment never guarantees or purchases placement. Selection may recognise gameplay, achievements, collections, interesting profiles, community/editorial criteria, or support, but cannot simply rank spending.
- Online leaderboards are an intended future feature. Money/Aura never improves competitive rank or score; a free player can be #1. Aura may appear as identity beside an entry without scoring effect. Browser-local statistics are not authoritative scores. Future work needs game-specific scoring rules and server validation/anti-cheat design.

### Steam direction

- A future Steam version is a strategic target/feasibility direction, not a committed release. Avoid architecture choices that unnecessarily prevent platform integration. Do not assume future Valve/Steam commercial, achievement, leaderboard, or purchase rules.
- A future platform adapter should produce normalized verified ZenPlay events; Aura must not understand Stripe-specific concepts. No Steam work is included here.

## Deferred decisions and future work

- Exact Aura progression values for each offer/event, level thresholds, Form designs, and behind-the-scenes progression rules remain to be designed. Do not implement Aura visuals or a progression algorithm in M17C unless separately approved.
- Exact public-profile field schema, profile privacy/moderation/abuse operations, Featured Players selection/governance, leaderboard scoring and anti-cheat, Player Level/mastery rules, collectible catalog/equip experience, and Steam integration belong to later milestones.
- Payment-derived entitlement recalculation/relocking rules need detailed design from the decisions above. No broad catalogue, public community feature, competitive ranking system, or platform integration is implemented by this document.

## Requires legal/provider verification before checkout or community launch

- Verify Stripe's current seller/account/product acceptance and applicable provider requirements for the precise offer, support progression, and deterministic digital rewards.
- Obtain appropriate review of UK consumer and digital-content rules, cancellation/immediate-supply consent and checkout wording, seller disclosures, refund/support process, privacy/data-protection and retention, minors/guardian considerations, and tax/accounting obligations. Do not infer legal conclusions from this product record.
- Before payments or public community features launch, implement applicable Stripe, UK consumer, privacy, minor/guardian, and data-protection obligations. No legal wording or age-policy conclusion is supplied here.

## M17C handoff — Stripe Payment Ledger & Trust Boundary

M17C is a separate next milestone and may design/implement the payment ledger and trust boundary around these decisions. Its scope may include:

- Server-created Stripe Checkout sessions tied to an authenticated ZenPlay account; account required for purchase identity.
- Server-defined £2 / £5 / £10 one-off offers, with repeat purchases allowed and no invented Aura values.
- A verified Stripe webhook as the payment trust boundary; idempotent provider-event ingestion; immutable/auditable payment-event representation; and server-derived payment state.
- Explicit representation of full/partial refunds, reversals, and disputes/chargebacks, with reconciliation and derivation from authoritative events.
- A provider-neutral internal event boundary that could accept other verified platform sources later.
- No browser-authoritative success, payment state, entitlements, Aura progression, or ownership.

M17C must not silently invent Stripe/provider classification acceptance, final legal checkout/refund wording, retention/deletion periods, the Aura grant values or progression algorithm, Aura Forms, public-profile schema/moderation policy, collectible catalog, or payment-derived reward qualification details beyond the decided recalculation principles. It must not implement Aura visuals or progression algorithms unless separately approved. Legal/provider verification remains a launch gate. M17C itself does not authorize live checkout, public profiles, leaderboards, or Steam.
