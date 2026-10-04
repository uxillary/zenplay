# M17B — Commercial Model and Payment Provider Decision

**Status:** Research and recommendation, not implementation approval. No provider has approved ZenPlay's offer, no provider or product/account exists, and no live prices are selected. Reviewed **3 October 2026** using current official provider, UK government/legislation, and Valve documentation. Fees and terms can change; exact seller-specific quotes and legal/accounting treatment remain to be confirmed.

> **Superseded owner decisions:** [M17A.2](M17A2_SUPPORTER_MONETISATION_DECISIONS.md) selects Stripe for initial web payments and sets £2 / £5 / £10 one-off offers. This M17B document remains historical commercial/provider research; its conditional Paddle recommendation, provider uncertainty, and proposed price research range are not current decisions. Stripe/provider acceptance and legal/accounting verification remain launch gates.

## Executive recommendation

Proceed to implementation planning only after the owner accepts the commercial and legal gates below. For a first monetised release, prefer **a hosted Merchant of Record (MoR), conditionally Paddle**, if Paddle confirms in writing that the one-off support purchase tied to deterministic digital cosmetics fits its product and seller policies and provides an acceptable low-price fee/payout offer. Its currently documented GBP minimum of £0.55 supports all modeled price points, but its standard fee has a fixed US$0.50 component (about £0.38 at an illustrative £1=$1.32, before any FX spread), which is costly below £3.99.

If Paddle declines or does not offer viable economics, ask **Lemon Squeezy** to approve the exact offer and quote fees for GBP checkout and UK payout; its published 5% + US$0.50 fee, international surcharge rules and payout threshold make tiny purchases similarly difficult to model, and store activation is product-dependent. **Stripe is a credible fallback and may be cheaper on UK standard cards**, with excellent server-created hosted Checkout/API functionality, but requires Adam to own the seller-facing tax/consumer/refund/support and reconciliation operations. Stripe's restricted-business policy also requires careful classification: describe purchases as sales of specified digital entitlements, not charitable donations, and seek account approval if the offer could be considered game items/stored value.

**No final provider selection is justified by public documentation alone.** Paddle is the conditional operational preference, Stripe is the transparent UK domestic-card economic benchmark, and Lemon Squeezy needs a specific GBP proposal. Owner should decide after provider confirmation, exact fee simulations and professional review. This is not legal, tax, or accounting advice.

## 1. Commercial product under evaluation

M17A.1 is current product direction; M17A and M13 remain decision history. ZenPlay has seven free games, no adverts, optional accounts for ordinary play, local/offline game functionality, and accessibility that must remain free. Purchases require an account and may advance a permanent account-backed progression/emblem and grant predetermined cosmetic collectibles. No purchase grants gameplay advantage, hints, lives, energy, hidden information, easier interaction, or leaderboard rank. No subscription, gambling, paid random reward, FOMO, or scarcity mechanic is in scope.

The support offers are purchases of specifically described digital benefits/support recognition, not charitable donations or tax-deductible gifts. The eventual legal characterization depends on the contract and actual presentation and must be reviewed. Nothing in this paper sets a public term such as “Stars,” a final price, or a production offer.

Repository confirmation: current `main` has optional account/private-profile foundations and a clearly fictional static supporter prototype; README states that no purchases are available. No checkout, payment ledger, migration, provider SDK, progression, or entitlement implementation was found. The working tree was clean when this research began.

## 2. Low-price economics

### Representative UK scenario

Table inputs:

- **Stripe:** published standard UK consumer card price of 1.5% + £0.20 per successful charge; calculations round fee to nearest penny. Net is before tax, refunds, disputes, payout costs, or any Stripe Tax service.
- **Paddle:** standard Checkout fee is 5% + US$0.50. For illustration only, convert the fixed USD fee at **£1 = US$1.32**, so the fixed component is £0.379; total fee modeled as 5% + £0.379. Paddle says actual pricing can vary/alternative fee schedules can apply. This is a comparison estimate, not a GBP quote. Paddle's GBP minimum is £0.55.
- **Lemon Squeezy:** standard published fee is 5% + US$0.50; add its documented +1.5% for an international transaction, illustrated here as a UK sale under its published international rule. Same £1=$1.32 illustration. Hence modelled fee is 6.5% + £0.379. Lemon Squeezy says additional edge-case fees may apply; payout fee/conversion and its $50 minimum payout are excluded. GBP-specific fixed fee treatment is not clearly published; obtain a written quote before launch.

Assume consumer-visible price equals the modeled charge total, no additional VAT is added at checkout, no conversion of transaction amount is needed for the Stripe example, and fixed USD provider fees are converted as above. For MoR offers, tax treatment, tax-inclusive/exclusive display, and fee basis need provider-specific simulation: the fee may be based on order value including tax, so the table can overstate net where VAT is included in the advertised amount. It must not be used as a final margin forecast.

| Modeled GBP amount | Stripe fee | Stripe net | Stripe fee % | Paddle illustrative fee | Paddle net | Paddle fee % | Lemon illustrative fee | Lemon net | Lemon fee % |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| £0.99 | £0.21 | £0.78 | 21.7% | £0.43 | £0.56 | 43.4% | £0.44 | £0.55 | 44.4% |
| £1.49 | £0.22 | £1.27 | 14.9% | £0.45 | £1.04 | 30.4% | £0.48 | £1.01 | 32.1% |
| £1.99 | £0.23 | £1.76 | 11.5% | £0.48 | £1.51 | 24.2% | £0.51 | £1.48 | 25.6% |
| £2.99 | £0.24 | £2.75 | 8.2% | £0.53 | £2.46 | 17.7% | £0.57 | £2.42 | 19.0% |
| £3.99 | £0.26 | £3.73 | 6.5% | £0.58 | £3.41 | 14.6% | £0.64 | £3.35 | 16.0% |
| £4.99 | £0.27 | £4.72 | 5.5% | £0.63 | £4.36 | 12.6% | £0.70 | £4.29 | 14.0% |
| £7.99 | £0.32 | £7.67 | 4.0% | £0.78 | £7.21 | 9.8% | £0.90 | £7.09 | 11.3% |
| £9.99 | £0.35 | £9.64 | 3.5% | £0.88 | £9.11 | 8.8% | £1.03 | £8.96 | 10.3% |
| £14.99 | £0.42 | £14.57 | 2.8% | £1.13 | £13.86 | 7.5% | £1.35 | £13.64 | 9.0% |

Calculations use unrounded component values, then round displayed fees/nets to pennies; percentages use unrounded fee. For reproducibility:

- Stripe fee = 0.015 × price + £0.20.
- Paddle illustration = 0.05 × price + ($0.50 ÷ 1.32).
- Lemon illustration = 0.065 × price + ($0.50 ÷ 1.32).

**Interpretation:** £0.99 and £1.49 are feasible against Stripe's UK standard card fee, though a 15–22% charge is still meaningful. They are poor MoR economics under the published USD fixed component, with roughly 30–44% modeled fee. At £1.99–£2.99, the MoR fixed fee remains 18–26%; around £3.99–£4.99, Stripe is 5.5–6.5% and the MoR estimates about 13–16%. The fixed component is the main penalty on all three but much heavier in MoR pricing. Stripe international cards add 2.5% + £0.20 for EEA or 3.15% + £0.20 for other international cards, plus 2% if currency conversion is required. Premium UK cards are 2.8% + £0.20. Low-cost local methods can differ.

Paddle's £0.55 GBP minimum means all requested modeled values pass the platform's published threshold, but account settings/offer review and payment method can affect availability. Lemon Squeezy's public pages reviewed did not establish a GBP minimum charge. Its published $50 payout threshold and twice-monthly schedule delay cash receipt; for UK bank payout, currency conversion/payout-provider costs may apply (the precise pricing page says outside-US bank payout through Stripe can incur 1%; payout documentation says fees vary by method/region). Paddle has monthly payouts at a minimum £100 threshold for GBP balance; local GBP-to-UK-bank payouts are typically free, while cross-currency/Payoneer/bank costs may apply. Stripe account-specific payout schedule and balance thresholds require confirmation; its UK pricing page has no per-payout fee in the standard domestic card calculation.

Fee modeling omits VAT effects, provider-specific payment mix, FX spread, chargebacks, refunds, reserves, payout fees and income tax. For MoR, calculate the provider settlement on each test scenario using its pricing preview/quote and clarify whether the presented price is VAT inclusive. Do not multiply small one-off purchases into a gross-revenue forecast without repeat rate evidence.

## 3. MoR versus direct Stripe for Adam in Scotland

| Work / risk | Paddle or Lemon Squeezy as MoR | Stripe direct processor |
|---|---|---|
| Buyer contract and seller identity | Provider says it is seller/reseller to the buyer for covered transactions; checkout, order documents and statement descriptor identify it. The supplier still defines and supplies the digital entitlement under the supplier arrangement. Check the exact current buyer/supplier terms and offer classification. | Adam/ZenPlay sells directly to the buyer. Stripe processes payment; the checkout being hosted does not make Stripe the seller. ZenPlay must identify its seller/trader and provide offer terms and support route. |
| Transaction taxes | MoR says it calculates/collects/remits covered indirect taxes for supported transaction types/territories. Coverage depends on contract/product classification and seller must still provide accurate data. It does not settle Adam's income tax or business bookkeeping. | Adam determines whether/where VAT or other transaction tax applies and whether to register/file. Stripe Tax can calculate and may offer registration/filing services through partners in some locations; it is a tool/service, not MoR and does not transfer the seller's tax position by itself. UK threshold/rules and cross-border digital supply classification need adviser review. |
| Receipt/invoice | Provider issues buyer invoice/receipt and may provide buyer billing help/portal. Paddle supplies monthly statements, reverse invoices and remittance documents; Lemon Squeezy supplies seller payout invoices and orders. Adam must reconcile provider reports and retain records suitable for his tax/accounting position. | Stripe can send receipts and generate payment records; account must configure fields/content and ensure contract confirmation/pre-contract information. Adam must ensure receipts are complete and maintain sales, fee, tax, refund and payout records. |
| Refunds/disputes | Provider receives/handles payment refund/dispute requests as MoR and may refund under its policies and mandatory law; it can deduct refunds, disputes and charges from seller proceeds, and may suspend products for high ratios. Adam still supports entitlement delivery/technical defects, helps provider resolve complaints, and updates ZenPlay access based on verified events. Paddle's public seller agreement allows refunds at its discretion and may charge dispute-related costs up to £20; Lemon Squeezy says it may refund within 60 days and may deduct a $15 dispute fee in typical chargeback cases. These are not costless guarantees. | Adam decides/initiates refunds, responds to issuer disputes with evidence, bears dispute amounts unless finally resolved in his favour, and owns complaint/support operations. Standard UK Stripe fee page lists £20 received dispute fee and £20 countered fee (countered fee returned if won); original processing fee is not returned when refunding, although standard card refund initiation itself usually has no extra fee. |
| International sales | Provider acts as reseller/MoR and handles indirect tax only for products/territories within contract; localized checkout/currencies may be offered. Approval, sanctions, countries, payment methods, currency and refund rules vary. | Adam remains seller across supported markets. Stripe facilitates local methods/currencies and may offer Tax tools, but ZenPlay needs to assess tax registration/consumer obligations, FX and support per market. Begin with deliberate supported territory scope. |
| Data | MoR has buyer billing/payment data and shares transaction facts needed for entitlements/accounting/support. ZenPlay remains responsible for its own account/profile/payment linkage, privacy notice, lawful basis, retention, deletion, security and data minimization. | Stripe processes card/billing data as processor/service provider under its terms, while ZenPlay receives more direct transaction/customer data and has corresponding controller/seller duties. Hosted Checkout reduces card-data exposure, not privacy/recordkeeping obligations. |
| Approval/onboarding | Paddle reviews domain and seller; its stated target is digital products/software/games, and individual/sole trader identity verification is possible, but it may require additional information. Lemon Squeezy runs KYC/KYB and product/store activation; it typically approves digital goods it can fulfill and does not typically approve external services. Neither provider has approved this exact product. | Stripe requires activation/business profile/KYC and website/app URL. Its restricted-business policy specifically flags sale of in-game currency/items (unless operator of virtual world), stored value/credits, and donations/reward-for-donation categories. ZenPlay must avoid wallet/credits framing and seek written classification/approval for account-backed progression plus cosmetic items. This is a real gate, not a conclusion of ineligibility. |
| Solo-operator burden | Lower day-to-day indirect-tax, buyer billing and first-tier payment support burden; still requires seller support for game/account delivery, monthly reconciliation/bookkeeping, privacy and provider relationship. Payout thresholds affect cash flow. | Lowest published domestic fee and strong self-serve tools, but Adam is merchant/operator: terms, VAT and international scope, consumer disclosures, receipts, refund decisions, chargeback evidence, support, records and reconciliation all need named ownership. Tax tooling can help but not assume liability. |

For Adam as an individual in Scotland, a MoR does not mean “no legal/accounting work”: record gross sales, fees, refunds, payout and income; review self-employment/trading status, income tax/NI and any reporting obligations with an accountant; maintain product representations/support/privacy and account deletion processes; and confirm VAT treatment of MoR settlements. HMRC says its VAT registration threshold is currently £90,000 taxable turnover, but this is not a full answer to product/cross-border treatment. Stripe direct means additionally checking consumer contract/tax obligations as the direct trader. The legal relationship and product classification need UK professional advice.

### Fit for repeat small purchases and implementation later

| Capability | Paddle | Lemon Squeezy | Stripe |
|---|---|---|---|
| Repeated one-off purchase | Supported via one-time products/transactions; fixed fee repeatedly incurred. Account offer limits and prices can be server controlled. | Supported; custom checkout per order, repeated purchase possible; fixed fee and payout threshold significant. | Supported through payment-mode Checkout sessions; fixed 20p repeatedly incurred. |
| Hosted mobile/PWA checkout | Hosted/overlay and Checkout; test in mobile Safari/standalone PWA; same-tab redirect is simplest fallback. | Hosted checkout/API returns URL, overlay possible; mobile review needed. | Hosted Checkout and Payment Links; responsive, with server-created Checkout the preferred future account-bound integration. |
| Account metadata | Transaction `custom_data` and internal checkout/transaction reference. | Checkout custom data appears in order webhooks. | Checkout `client_reference_id` and metadata; server-held account binding. |
| Webhook/security | Signed webhook notifications, sandbox/simulator, idempotent event design required by ZenPlay. | Signed `X-Signature`; test-mode webhooks, replay/resend; custom data. | Signed webhooks, test mode/CLI; API idempotency keys for safe retries. |
| Refunds/disputes | Full/partial adjustments; some live refunds need approval, immutable adjustment events and chargeback reversals. | Seller can refund; provider reserves discretionary refund, handles many chargebacks, may deduct $15 dispute fee; signed order-refunded webhook. | Full/partial refund API; Adam owns decisions/evidence; fixed dispute costs. |
| Customer record/receipt | Provider manages buyer receipts/invoices and has buyer support/customer portal. | Receipt email/order dashboard and customer billing portal/history features; seller still provides entitlement support. | Receipts are configurable; customer portal not necessary for one-off but customer transaction history/support requires seller solution or Dashboard operations. |
| Payouts/solo ops | Monthly, £100 GBP minimum; local GBP payout generally no provider transfer fee; reconcile statements/reverse invoices. | Twice monthly, 13-day hold, $50 minimum; local payout conversion/provider charges possible. | Flexible, account/country/risk-dependent payout schedule; confirms lowest fee only after card/currency mix and bank verification. |
| Decision issue | Fee plan for sub-$10 seller needs written quote; low-end MoR net is weak. | Price/support offer eligibility and GBP economics need written answer; dollar fee and payout floor. | Direct trader obligations and classification approval; not technically or economically unsuitable. |

## 4. UK one-off digital purchase and refunds: owner checklist

The following is a high-level issue list from legislation and GOV.UK guidance, not legal advice. Do not assume a small, one-off purchase is outside consumer rules because it is called “support.” A specific account progression/collectible is a tangible digital benefit and can affect contract classification.

Before checkout, a UK adviser should determine:

1. **Who contracts with the buyer?** Under Stripe, Adam/ZenPlay is the seller. Under MoR, the provider typically sells/resells the digital product to the buyer under its buyer terms while Adam supplies it under the supplier terms. Check the provider's current UK-specific buyer terms, who handles withdrawal and statutory claims, and what product contract the buyer sees.
2. **What is being supplied?** A payment with an evolving progression entitlement, deterministic digital collectibles, or both may engage digital-content/service rules. Avoid “donation” wording without confirmation that the legal and provider classification supports it. State precisely the entitlement, timing, permanence/restore limitations, and any conditions.
3. **14-day distance-contract cancellation:** Digital content not on a tangible medium normally has a 14-day cancellation period. For immediate supply during this period, the trader needs the consumer's express consent to begin and acknowledgement that the cancellation right will be lost, plus required contract confirmation. Determine how an emblem/progression entitlement qualifies and record consent in an accessible, unbundled way. Do not treat a generic checkout click as automatically sufficient.
4. **Defective or not-as-described benefits:** The Consumer Rights Act has digital-content conformity requirements, with repair/replacement and, in specified circumstances, price-reduction/refund remedies. A no-refunds sentence cannot remove mandatory rights. Define who remedies missing grants, restoration failure, incompatible items, and service interruption.
5. **Voluntary refund policy:** Set a calm, discoverable policy for mistaken purchases and support requests beyond minimum rights; define treatment of consumed/revealed reward, progression recalculation, and how to reach the actual decision-maker. A provider may refund under its own policy even if ZenPlay's policy differs.
6. **Chargebacks/disputes:** Provide a clear billing descriptor and support route, preserve purchase/delivery/consent records, respond within provider windows, and define temporary entitlement suspension/reversal/reinstatement. Do not promise the provider will absorb all financial costs.
7. **Pre-contract information:** Show seller/trader legal name and geographic/contact details (including a usable email), product's main characteristics, total price including applicable taxes/mandatory fees, payment method, delivery/supply timing, account requirement, restore limitations, cancellation/refund path, terms and complaint handling. Provide durable confirmation/receipt.
8. **Price presentation:** Make each choice a clear one-off GBP price and state if/when taxes or currency conversion change what is payable. Confirm whether the MoR localized checkout alters price; avoid drip pricing, default selections, guilt or urgency. The “pay now” action must clearly signal payment.
9. **Age, privacy, retention and tax:** Set minimum age/guardian approach; minimize account/buyer data; document controller/processor roles and international transfers; decide retention/deletion of minimal financial records; and have an accountant classify gross receipts, fees, refunds and payout reporting.

Relevant official UK sources: Consumer Contracts Regulations 2013 (particularly regs. 29–30, 37 and Schedule 2); Consumer Rights Act 2015 (Part 1, Chapter 3); GOV.UK online/distance-selling and price-transparency guidance. Citations below.

## 5. Pricing structure recommendation

| Approach | Benefits | Risks/trade-offs |
|---|---|---|
| A — several fixed support choices | Clear one-time amount, predictable progression unit, easy hosted checkout, accommodates an impulse entry and larger voluntary support. | More offer/configuration entries and can imply status tiers if named Bronze/Silver/Gold; fixed MoR fees make the smallest choice low net. |
| B — one repeatable base pack | Easiest to explain and balance: same deterministic increment each time; no “best value” pressure or relative pack ladder. | Repeated checkout friction and fixed provider fee every time; can nudge repeated purchases to reach a progression threshold if poorly presented. |
| C — several packs with modest value scaling | Lets generous supporters contribute more while reducing proportional provider cost per pound. | “Best value” framing, exclusive item tiers, and progression-per-pound comparison can become pressure; more complicated refund math and cross-platform economics. |

**Recommend a restrained version of A:** a short set of one-off fixed offers, neutral labels such as Small/Regular/Larger/Generous, equal clarity about progression and deterministic benefit, with no badge tier, sale label, “best value” marker, timer, or comparative social status. Do not finalize amounts. As a starting research range for user comprehension, test **£1.99–£4.99 as the core choices**, with **£0.99 only if owner accepts a 20%+ Stripe or roughly 40%+ illustrative MoR fee burden**, and optionally £7.99–£9.99 for voluntary larger support. £14.99 is not needed in the first set. These are recommendations for research, not approved prices. A single repeatable base purchase is the second-best option if the owner prioritizes simplicity over transaction friction. Avoid giving progressively more progression per pound; reward amount can scale in simple deterministic increments but the cheapest offer should remain meaningful and no exclusive desirable item should require the highest amount.

Accessibility: prices, one-off nature and exact rewards must be screen-reader clear and keyboard/zoom/mobile usable; don't use color alone or animation to communicate amount/ownership. Checkout must be hosted and tested at small screens/PWA contexts. Purchases never change accessibility settings or game interaction.

## 6. Tangible reward package and progression concept

### Initial reward model

Every verified purchase should create an immediate tangible result, at least a small deterministic advancement of the persistent emblem and an account history/recognition entry. Avoid selling an empty “support only” choice if the product direction promises tangible benefit. Not every purchase needs a unique cosmetic: use progression milestones for a few carefully reviewed collectibles, so benefits remain understandable and don't force constant item production. The first release could include:

- private profile recognition and visible progress toward the single evolving emblem;
- immediate evolution if the verified deterministic progression crosses a stage threshold;
- one or two predetermined, accessible cosmetics total (e.g., one profile accent and one Solitaire card back) granted at an early progression milestone;
- simple ownership/restore from the authenticated account and return-to-default control.

Do not include a table/felt, multiple game-board themes or showcase slots in initial monetised launch absent user testing. Keep the free defaults excellent. All cosmetics require accessibility review for contrast, suit/rank identity, focus, state, reduced motion, large text/pieces, screen readers, Simple Mode, zoom, touch and keyboard. Cosmetic must never make interaction objectively easier than accessible free baseline.

Some rewards may later also be gameplay-earned, particularly profile accents/card backs of comparable desirability, so payment is not the only path to a rich profile. Do not make a rare/most desirable cosmetic exclusive to the highest pack. Higher support can advance the emblem farther but no exclusive gameplay or unique prestige status.

### Progression concept (not algorithm approval)

Recommend an **event-unit progression mapped to a bounded early emblem ladder**, with no wallet or currency balance shown. For example, five visual stages (base plus four evolutions) for early exploration; names/art/thresholds remain open. Internally, define a versioned table mapping each server-configured offer/event to an integer number of progression units. Browser cannot send that unit. Recompute eligible units from verified financial events and reversal events; derive current stage and next stage. Show one emblem and, if useful, plain-language text like “Progress toward next emblem form” rather than repeated star tokens, currency or a countdown.

This avoids floating-point money totals and handles future source adapters: signed provider event → normalized ZenPlay financial/grant event → versioned deterministic offer units → current progression stage. A later support purchase months later adds its defined units; several small offers add by summing units; one larger offer grants its preconfigured units. Multiple currencies use the server-known offer ID and unit mapping, not FX conversion at each receipt. Reconfiguration must be versioned and must not rewrite past grants without an explicit audited migration/product decision. Refund/reversal events subtract or disqualify the related grant deterministically.

Separate PLAY prestige (achievements, validated accomplishments, gameplay-earned collectibles) from SUPPORT prestige (emblem and support-granted predetermined collectibles). A person may have neither, either, or both. Current device statistics remain local/unverified and cannot become competitive rank. Money never affects score/rank.

## 7. Refund/reversal product recommendation (owner approval required)

Financial event records are append-only. A refund/chargeback adds a reversal event; it never deletes the successful transaction. Derive live eligibility from net verified events, without reversing other unaffected purchases.

| Event | Recommended entitlement behavior |
|---|---|
| Partial refund | Reduce eligible units proportionally only when provider gives a clear refunded amount in the transaction currency; convert to integer units using a versioned deterministic rule. If ambiguous due to tax/fee/refund rounding, reverse the affected offer's grant as a whole and document why. Prefer avoiding partial refunds as an offer mechanic. |
| Full voluntary/statutory refund | Reverse that purchase's units. Recalculate emblem stage. Revoke supporter-only cosmetic entitlements granted solely by that purchase or by milestones no longer met, but retain earned/play grants. Communicate before checkout that purchase-tied benefits can be removed after refund. |
| Chargeback opened / warning | Mark that event disputed and put the purchase-derived units/items into a reversible pending state; suppress use of the affected support-only cosmetic and recalculated stage while unresolved. Avoid an account ban or punitive treatment of unrelated play. |
| Chargeback won for ZenPlay/provider | Restore the original derived units and eligible cosmetics automatically from immutable events; notify calmly if the user saw a temporary change. |
| Chargeback lost / refund completed | Keep reversed units and revoke solely purchase-derived benefits. Preserve earned progress and non-payment collectibles. Offer support route for mistaken/identity disputes. |
| Evolution threshold crossed | Recalculate stage from all still-eligible units. Do not permanently pin an evolved emblem after the supporting transaction was fully reversed. |
| Reward already revealed | Reveal is an animation of entitlement, not consumption. The system may retain a non-public historical reveal receipt for support/audit, but the item is not usable if its grant is reversed. Never randomize/re-roll on refund. |
| Cosmetic currently equipped | Revoke ownership server-side after reversal; if cached offline, allow a stale cosmetic until revalidation or fall back gracefully on next connection. Do not break game UI or save data. On reconnect, enforce current server-derived state. |

This is the recommended coherent policy, not an owner-approved policy. Obtain legal advice on statutory refund rights and provider contract terms; retain a reasonable voluntary support policy and human escalation for edge cases. Account deletion must retain the minimum financial evidence required by legal/accounting obligations and remove/suppress account-linked display as disclosed.

## 8. Paid-randomness/reveal boundary

**Paid random rewards are prohibited.** No paid loot boxes, randomized paid rarity, purchasable keys/crates, chance-based cosmetics, odds tables, duplicate paid drops, or repeated purchases to chase a result. An approved presentation may be:

`payment verified → fixed reward package becomes available → player opens/reveals it → predetermined progression units and predetermined collectible/milestone are shown`

Determine contents and entitlement before opening; opening time cannot change the reward. Explain what is included. A player can skip animation and still receive the same entitlement. Gameplay-earned random drops, if ever proposed, are a separate future product/safety review and must not be tied to payment.

## 9. Provider-neutral architecture and Steam compatibility

Keep provider/platform facts at adapter boundaries:

`verified external event → normalized ZenPlay event → progression / entitlement grant`

Normalized grants retain source and reason. Progression never reads Paddle/Stripe/Lemon Squeezy object IDs directly. Store provider IDs and financial attributes only in the payment adapter/ledger boundary and link by opaque internal checkout/account reference. The browser cannot claim purchase, units, evolution or ownership. Keep M17A's server-created authenticated checkout, hosted provider payment, signature-verified webhook, immutable/idempotent events, and server-derived entitlements.

Valve documentation reviewed 3 October 2026 confirms a free-to-play Steam store type, Steam achievements/stats and application-specific leaderboards, Steam Direct onboarding with a currently published $100 USD-equivalent app fee (recoupable after $1,000 adjusted gross revenue, per current page), and Steam Wallet/API requirements for in-game purchases. Steam describes itself as payment processor for its microtransaction API and places fraud/inventory reconciliation and item grants on the game's backend/developer. Steam Inventory Service may provide an item inventory but brings its own ItemDef/purchase/drop model. A future Steam build may need a separate platform adapter and possibly platform-specific product catalog/entitlements; do not promise web purchase portability. Keep cross-platform account linking optional and consentful, never require web checkout to use Steam build, and do not store a provider-specific currency or ID as the canonical entitlement identity. Current Steam commercial rules must be rechecked before any release.

Steam is future exploration only. Do not alter the web/PWA architecture or add Steam integration now. Today's vendor-neutral, reason-aware entitlement design preserves flexibility without asserting a shared wallet or transferable purchase right.

## 10. Recommended first monetised release

After M17B owner and legal/provider gates, bound the first release to:

- a short set of clear, one-off GBP choices (price not selected here);
- authenticated account required before checkout; account remains optional for every game;
- one evolving private emblem with a small, fixed set of deterministic stages;
- a small immediate progression increment on every verified purchase and one or two predetermined cosmetic unlocks at modest progression milestones;
- private profile recognition, visible current emblem, clear pending/verified/reversed states, and account restore on another device;
- accessible hosted checkout, receipts, support/refund route and simple reveal that can be skipped;
- immutable financial ledger, verified webhooks, idempotent event handling, refund/dispute recalculation, and payment-aware account deletion/retention;
- no public profiles, Featured Players, leaderboards, public support totals/rank, large cosmetic store, subscriptions, Steam, or gameplay-earned random drops.

This contains more than a private badge while avoiding a community launch. If reliable restore/reversal or owner support operations cannot be delivered, delay monetisation rather than ship a client-trusted entitlement.

## 11. Revised future M17 milestones

| Milestone | Bounded objective / gate |
|---|---|
| **M17B — Commercial decision (this document)** | Provider classification/approval and pricing quote, one-off offer/reward definition, UK consumer/privacy/tax/accounting gates. No implementation. |
| **M17C — Stripe Payment Ledger & Trust Boundary** | Follow the authoritative [M17A.2 handoff](M17A2_SUPPORTER_MONETISATION_DECISIONS.md): server-created Stripe Checkout sessions, account binding, £2 / £5 / £10 one-off offers, verified/idempotent provider events, auditable payment events, derived payment state, and refund/reversal/dispute representation. Legal/provider gates and unresolved owner decisions remain open; no Aura visuals or progression algorithm absent separate approval. |
| **M17D — Provider sandbox adapter and authenticated checkout intent** | One provider sandbox, server-defined offers, account binding, hosted checkout and return/pending flow. No live prices/product. |
| **M17E — Webhook ledger, refunds and disputes** | Signature verification, idempotency, out-of-order/replay reconciliation, immutable successes/refunds/disputes/reversals; no cosmetic grant until validated. |
| **M17F — Progression and deterministic entitlement rules** | Versioned offer-to-units mapping, emblem stages, source/reason grants and reversal behavior; private server-derived state only. |
| **M17G — Private supporter UX, rewards, reveal and restore** | Account history/status, up to reviewed small reward set, skippable deterministic reveal, offline fallback, second-device restore and accessible default/equip controls. |
| **M17H — Payment-aware deletion and production readiness** | Complete retention/deletion behavior, privacy/consumer copy, operator support/reconciliation, monitoring and end-to-end verification; explicit owner go-live approval. |
| **M17I — Public profiles and Featured Players discovery** | Separate product/privacy/age/moderation/fairness approval. |
| **M17J — Competitive leaderboard architecture** | Separate game-specific trusted score submission, validation, anti-cheat, moderation, privacy and deletion design. |
| **M17K — Steam feasibility** | Recheck Valve commercial rules and assess packaging/platform adapters; no assumption of shared purchase entitlements. |

Each implementation milestone requires separate authorization. Public/community tracks cannot block an otherwise approved private purchase release.

## 12. Exact owner decisions before implementation

1. Confirm the sales proposition and contract characterization: a purchase of defined support recognition/digital benefits, not “donation” absent professional/provider approval.
2. Ask Paddle and Lemon Squeezy to review the exact product and provide seller-specific GBP low-price fee examples, tax/fee basis, refunds/dispute deductions, payout currency/schedule/minimum, retention/reserve terms, and account eligibility. Confirm Stripe classification/approval for direct-sale game cosmetics and progression.
3. Choose provider after comparing written terms, fee scenarios and solo-operator burden. Conditional recommendation is Paddle; the selection remains open.
4. Choose test prices and supported currencies/territories after those quotes; suggested research range £1.99–£4.99 core, optional £0.99 impulse and £7.99–£9.99 larger support are not approved offers.
5. Approve A-style neutral one-off choices, progression units per offer and whether every purchase adds a small tangible deterministic increment.
6. Approve initial collectible(s), milestone placement, whether any comparable rewards can be play-earned, and accessibility review owner.
7. Approve the proposed partial/full refund, disputed/chargeback, cosmetic revocation, offline-cache and appeal policy after UK consumer-law/provider review.
8. Obtain qualified advice on operator/trader identification, product/consumer contract classification, cancellation/instant supply consent, defective digital content remedies, tax/VAT/income/bookkeeping, consumer support and age/guardian approach.
9. Approve privacy data flows, provider/controller roles, retention, account-deletion exceptions and checkout disclosures; name the support/operator owner and public contact route.
10. Confirm the final first-release scope and authorize each implementation milestone separately. No production or provider setup follows automatically from this research.

## Sources (reviewed 3 October 2026)

### Provider pricing, terms, and implementation

- Stripe UK pricing, standard cards, international rates, disputes and refunds: [Stripe pricing](https://stripe.com/gb/pricing), [local payment methods pricing](https://stripe.com/gb/pricing/local-payment-methods), [refund fee explanation](https://support.stripe.com/questions/understanding-fees-for-refunded-payments?locale=en-GB).
- Paddle current legal fee schedule, seller duties and refund/dispute terms: [Paddle Master Services Agreement](https://www.paddle.com/legal/terms); [supported currency minimum amounts](https://developer.paddle.com/concepts/sell/supported-currencies/); [refund/chargeback adjustments](https://developer.paddle.com/build/transactions/create-transaction-adjustments/); [payout timing and minimum](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid); [payout fees](https://www.paddle.com/help/manage/get-paid/is-there-a-fee-taken-for-payouts); [accounting reports](https://www.paddle.com/help/manage/get-paid/what-statements-will-i-receive); [acceptable use](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle); [individual/sole-trader verification](https://www.paddle.com/help/start/account-verification/what-is-business-verification).
- Lemon Squeezy pricing, conditions and operations: [pricing](https://www.lemonsqueezy.com/pricing); [fees and international surcharge](https://docs.lemonsqueezy.com/help/getting-started/fees); [MoR description](https://docs.lemonsqueezy.com/help/payments/merchant-of-record); [refunds/chargebacks](https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks); [store activation](https://docs.lemonsqueezy.com/help/getting-started/activate-your-store); [payout schedule and $50 threshold](https://docs.lemonsqueezy.com/help/getting-started/getting-paid); [hosted checkout API/custom data](https://docs.lemonsqueezy.com/api/checkouts/create-checkout); [webhook signatures/custom data](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks); [test mode](https://docs.lemonsqueezy.com/help/getting-started/test-mode).
- Stripe operational responsibility and secure server checkout: [Stripe Services Agreement](https://stripe.com/legal/ssa), [Stripe Payments Services Terms](https://stripe.com/legal/ssa-services-terms), [restricted businesses](https://stripe.com/legal/restricted-businesses), [hosted Checkout quickstart](https://docs.stripe.com/payments/checkout/quickstarts), [Checkout Session API](https://docs.stripe.com/api/checkout/sessions/create), [idempotent requests](https://docs.stripe.com/api/idempotent_requests).

### UK consumer, tax and operator information

- [Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013](https://www.legislation.gov.uk/uksi/2013/3134) (cancellation, immediate digital-content supply consent/acknowledgement and pre-contract information).
- [Consumer Rights Act 2015, Part 1](https://www.legislation.gov.uk/ukpga/2015/15/part/1) (digital-content conformity and remedies).
- [GOV.UK online and distance selling](https://www.gov.uk/online-and-distance-selling-for-businesses/online-selling), [distance-selling information](https://www.gov.uk/online-and-distance-selling-for-businesses/distance-selling), and [price transparency summary](https://www.gov.uk/government/publications/price-transparency-cma209/providing-clear-and-accurate-prices-summary) (seller details, price, total price, contract information; price guidance updated 7 January 2026).
- [HMRC VAT threshold](https://www.gov.uk/how-vat-works/vat-thresholds), [digital services to consumers](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers), and [digital platform seller reporting](https://www.gov.uk/guidance/selling-goods-or-services-on-a-digital-platform) (classification and operator obligations require case-specific review).

### Steamworks

- [Steam Direct fee/onboarding](https://partner.steamgames.com/doc/gettingstarted/appfee), [free-to-play games and Steam Wallet purchase paths](https://partner.steamgames.com/doc/store/freetoplay), [stats/achievements](https://partner.steamgames.com/doc/features/achievements), [leaderboards](https://partner.steamgames.com/doc/features/leaderboards), [microtransactions and fraud/reconciliation](https://partner.steamgames.com/doc/features/microtransactions), [Steam Inventory Service](https://partner.steamgames.com/doc/features/inventory).

## Verification and scope

Current branch was confirmed as `main`; no branch switch or history-based merge was done. Relevant M17A.1/M17A/M13, README, infrastructure overview/services, and the account/supporter implementation context were inspected. Official sources above were reviewed 3 October 2026. Fee table arithmetic was independently calculated from the explicitly stated formulas and FX assumption; estimates are not provider quotes. This is documentation/research only. No executable code, game mechanics, migration, Edge Function, payment SDK, provider account/product, deployment, or price in the application was added or changed. No tests were run because executable behavior did not change.
