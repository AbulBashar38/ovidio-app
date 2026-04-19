# Copilot Instructions for Ovidio App

## Primary Objective

Improve UI/visual design only.

Do not change business logic, app behavior, APIs, or user flows unless explicitly requested.

## Non-Negotiable Scope Rules

- Allowed:
  - Update layout, spacing, typography, color usage, shadows, borders, and visual hierarchy.
  - Improve component composition for readability and visual consistency.
  - Add subtle animations/transitions for polish.
  - Improve responsive behavior for small/large mobile screens.
- Not allowed:
  - Do not change API contracts, endpoint paths, request/response handling, or auth logic.
  - Do not change Redux state shape, RTK Query behavior, or persistence behavior.
  - Do not change navigation architecture or route names.
  - Do not alter feature behavior (upload flow, purchase flow, player controls, etc.).
  - Do not add/remove product features.
  - Do not introduce new dependencies unless explicitly requested.

## Current Stack (Use What Exists)

- React Native + Expo Router + TypeScript.
- Gluestack UI primitives + NativeWind class-based styling.
- Icons via `lucide-react-native`.
- Motion via `moti`/`react-native-reanimated`.

## Visual Direction

- Style: premium, immersive audiobook app.
- Theme: dark-first with clear depth layers.
- Priority: readability and hierarchy before decoration.
- Motion: meaningful and restrained, never distracting.

## UI Rules

- Keep screens clean and spacious:
  - Prefer consistent padding (`p-4`, `p-6`) and section gaps.
  - Use stable card radii and border treatments across screens.
- Improve hierarchy:
  - Strong title contrast, softer secondary text.
  - Clear section headers and grouped content.
- Keep CTAs obvious:
  - Primary actions visually dominant.
  - Destructive/secondary actions clearly differentiated.
- Keep interactions tactile:
  - Press states for all tappable elements.
  - Subtle enter/fade/slide transitions where useful.

## Implementation Constraints

- Prefer editing existing screen/component files instead of creating parallel versions.
- Reuse current UI primitives (`Box`, `VStack`, `HStack`, `Text`, `Heading`, `Button`, etc.).
- Keep TypeScript strict and avoid `any`.
- Preserve existing prop contracts for components.
- Avoid large refactors when small visual edits can achieve the goal.

## Responsiveness and Accessibility

- Validate layouts on common phone sizes (small Android and large iPhone).
- Preserve touch target size and spacing.
- Maintain sufficient text/background contrast.
- Avoid animation patterns that reduce readability.

## Done Criteria for UI Tasks

- No functional regressions.
- No changed API/state/navigation behavior.
- Visual output is clearly improved and more consistent.
- App remains buildable with existing tooling.
