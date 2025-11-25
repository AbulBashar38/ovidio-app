# Copilot Instructions for Ovidio App

## Project Overview

**Ovidio** is a React Native (Expo) mobile app that converts PDF books into **AI-generated expressive audio**.

- **Current Phase**: Frontend UI build (Dark Theme default).
- **Goal**: Create a "Spotify for Audiobooks" experience with high-quality UI/UX.
- **Platform**: iOS & Android (Expo Go/Prebuild).

## Tech Stack & Libraries

- **Core**: React Native (Expo SDK 54), TypeScript, Expo Router.
- **UI System**: **Gluestack UI** + **NativeWind v4** (Tailwind CSS).
- **Typography**: **Lora** (Google Fonts) via `expo-font`.
- **State Management**: **Redux Toolkit** (UI state) + **RTK Query** (Data fetching).
- **Form Handling**: **React Hook Form** + **Zod** (Validation).
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

### **Design Philosophy: "Premium Audio Experience"**

- **Aesthetic**: Dark, immersive, and polished. Inspired by **Spotify** and **Apple Music**.
- **Color Palette**:
  - **Backgrounds**: Use deep blacks (`bg-background-950`) for main screens and slightly lighter grays (`bg-background-900` or `bg-background-800`) for cards/modals to create depth.
  - **Accents**: Use the primary color sparingly but effectively for call-to-actions (Play buttons, Upload).
- **Typography**: **Lora** is the voice of the app.
  - **Headings**: Bold/ExtraBold (`font-bold`), tight tracking (`tracking-tight`). Use for titles and impact.
  - **Body**: Medium/Regular, relaxed line height (`leading-relaxed`) for readability.
  - **Hierarchy**: Use text colors (`text-typography-0` vs `text-typography-400`) to clearly distinguish primary vs secondary information.
- **Shapes & Spacing**:
  - **Cards/Containers**: Use generous border radius (`rounded-2xl` or `rounded-3xl`).
  - **Spacing**: Avoid clutter. Use "airy" padding (`p-6`, `gap-6`) to let content breathe.
- **Interactions**:
  - **Feedback**: Every button or card press must provide visual feedback (e.g., `active:opacity-80` or a subtle scale animation using Moti).
  - **Transitions**: Screens should not just "appear"; they should fade or slide in smoothly.

### **Component Usage**

- **Gluestack UI**: Use `Box`, `VStack`, `HStack`, `Center` for layout. Use `Text` and `Heading` for typography.
- **Styling**: Use `className` (NativeWind) for 95% of styling.
  - Example: `<Box className="bg-background-900 p-4 rounded-2xl shadow-sm">`
- **Icons**: Use `lucide-react-native` (via Gluestack or separate install) or `@expo/vector-icons` with consistent stroke width.

## Critical Workflows

- **Authentication**: Implement auth flow using `expo-secure-store` and Expo Router middleware.
- **PDF Upload**: UI only for now (File picker -> Toast -> Mock progress).
- **Audio Player**: Visual dummy player with Moti animations (pulsing/waveform).

## Coding Conventions

- **Strict TypeScript**: No `any`. Define interfaces for all data models (Book, User, Audio).
- **Forms**: Use `react-hook-form` with `zod` resolvers. Wrap inputs in `FormControl` for validation feedback.
- **Imports**: Use absolute imports `@/`.
- **Comments**: Explain complex animation logic or mock data structures.
- **Path Aliases**: Use `@/` to import from the project root.
