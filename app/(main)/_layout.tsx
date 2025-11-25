import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="library" />
      <Stack.Screen name="player" />
    </Stack>
  );
}
