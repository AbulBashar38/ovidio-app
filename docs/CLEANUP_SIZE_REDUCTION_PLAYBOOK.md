# Ovidio App Cleanup and Size Reduction Playbook

Last updated: 2026-04-19

## 1) Current Baseline (from this repo)

- Tracked app/source files (excluding `node_modules`, native builds): about `112`.
- Largest local folders:
  - `components/` about `320 KB` (mostly `components/ui/` wrappers).
  - `assets/` about `860 KB`.
  - `dist/` about `62 MB` (generated export artifacts, not tracked in git).
  - `node_modules/` about `591 MB` (development footprint, not shipped directly).
- Expo Android Hermes bundle artifact in `dist`:
  - `entry-*.hbc` about `8.5 MB`.
  - sourcemap `entry-*.hbc.map` about `22 MB`.

## 2) Main Findings

### 2.1 High-impact bundle contributors

From Android bundle sourcemap module counts:

- `lucide-react-native`: `1653` modules (largest by far).
- `react-native`: `432` modules.
- `react-native-reanimated`: `270` modules.
- `zod`: `132` modules.
- `react-native-svg`: `111` modules.
- `expo-router`: `106` modules.
- `@gluestack-ui/core`: `71` modules.

This strongly suggests icon strategy (`lucide-react-native`) is the biggest JS-side optimization opportunity.

### 2.2 Font asset bloat

Bundled assets include many `@expo-google-fonts/lora` files, including italic variants not explicitly used in app code.

Largest bundled assets include:

- `assets/logos/ovidio_logo.png` about `283 KB`.
- Multiple Lora font files around `130-137 KB` each.

### 2.3 Dead code / template leftovers

Likely safe removals now:

- `components/ui/collapsible.tsx` (broken imports; not used).
- `constants/theme.ts` (template file, only used by unused hook/components).
- `hooks/use-theme-color.ts` (unused).
- `lib/utils.ts` (empty file).
- `state-management/services/fileUpload/s3Upload.ts` (empty duplicate).

If you are mobile-only (no web target), also remove web-only wrappers:

- `components/ui/box/index.web.tsx`
- `components/ui/center/index.web.tsx`
- `components/ui/heading/index.web.tsx`
- `components/ui/hstack/index.web.tsx`
- `components/ui/text/index.web.tsx`
- `components/ui/vstack/index.web.tsx`
- `components/ui/gluestack-ui-provider/index.web.tsx`
- `components/ui/gluestack-ui-provider/index.next15.tsx`
- `components/ui/gluestack-ui-provider/script.ts`
- `hooks/use-color-scheme.web.ts`
- `components/ui/icon-symbol.tsx`
- `components/ui/icon-symbol.ios.tsx`
- `components/ui/icon/index.tsx`
- `components/ui/icon/index.web.tsx`

### 2.4 Navigation/state inconsistencies

- `app/(main)/_layout.tsx` declares a hidden `library` route, but `app/(main)/library.tsx` does not exist.
- `state-management/features/count/counterSlice.ts` is template/demo state and not used by any feature.
- `counterSlice.ts` also has a wrong type import (`../../app/store`) that fails type-check.

### 2.5 Dependencies with low/no runtime evidence

Dependencies showing `0` modules in Android bundle map (candidate removals after verification):

- `@expo/vector-icons`
- `expo-blur`
- `expo-dev-client`
- `expo-haptics`
- `expo-image`
- `expo-symbols`
- `expo-system-ui`
- `expo-updates`
- `expo-web-browser`
- `react-aria`
- `react-native-gesture-handler`
- `react-native-web`
- `react-stately`

Notes:

- Some may still be needed by plugins, dev workflow, or optional platforms.
- Remove in small batches and run build checks after each batch.

### 2.6 Current quality signal (important before cleanup)

`npm run lint` and `npx tsc --noEmit` both fail. Important blockers include:

- Unresolved imports in `components/ui/collapsible.tsx`.
- Type issues in `app/(auth)/verify-email.tsx`.
- Broken type import in `counterSlice.ts`.

Fixing/removing these as part of cleanup will reduce maintenance cost and prevent regressions.

## 3) Recommended Cleanup Phases

## Phase 1: Safe Structural Cleanup (low risk)

1. Remove dead/template files listed in section 2.3.
2. Remove `counter` slice from `state-management/store.ts` and delete `counterSlice.ts`.
3. Remove the `library` tab declaration (or create the screen if actually needed).
4. Re-run checks:
   - `npm run lint`
   - `npx tsc --noEmit`

Expected result: smaller code surface and cleaner static checks.

## Phase 2: High-Impact Size Wins

1. Replace `lucide-react-native` icons with a lighter strategy.
   - Prefer `@expo/vector-icons` or a curated local icon module.
   - Import only icons actually used by screens.
2. Replace `@expo-google-fonts/lora` package usage with local font files loaded via `expo-font`.
   - Keep only required weights/styles.
3. Remove AWS SDK from client upload flow:
   - Current flow uses `@aws-sdk/client-s3` + `buffer` directly in app.
   - Switch to backend-generated pre-signed URL + `fetch PUT`.
   - Then remove `@aws-sdk/client-s3`, `buffer`, and related polyfills if unused.
4. Reduce animation footprint where possible:
   - Keep `moti` only where product value is high.
   - Prefer simple `react-native-reanimated` animations for common cases.

Expected result: meaningful JS bundle reduction.

## Phase 3: Platform/Build Size Optimization

Android release optimizations are currently off by default:

- `android.enableMinifyInReleaseBuilds` currently false by default.
- `android.enableShrinkResourcesInReleaseBuilds` currently false by default.

Enable them in `android/gradle.properties` for release builds:

- `android.enableMinifyInReleaseBuilds=true`
- `android.enableShrinkResourcesInReleaseBuilds=true`

Also reduce release ABI targets (if acceptable):

- Current: `armeabi-v7a,arm64-v8a,x86,x86_64`
- Recommended for production AAB: `arm64-v8a` (or `armeabi-v7a,arm64-v8a` if you still need 32-bit).

Expected result: smaller install/download size on device.

## Phase 4: Optional Mobile-only Simplification

If you do not support web:

1. Remove web-only files listed in section 2.3.
2. Remove web config from `app.json` (`expo.web` block).
3. Remove web deps from `package.json` where safe:
   - `react-dom`
   - `react-native-web`
4. Rebuild and verify mobile flows.

Expected result: smaller dependency graph and simpler maintenance.

## 4) Prioritized Action List (Pragmatic Order)

1. Delete dead files + counter slice + fix route mismatch.
2. Fix lint/type errors to establish a stable baseline.
3. Replace `lucide-react-native` (largest immediate size win).
4. Migrate away from `@expo-google-fonts/lora` package to minimal local fonts.
5. Move S3 upload to pre-signed URL flow and remove AWS SDK client from mobile.
6. Enable Android minify/resource shrink and tighten ABI list.
7. Optional: remove web support surface if product is mobile-only.

## 5) Verification Checklist After Each Phase

Run all:

- `npm run lint`
- `npx tsc --noEmit`
- `npx expo start -c`
- `eas build --profile preview --platform android`

Then compare:

- Bundle size in `dist/_expo/static/js/android/entry-*.hbc`
- App install/download size from Play Console or local release build
- Functional smoke tests:
  - Login/register/verify flow
  - Upload PDF and submit
  - Home list rendering
  - Audio player
  - Buy credits / purchase flow

## 6) Risk Notes

- Do not remove `expo-updates` if you rely on OTA updates (`updates.url` is configured in `app.json`).
- Do not remove `expo-web-browser` if any auth/payment flow depends on browser sessions.
- Do not remove `react-native-gesture-handler` without testing navigation gestures and tabs.
- Remove dependencies in small batches, then build and test immediately.

