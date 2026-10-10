# M18E-A Flags memory hooks

## Content model

`src/games/flags/model/memoryHooks.ts` defines a local typed entry with the canonical `countryId`, a short plain-text `hook`, optional short `explanation`, one of four hook `category` values (`visual`, `symbol`, `comparison`, `country`), source title/URL references, and optional canonical `relatedCountryIds` for comparisons. The data is bundled with the app; it adds no service, dependency, or request.

`getFlagMemoryHook(countryId)` returns the reviewed entry or `undefined`. Unknown IDs and valid countries without an entry both safely return no content. There is no placeholder. Question generation does not import this module and keeps its existing all-country selection behavior.

## Pilot coverage

Twenty requested countries are covered: Japan (`jp`), Albania (`al`), Nepal (`np`), Fiji (`fj`), Zambia (`zm`), Canada (`ca`), Brazil (`br`), South Korea (`kr`), India (`in`), Switzerland (`ch`), Jamaica (`jm`), Bhutan (`bt`), South Africa (`za`), United Kingdom (`gb`), Greece (`gr`), Mexico (`mx`), Saudi Arabia (`sa`), Kazakhstan (`kz`), Argentina (`ar`), and Seychelles (`sc`). All IDs exist in the unchanged canonical 195-country registry.

The pilot includes geometric fields, symbols and emblems, unusual shapes, useful similarity comparison (Mexico/Italy), and a historical-country fact (Nepal). Most hooks focus on visible features; the symbol entries use short, sourced history or meaning. They use concise British English; no unsupported symbolic colour meanings or folk explanations are included.

## Sources and editorial policy

Each entry records a specific national-flag reference. Most entries cite a country-specific [Flags of the World (FOTW)](https://www.fotw.info/flags/country.html) page, a specialist vexillological reference. Brazil’s geometric description links to the [Brazilian Presidency’s National Flag page](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional). India’s Dharma Chakra statement uses [Know India](https://knowindia.india.gov.in/my-india-my-pride/indian-tricolor.php); Saudi Arabia’s Shahada and sword use the [Saudi National Platform](https://my.gov.sa/en/content/139); the Union Flag’s history links to [The National Archives](https://www.nationalarchives.gov.uk/education/resources/significant-events/act-of-union-1801/). These pages describe the designs; the game’s local SVG is the final visual cross-check. Mexico also cites Italy because its hook compares those two flags.

Symbol names such as the Ashoka Chakra, taegeuk, and Sun of May identify depicted designs; hooks do not claim speculative meanings. Nepal’s only-non-rectangular statement and two-pennant explanation are sourced from its FOTW page. Recheck references and current designs before editing or expanding the pilot. Source links are editorial metadata and are not rendered in gameplay.

## UI boundary and M18E-B

This milestone adds no UI and no pre-answer hints. `FlagsScreen` and the question engine do not import or expose the hook content. In M18E-B, look up `feedback.answer.id` only after an answer is submitted. Omit the content area when lookup returns `undefined`. Classic and Reverse can keep the hook optional; Practice can give an incorrect answer’s hook more prominence while leaving the correct-answer hook available without requiring it. Keep source citations out of the player UI unless separately designed.

## Verification and remaining work

Focused tests verify the 20 canonical IDs, uniqueness, valid categories, sentence length, plain text, source URL structure, related-country IDs, lookup and absence behavior, and the boundary that no hook is shown before submission. `npm test` passes all 184 tests; `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` pass. Build retains the existing 566.76 kB main-chunk advisory and eight-month-old Browserslist data notice. Existing question generation and feedback tests remain unchanged. M18E-A does not provide full 195-country coverage; future entries need the same editorial review and source references. No browser QA is applicable because no interface was added.
