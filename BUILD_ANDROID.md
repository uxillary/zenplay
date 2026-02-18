
## `BUILD_ANDROID.md`

```md
# ZenPlay — Android build (later)

ZenPlay is built as a web-first PWA. When ready, we can package it as an installable Android app using Capacitor (web app inside a native Android shell).

This document is intentionally short and practical.

---

## Prereqs

- Android Studio installed
- Android SDK installed (via Android Studio)
- Java (Android Studio manages this)
- Node.js + npm

---

## Convert ZenPlay into an Android app (Capacitor)

From the repo root:

1) Build the web app (creates `dist/`)
```bash
npm run build
