# M18E-B Flags learning feedback

## Behaviour by mode

Learning content comes from the M18E-A lookup for `feedback.answer.id` only after an answer is submitted. No hook means no card or inactive control. Country selection, scoring, retries, region filtering, and flag assets are unchanged.

- **Classic:** existing correct/incorrect result stays visible. A matching hook is available in a collapsed **Did you know?** disclosure.
- **Practice:** a miss keeps the correct country and retry message, then shows the hook in a prominent **Remember this flag** card. A correct answer offers the collapsed optional disclosure.
- **Reverse:** flag selection state and correct-country feedback are unchanged; a matching hook uses the collapsed optional disclosure. Flag identities remain neutral before submission.

All learning cards display the hook and any supporting explanation, but never category labels or editorial source links. Missing hooks are silently omitted.

## Visual and accessibility decisions

The shared learning card has a softly contrasted rounded surface, a small decorative glyph, readable body type and line height, and a 44px-or-greater disclosure summary target. Native `<details>/<summary>` supplies keyboard operation and expanded state. Disclosure state is keyed to the question token and unmounts on continuation, so it starts collapsed each time. Expanding does not move focus. The existing answer effect still focuses the Continue action; that button remains outside the disclosure.

Feedback uses text plus a decorative check or return-arrow glyph to distinguish correct and incorrect results without relying on colour. Practice mistakes use a calm retry message. The secondary end-session action has a quieter appearance while retaining its button size and focus styling. Gameplay and results use a wider centred maximum width on desktop; the flag image can grow while remaining contained at its intrinsic proportions. Mobile widths still use the same fluid layout and normal page scrolling. No animation, remote asset, network request, dependency, service-worker change, or gameplay mode was added. Reverse retains its documented nonvisual recognition limitation.

## Verification

Automated source-level tests cover post-answer-only lookup, collapsed disclosures, Practice error/correct variants, missing-hook omission, explanations, question-key reset, feedback icons, and keeping continuation outside the disclosure. Existing tests continue to cover question generation, locking, scoring, retry scheduling, regions, replay, and Reverse labels.

**Browser visual QA: NOT VERIFIED.** The current production build's preview server started on a fresh strict port (4182), but the in-app browser timed out connecting (`net::ERR_CONNECTION_TIMED_OUT`). Thus rendered Classic/Practice/Reverse feedback, hooked/unhooked countries, disclosure interaction, desktop balance, 390px/360px/320px layouts, and 200% zoom were not observed. Source/CSS review does not substitute for visual testing. Manual keyboard and screen-reader testing were not performed; no screen-reader pass is claimed.

`npm test` passes all 189 tests. `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` pass. The production build precaches 212 entries (3,187.80 KiB), with no new remote asset or runtime service. The existing main chunk is now 571.58 kB (up from 566.76 kB before M18E-B), above the 500 kB advisory; Browserslist data is eight months old. The size change includes the new learning UI and content imported into the existing eager game bundle. Offline behavior remains supported by local bundled data and assets, but actual offline gameplay is NOT VERIFIED.

## Recommended next step

Complete the outstanding owner device/browser review from [M18D owner QA](M18D_FLAGS_OWNER_QA.md), focusing on expanded/collapsed feedback on mobile and desktop, a pilot country with an explanation (Nepal), a country without a hook, keyboard continuation, and 200% zoom. Keep all pending manual release checks open until observed.
