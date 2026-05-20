# E-Commerce Mobile App

## Project overview
This repository contains a mobile e-commerce client built with Expo and React Native. It uses Expo Router for file-based navigation and Clerk for authentication. Product, cart, and wishlist data are currently backed by local mock data to support UI development.

## Main features
- Browse products with search and pagination
- Product details and image galleries
- Cart management and checkout flow
- Favorites (wishlist)
- Orders and order details
- Admin screens for products and orders (UI only)
- Email and password authentication with email verification and MFA support

## Tech stack
**Frontend**
- Expo SDK 54, React Native, TypeScript
- Expo Router for navigation
- NativeWind (Tailwind CSS) for styling
- React Context for cart and wishlist state
- Clerk for authentication
- React Native Toast Message for feedback

**Backend / database**
- Not included in this repository
- UI currently uses local mock data in `assets/assets.ts`

**APIs / libraries**
- @clerk/expo
- expo-router
- expo-secure-store (via Clerk token cache)
- @react-navigation/* (Router integration)

## High-level architecture
- File-based routing under `app/` with route groups for tabs and auth
- Global providers in `app/_layout.tsx` (Clerk, cart, wishlist)
- Feature screens fetch from mock data; replace with real API calls
- Assets and fixtures stored under `assets/`

## Setup and installation
### Prerequisites
- Node.js 18+ recommended
- Expo CLI (optional, `npx expo` works without global install)

### Install
```bash
npm install
```

## Environment variables
Create a `.env` file at the project root (or update the existing one):

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

Notes:
- Expo only exposes variables prefixed with `EXPO_PUBLIC_` to the client.
- The app will throw at startup if the Clerk key is missing.

## Run in development
```bash
npm run start
```

Optional shortcuts:
```bash
npm run android
npm run ios
npm run web
```

## Run in production
This project does not include build automation config. Typical options:

- **Mobile (recommended):** Use Expo Application Services (EAS) to generate signed builds.
   ```bash
   npx eas build --platform android
   npx eas build --platform ios
   ```
- **Web:** Export a static build and host it from a static server.
   ```bash
   npx expo export -p web
   ```

If you adopt EAS, add `eas.json` and follow Expo docs for provisioning and store submission.

## Folder overview
- `app/`: Expo Router screens and layouts
- `components/`: Reusable UI components
- `Context/`: Cart and wishlist context providers
- `assets/`: Images and mock data fixtures
- `constants/`: Theme tokens and shared types

## API integration notes
- Screens currently load data from `assets/assets.ts` (dummy products, cart, wishlist).
- Replace mock fetch logic with real endpoints and move API calls to a dedicated client module.
- Consider adding a base URL via `EXPO_PUBLIC_API_BASE_URL` and centralizing request helpers.

## State management
- Cart and wishlist use React Context providers in `Context/`.
- Screen-level state uses React `useState` and `useEffect`.

## Authentication flow
- Clerk is initialized in `app/_layout.tsx` with a publishable key.
- Unauthenticated users are redirected to `/(auth)/sign-in`.
- Sign-in supports password auth and email-based MFA.
- Sign-up uses email verification and then finalizes the session.

## Build and deployment notes
- Expo Router uses `app/` for routing; keep route names stable for deep links.
- `app.json` enables the new architecture and typed routes.
- Native modules rely on Expo-managed configuration.

## Troubleshooting
- **Missing Clerk key:** Ensure `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env`.
- **Metro cache issues:** Run `npx expo start -c` to clear cache.
- **Images not loading:** Verify remote image URLs or replace with local assets.
