# Copilot Instructions for Ovidio App

## Project Overview
**Ovidio** is a React Native (Expo) mobile app that converts PDF books into **AI-generated expressive audio**.
- **Current Phase**: Frontend UI build (Dark Theme default).
- **Goal**: Create a "Spotify for Audiobooks" experience with high-quality UI/UX.
- **Platform**: iOS & Android (Expo Go/Prebuild).

## Tech Stack & Libraries
- **Core**: React Native (Expo SDK 54), TypeScript, Expo Router.
- **UI System**: **Gluestack UI** + **NativeWind v4** (Tailwind CSS).
- **Typography**: **Plus Jakarta Sans** (Google Fonts) via `expo-font`.
- **State Management**: **Redux Toolkit** (UI state) + **RTK Query** (Data fetching).
- **Storage**: `expo-secure-store` (for auth tokens).
- **Audio**: `expo-av`.

## Animation Guidelines
**Primary Library**: **Moti** (powered by Reanimated).
- Use **Moti** for declarative UI animations (fade, slide, scale, pulsing buttons).
- Use **React Native Reanimated** for complex gestures, shared element transitions, and performance-critical animations (e.g., audio waveform visualization).
- **Do NOT use**: Lottie (unless requested), legacy Animated API.
- **Style**: Smooth, "musical" transitions (Spotify-like).

## Architecture & Routing
- **File-based Routing**: `expo-router`.
- **Group Layouts**:
  - `app/(auth)/`: Login, Register (Public).
  - `app/(main)/`: Home, Library, Player, Upload (Protected).
- **Navigation**: Tab-based main layout, Stack for auth/modals.

## Project Structure
```text
/app
  /(auth)/      # login.tsx, register.tsx
  /(main)/      # home.tsx, upload.tsx, library.tsx, player.tsx
  _layout.tsx   # Root provider setup
/components
  /ui/          # Gluestack UI primitives
  AudioPlayer.tsx
  PdfCard.tsx
  BookItem.tsx
  ProgressModal.tsx
  Input.tsx
  Button.tsx
/hooks
  useAuth.ts
  usePDFUpload.ts
/lib
  api.ts        # RTK Query endpoints
  mock-data.ts  # Mock data for UI development
/constants
  theme.ts
  fonts.ts
  colors.ts
```

## UI/UX & Styling Rules
- **Theme**: **Dark Mode** by default.
- **Design Philosophy**: Minimalist, elegant, rounded edges, generous spacing.
- **Components**: Always use **Gluestack UI** components (`Box`, `Text`, `VStack`, `HStack`) over RN primitives (`View`, `Text`).
- **Styling**: Use `className` (NativeWind) or Gluestack props. Avoid inline `style={{...}}`.
- **Mocking**: Do NOT implement real API calls yet. Use `lib/mock-data.ts` and local assets.

## Critical Workflows
- **Authentication**: Implement auth flow using `expo-secure-store` and Expo Router middleware.
- **PDF Upload**: UI only for now (File picker -> Toast -> Mock progress).
- **Audio Player**: Visual dummy player with Moti animations (pulsing/waveform).

## Coding Conventions
- **Strict TypeScript**: No `any`. Define interfaces for all data models (Book, User, Audio).
- **Imports**: Use absolute imports `@/`.
- **Comments**: Explain complex animation logic or mock data structures.
- **Path Aliases**: Use `@/` to import from the project root.

