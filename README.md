# townsquare

A full-stack TypeScript community app with three clients on one shared core: a **React** web app, a **Next.js** server-rendered site, and an **Expo / React Native** mobile app. Users sign in with a phone number and a one-time code, browse an infinite-scrolling feed, and receive real-time notifications, with push notifications and deep links on mobile.

The point of the repository is the architecture: every piece of business logic that does not depend on a UI framework (API client, auth/session logic, the feed query, the notification store and WebSocket client, monitoring adapters) lives in one package, `@hub/core`. Each app supplies only what is platform-specific: where tokens are stored, how a socket is opened, and how a screen is drawn.

## Highlights

**Authentication**
- Phone number + one-time code. Delivery (SMS / WhatsApp / call) sits behind a sender adapter; the demo backend mocks it.
- Short-lived access token kept in memory; single-use, rotating refresh token (an httpOnly cookie on the web, secure storage on mobile).
- One HTTP client per app with a **single-flight refresh**: ten requests that hit a 401 together trigger exactly one refresh, then each retries once.
- Protected routes, and a session that survives a restart without logging out on a flaky network (only a real 401 ends the session).

**Feed**
- Cursor pagination with TanStack Query infinite queries, debounced search, tabs and a grid/list toggle.
- Web: memoised cards, lazy images with a fixed aspect ratio (no layout shift), skeleton loading, error boundaries around independent widgets, a windowed-list demo.
- Mobile: `FlatList` tuned for windowing, guards against duplicate `onEndReached` calls, pull-to-refresh, `expo-image` with width buckets.

**Real-time notifications**
- WebSocket client with exponential backoff and jitter, automatic token refresh when the server closes with an auth code, and a catch-up fetch after every reconnect.
- De-duplication, optimistic mark-as-read with rollback when the server refuses, and a saved copy (localStorage / AsyncStorage) shown instantly while the list refreshes.
- Mobile: foreground banner, tab and app-icon badges, push notifications (permission asked in context, device-token registration, tap-to-navigate against an allow-list), and `hub://` deep links.

**Rendering and SEO (Next.js app)**
- Server-rendered public pages with per-page metadata, canonical links, sitemap, robots and Open Graph data.
- Streaming loading states and an on-demand revalidation endpoint protected by a shared secret.

**Quality**
- Strict TypeScript across the workspace, Prettier, oxlint.
- Vitest for `core` and `web`; Jest and React Native Testing Library for `mobile`.
- Error and analytics adapters with automatic redaction of personal data; optional Sentry on the web; Core Web Vitals reporting.

## Repository layout

```
apps/
  api/      Express REST + WebSocket demo backend (in-memory data)
  web/      React 19 + Vite client (React Router, TanStack Query, Tailwind + CSS Modules)
  next/     Next.js server-rendered site (SEO, streaming, revalidation)
  mobile/   Expo SDK 58 / React Native 0.88 app (Expo Router, Hermes, New Architecture)
packages/
  core/     Framework-free shared logic (@hub/core): http client, auth, feed, notifications,
            realtime, store, monitoring
```

Inside each client, code is organised by feature (`features/auth`, `features/feed`, `features/notifications`, ...) with a public `index.ts` per feature. Components only draw UI, hooks hold state and orchestration, and network calls live in `@hub/core`.

## Getting started

Requirements: Node (developed on Node 24) and npm. For native mobile builds: Xcode (iOS) and/or Android Studio.

```bash
npm install
cp apps/api/.env.example apps/api/.env      # demo settings; never commit a real .env

npm run dev:api      # API on http://localhost:4000
npm run dev:web      # web app on http://localhost:5173
npm run dev:next     # Next.js site on http://localhost:3000
npm run dev:mobile   # Expo dev server for the mobile app
```

**Demo login:** enter any 10-digit phone number (for example `9876543210`) and the fixed code `123456` (set by `OTP_CODE` in `apps/api/.env`). Access tokens last only 30 seconds on purpose, so the silent refresh flow is easy to watch.

**Mobile:**
- The iOS simulator reaches the API at `localhost`, and the Android emulator uses `10.0.2.2`. For a real phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN address (see `apps/mobile/.env.example`).
- Expo Go works for most screens. Push notifications and the real `hub://` URL scheme need a development build: `npm run ios -w @hub/mobile` (or `android`). Build profiles for EAS are in `apps/mobile/eas.json`.

**Checks:**

```bash
npm run typecheck    # all workspaces
npm test             # all test suites
npm run format:check
```

## About the demo backend

`apps/api` is intentionally small. Data (users, refresh tokens, notifications, device tokens) is held in memory, so restarting it signs everyone out. The one-time-code sender and the push sender are mocks behind adapter interfaces: swapping in a real SMS provider or Expo/APNs/FCM means implementing those two interfaces. The `/dev/*` routes (trigger a notification, inspect mock pushes, drop sockets) are only mounted outside production.

## Stack

TypeScript, React 19, Vite, React Router, TanStack Query and Virtual, React Hook Form + Zod, Tailwind CSS, Next.js, Expo, React Native, Expo Router, Express, `ws`, Vitest, Jest, React Native Testing Library.
