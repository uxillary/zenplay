# ZenPlay — Android build (planned)

ZenPlay is web-first. The current deliverable is a PWA. Android packaging with Capacitor is planned for a later phase.

## Planned workflow

1. Build the web app.
2. Initialize Capacitor.
3. Add Android platform.
4. Open Android Studio and produce signed builds.

## Commands (for later)

```bash
npm run build
npx cap init zenplay com.zenplay.app
npx cap add android
npx cap copy
npx cap open android
```

> Note: These steps are intentionally not applied yet in this repository.
