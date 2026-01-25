import { Tabs } from "expo-router";
import { Home, UploadCloud, User } from "lucide-react-native";
import { Platform } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#181719", // bg-background-950/dark
          borderTopColor: "#27272A", // border-outline-800
          height: Platform.OS === "ios" ? 88 : 60 + insets.bottom,
          paddingBottom: Platform.OS === "ios" ? 28 : insets.bottom + 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#71717A", // text-typography-500
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          fontFamily: "Lora_400Regular",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, size }) => (
            <UploadCloud size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={24} color={color} />,
        }}
      />

      {/* Hidden Routes */}
      <Tabs.Screen
        name="player"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="account-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="buy-credits"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
