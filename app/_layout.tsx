import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
  useFonts,
} from "@expo-google-fonts/lora";
import {
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import "react-native-get-random-values";
import "react-native-reanimated";
import "react-native-url-polyfill/auto";

import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import ProtectedRoute from "@/provider/ProtectedRoute";
import { persistor, store } from "@/state-management/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [loaded] = useFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleAnimatedSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ProtectedRoute>
          <GluestackUIProvider mode="dark">
            <ThemeProvider value={DarkTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
              </Stack>
              <StatusBar style="light" />
              {showAnimatedSplash && (
                <AnimatedSplashScreen onFinish={handleAnimatedSplashFinish} />
              )}
            </ThemeProvider>
          </GluestackUIProvider>
        </ProtectedRoute>
      </PersistGate>
    </Provider>
  );
}
