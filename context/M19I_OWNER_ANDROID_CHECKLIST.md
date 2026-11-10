# M19I — Owner Android acceptance

Status: **PENDING — physical device acceptance has not been performed.**

Record phone model, Android version, browser/version, date, CSS viewport width, browser or installed PWA, and the build tested. Repeat the key checks in the installed PWA if used. Use the normal size first, then your preferred accessibility settings.

- [ ] Start Solitaire. All seven columns, stock, waste and foundations are visible without sideways page scrolling. Rank and suit are comfortable to recognise at normal viewing distance.
- [ ] Tap a face-up card, then a legal destination. Repeat with waste → tableau and an Ace → foundation. Tap the selected card again to cancel. Try several moves quickly; each action happens once.
- [ ] Press and immediately drag a card with no hold delay. Release on a valid pile, then try an invalid pile and release near a screen edge. Check that the preview follows the finger, the board stays still and cancelled moves leave no ghost or selection artefact.
- [ ] Drag an entire face-up sequence. Build or resume a long tableau; scroll to reach its bottom card. Drag from different depths and use Undo. Check all cards arrive in order, with no page-width jump.
- [ ] Interrupt a drag by switching apps or rotating the phone. Return and make another tap and drag. Double-tap a suitable card to a foundation; an interrupted or cancelled gesture must not act as a tap.
- [ ] Try New Game and its “Keep playing” option, Hint, Undo and Show possible moves. Confirm invalid-move feedback is understandable and stays visible long enough. Quiet play should not produce repeated selection banners.
- [ ] Open Menu, Appearance and Game Options. The board must not move sideways or become inaccessible. Switch Simplified/Traditional, Classic/Large Print, all card backs and a table colour. Confirm the drag preview matches the chosen card style.
- [ ] Leave Solitaire and return; close and reopen the browser/PWA. Confirm cards, Undo history, draw mode and appearance/options survive. Do not clear browser data for this check.
- [ ] Try High Contrast and Reduced Motion. At 200% and 400% browser zoom, reach every control and pile using ordinary scrolling. Confirm focus remains visible with a keyboard and test spoken card names, selection and move feedback with TalkBack if used.
- [ ] Near a win, check Auto-finish cards when offered; otherwise move the last cards manually. Confirm the win dialog and New Game work.

Record each failure with the action sequence, expected/actual result and a screenshot or recording where possible. Mark **PASS** only after testing. Use **CONDITIONAL** for unresolved comfort/readability or unavailable checks; use **FAIL** for broken moves, lost progress or inaccessible essential controls.
