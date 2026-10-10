# M18G Flags performance, loading and offline audit

**Audit date:** 10 October 2026  
**Scope:** production loading and offline asset delivery. Country data, artwork, hooks, gameplay, and scoring were preserved.

## Existing architecture

Before M18G, `src/app/App.tsx` statically imported all eight game screens. The app rendered only the selected screen, but the bundler put every screen and its dependencies in the initial application entry chunk. `gameRegistry.ts` contains shared game metadata and continue-save lookups; it does not render screens. The Flags metadata module is small, but `FlagsScreen` imports the country model, question engine, feedback UI, and all 194 memory hooks, so those modules were also part of the initial entry.

Flag artwork is served as 195 local `/flags/{id}.svg` files. Classic and Practice display one current flag; Reverse displays four choices. There are no remote flag requests. Vite Workbox precaches `*.js`, `*.svg`, CSS and other shell assets. Navigation fallback serves `index.html`; the app registers the worker immediately, prompts for updates, and leaves `skipWaiting` and `clientsClaim` disabled so updates remain user-controlled.

## Baseline build (before changes)

Ran `npm run build` before editing. Byte counts are exact files emitted in `dist`; gzip figures use Node's gzip compressor per file and are estimates of content transfer before HTTP headers. The summed gzip totals are not one concatenated bundle.

| Measure | Baseline |
| --- | ---: |
| Initial application entry, raw / gzip | 599,073 B (599.07 kB) / 173,563 B (173.56 kB) |
| Total emitted JavaScript, raw / sum of gzip files | 634,584 B / 186,537 B |
| Flags-specific JavaScript | Included in the initial entry; no separate chunk |
| CSS, raw / gzip | 50,178 B / 11,192 B |
| Workbox precache | 212 entries; 3,205.53 KiB reported by build |
| Local flag SVGs | 195 files; 2,621,207 B raw; 967,476 B summed after individual gzip |

Largest emitted JavaScript files were the 599,073 B app entry, 15,037 B Workbox runtime, 14,713 B service worker, and 5,761 B Workbox Window helper. The Vite >500 kB advisory applied to the entry.

## Loading change and measured result

`App.tsx` now declares each of the eight game screens with `React.lazy` and renders the selected screen through `Suspense`. The existing `GameShell` title remains visible and receives the app's existing navigation focus while a screen is pending. The loading message has `role="status"` and `aria-live="polite"`. A small error boundary provides a `role="alert"` message and reload action if a screen chunk or screen render fails. The history model, URL, navigation handlers, continue-save behavior, and game IDs are unchanged.

Flags and its learning library now live in the 46,562 B (46.56 kB), 13,447 B gzip (13.45 kB) `FlagsScreen` chunk. The built initial entry does not contain the Syria hook text; the Flags chunk does. The other game screens also have separate chunks, fetched only when selected.

| Measure | Before | After | Difference |
| --- | ---: | ---: | ---: |
| Initial application entry, raw | 599,073 B | 473,403 B | −125,670 B (−21.0%) |
| Initial application entry, gzip | 173,563 B | 137,902 B | −35,661 B (−20.5%) |
| Total emitted JavaScript, raw | 634,584 B | 638,545 B | +3,961 B (+0.6%) |
| Sum of per-file JavaScript gzip sizes | 186,537 B | 194,090 B | +7,553 B (+4.0%) |
| Workbox precache | 212 entries; 3,205.53 KiB | 221 entries; 3,208.91 KiB | +9 entries; +3.38 KiB |

The initial entry is now below the Vite 500 kB warning threshold. The all-files JavaScript total rises slightly because separate files add compression overhead; code splitting reduces the initial download and defers game-screen parsing/evaluation. It does **not** reduce total app code, establish faster interaction timings, or prove lower memory use. No browser performance profile, network waterfall, low-end device timing, or memory measurement was available.

Other emitted screen chunks (raw / gzip): Solitaire 20.19 / 6.77 kB; Mahjong 17.15 / 5.96 kB; Sudoku 11.97 / 4.37 kB; Word Search 10.13 / 3.81 kB; Pairs 9.97 / 3.74 kB; Noughts & Crosses 7.93 / 2.76 kB; Fifteen 5.00 / 1.95 kB. CSS and the 195 SVG assets are unchanged from the baseline.

## Runtime and memory-hook findings

The 194 hooks are a static local array and a `Map` built once when the Flags chunk is first evaluated. Lookup is constant-time; hook lookup occurs only for answer feedback. This implementation is already small and does not justify splitting the library further or adding memoisation, a fetch, or a database.

Round creation shuffles a local country list and selects ten countries; each question selects three distractors. Practice requeues a missed question once at a time. Reverse renders four local image elements. Inspection found no clear algorithmic or rerender problem that warranted changing gameplay code. These observations are code review, not runtime profiling.

## SVG precaching and offline behavior

The production manifest contains all **195 flag SVGs** and all **11 application JavaScript assets**, including the entry, Flags chunk, and every other game-screen chunk. The 221-entry build precache is 3,208.91 KiB. That build figure describes emitted precache content, not measured network transfer or the browser's exact storage footprint. The flag SVGs alone total about 2.50 MiB raw and an estimated 944.8 KiB when each is gzipped separately.

Keeping every flag precached remains the right trade-off for the complete offline country pool: a runtime-only strategy could select a country whose image had never been downloaded. Content-hashed JavaScript chunk names and Workbox asset revisions support refresh when a new build is installed. Existing `navigateFallback`, prompt update flow, and old-cache cleanup remain in place. No service-worker configuration change was needed.

Build-artifact verification confirms that the app chunks and all flags are in the generated precache manifest. **Actual offline runtime was not tested**: no browser/device session was used to install, disconnect, reload, and play. Build coverage is not proof of runtime offline behavior.

## Verification and remaining work

- `npm test`: passed, 192 tests; 192 passed, 0 failed. Added a focused source-level guard for dynamic screen imports and accessible loading/error states; existing navigation and Flags model tests also pass.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; 149 modules transformed, 221 files precached (3,208.91 KiB). The >500 kB chunk advisory no longer appears.
- `git diff --check`: passed.
- Browserslist still reports `caniuse-lite` data is eight months old.
- No browser visual/interaction, physical-device, assistive-technology, runtime offline, network-waterfall, parse-time, or memory profiling was performed. The loading fallback and error state were checked in source/tests, not manually rendered.

The implementation adds a pending state and makes game chunks independently loadable; the test suite does not simulate browser-level Back/Forward during a delayed or failed chunk request. Existing navigation state code was not changed. Manual browser checks should cover selecting Flags and another game, Home/Back/Forward, failed chunk recovery, and Classic/Practice/Reverse after offline installation.

**Recommended next milestone:** production browser and lower-powered mobile QA, including a real offline install/reload/play cycle and a network waterfall for Home → Flags. Profile the remaining 473 kB entry before considering further splitting.
