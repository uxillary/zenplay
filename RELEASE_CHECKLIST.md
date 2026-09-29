# ZenPlay release checklist

Complete the manual and release items against the production build and deployment target. Do not mark a device check complete without testing that device.

## Automated

- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`

## Local production preview review

- [x] Home, Settings, and install instructions reviewed
- [ ] Review the default screen of all seven games, including Mahjong, in the production preview
- [x] Continue indicators returned after refreshing the preview for auto-saved game states

## Desktop manual

- [ ] Review Home and Settings on desktop
- [ ] Saved-game Continue and clear-save actions
- [ ] Rules, completion states, and destructive confirmations
- [ ] Keyboard navigation and visible focus
- [ ] High Contrast, Simple Mode, Reduced Motion, Extra Large UI, and browser zoom

## Mobile and tablet manual

- [ ] Narrow layouts around 320px and 375px, plus tablet layout
- [ ] Touch controls, page/game scrolling, and portrait/landscape use
- [ ] Larger text and game-piece settings

## Accessibility manual

- [ ] Physical keyboard
- [ ] NVDA
- [ ] VoiceOver
- [ ] TalkBack where available
- [ ] Browser zoom at 200–400%

## PWA and device

- [ ] Chromium installation and standalone launch
- [ ] iOS Add to Home Screen and standalone launch
- [ ] Offline launch, navigation, and play after the offline copy is ready
- [ ] Offline save, reload, and resume
- [ ] Update-ready message and user-controlled update

## Data safety

- [ ] Resumed game state and completed-game statistics persist after reload
- [ ] Accessibility settings persist after reload
- [ ] Updating preserves saves, statistics, and settings

## Release

- [ ] Production URL serves the intended build
- [ ] Icons, manifest, title, description, and theme metadata are correct
- [ ] No product-caused console errors or failed local asset requests
