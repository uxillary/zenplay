# ZenPlay

ZenPlay is a calm, privacy-first collection of familiar games. Play Solitaire, Sudoku, Pairs, Word Search, Noughts & Crosses, and Fifteen Puzzle without accounts, adverts, or network services.

## Install and offline play

Use **Install ZenPlay** when your browser offers it, or follow the browser-specific instructions in the app. On iPhone and iPad, open ZenPlay in Safari, tap **Share**, then **Add to Home Screen**.

After the app has loaded successfully and its offline copy is ready, the app and all six games work without a network connection. Saved games, statistics, and accessibility settings stay on the device in IndexedDB and local storage. A new version waits for you to choose **Update now**; it does not refresh an active game automatically.

## Development

Use Node.js **20.19+** or **22.12+** (Node.js 24 is also supported). Install dependencies, then run:

```bash
npm install
npm run dev
```

Build and preview the production app with `npm run build` and `npm run preview`. Service workers are enabled for the production build; use `localhost` or HTTPS to test installation and offline behaviour.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
