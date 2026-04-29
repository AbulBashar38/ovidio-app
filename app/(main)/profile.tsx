import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  User,
} from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { api } from "@/state-management/apiConfig";
import { clearAuth } from "@/state-management/features/auth/authSlice";
import {
  clearUser,
  selectUser,
} from "@/state-management/features/auth/userSlice";
import { persistor } from "@/state-management/store";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleLogout = async () => {
    // 2. Clear Redux State
    dispatch(clearAuth());
    dispatch(clearUser());
    dispatch(api.util.resetApiState());

    // 3. Purge Persisted Storage
    await persistor.purge();

    // 4. Redirect to Login
    router.replace("/(auth)/login");
  };

  const menuItems = [
    { icon: User, label: "Account Details", route: "/(main)/account-details" },
    { icon: CreditCard, label: "Buy Credits", route: "/(main)/buy-credits" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Privacy & Security" },
    { icon: Settings, label: "App Settings" },
    { icon: LogOut, label: "Log Out", action: handleLogout, danger: true },
  ];

  return (
    <Box className="flex-1 bg-background-0">
      <LinearGradient
        colors={["#070A12", "#10131D", "#181719"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <MotiView
        from={{ opacity: 0.18, scale: 0.9 }}
        animate={{ opacity: 0.3, scale: 1.05 }}
        transition={{ type: "timing", duration: 6000, loop: true }}
        style={{
          position: "absolute",
          top: -90,
          right: -90,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: "rgba(59,130,246,0.22)",
        }}
      />
      <MotiView
        from={{ opacity: 0.12, translateY: 0 }}
        animate={{ opacity: 0.22, translateY: -12 }}
        transition={{ type: "timing", duration: 4800, loop: true }}
        style={{
          position: "absolute",
          bottom: 90,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: "rgba(99,102,241,0.18)",
        }}
      />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="3xl" className="px-6 pt-5">
            <VStack space="xs">
              <Heading size="2xl" className="text-typography-900 font-heading">
                Profile
              </Heading>
              <Text className="text-typography-500 text-base leading-relaxed">
                Manage your account, credits, and app preferences.
              </Text>
            </VStack>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
            >
              <Box className="rounded-3xl border border-outline-100 bg-background-0 p-4">
                <HStack space="md" className="items-center">
                  <Box className="rounded-full border-4 border-background-50">
                    <Avatar size="xl" className="bg-primary-500">
                      <AvatarFallbackText className="text-white">
                        {user.firstName
                          ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`
                          : "JD"}
                      </AvatarFallbackText>
                      <AvatarImage
                        source={{ uri: user.profilePhotoUrl }}
                        alt="Profile Photo"
                        className="w-full h-full rounded-full"
                      />
                    </Avatar>
                  </Box>

                  <VStack className="flex-1" space="xs">
                    <Heading
                      size="md"
                      className="text-typography-900"
                      numberOfLines={1}
                    >
                      {user.firstName} {user.lastName}
                    </Heading>
                    <Text className="text-typography-500 text-sm" numberOfLines={1}>
                      {user.email}
                    </Text>
                    <Box className="bg-primary-500/10 self-start px-3 py-1 rounded-full border border-primary-500/20">
                      <Text className="text-primary-500 text-xs font-bold capitalize">
                        {user.role}
                      </Text>
                    </Box>
                  </VStack>
                </HStack>
              </Box>
            </MotiView>

            <TouchableOpacity
              onPress={() => router.push("/(main)/buy-credits")}
              activeOpacity={0.9}
            >
              <Box className="rounded-3xl overflow-hidden">
                <LinearGradient
                  colors={["#3B82F6", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 18 }}
                >
                  <HStack className="items-center justify-between">
                    <VStack space="xs">
                      <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                        Your Credits
                      </Text>
                      <HStack space="xs" className="items-baseline">
                        <Text className="text-white text-4xl font-bold">
                          {user.creditsRemaining}
                        </Text>
                        <Text className="text-white/70 text-base">
                          remaining
                        </Text>
                      </HStack>
                    </VStack>
                    <Box className="bg-white/20 rounded-2xl px-4 py-2 border border-white/20">
                      <HStack space="xs" className="items-center">
                        <Sparkles size={16} color="white" />
                        <Text className="text-white font-bold text-sm">
                          Buy More
                        </Text>
                      </HStack>
                    </Box>
                  </HStack>
                </LinearGradient>
              </Box>
            </TouchableOpacity>

            <VStack space="lg">
              <Text className="text-typography-500 font-semibold text-xs uppercase tracking-wider">
                General
              </Text>
              <VStack space="sm">
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (item.action) {
                        item.action();
                        return;
                      }
                      if (item.route) {
                        router.push(item.route as any);
                      }
                    }}
                  >
                    <Box
                      className={`rounded-2xl border px-4 py-3 ${
                        item.danger
                          ? "bg-error-500/5 border-error-500/20"
                          : "bg-background-0 border-outline-100"
                      }`}
                    >
                      <HStack className="items-center" space="md">
                        <Center
                          className={`w-11 h-11 rounded-2xl ${
                            item.danger
                              ? "bg-error-500/10"
                              : index < 2
                                ? "bg-primary-500/10"
                                : "bg-background-50"
                          }`}
                        >
                          <item.icon
                            size={20}
                            className={
                              item.danger
                                ? "text-error-500"
                                : index < 2
                                  ? "text-primary-500"
                                  : "text-typography-500"
                            }
                          />
                        </Center>
                        <Text
                          className={`flex-1 font-semibold text-base ${
                            item.danger
                              ? "text-error-500"
                              : "text-typography-900"
                          }`}
                        >
                          {item.label}
                        </Text>
                        {!item.danger && (
                          <ChevronRight
                            size={20}
                            className="text-typography-400"
                          />
                        )}
                      </HStack>
                    </Box>
                  </TouchableOpacity>
                ))}
              </VStack>
            </VStack>

            <VStack className="items-center mb-4" space="xs">
              <Box className="w-10 h-10 rounded-2xl bg-background-0 border border-outline-100 items-center justify-center">
                <Sparkles size={18} className="text-primary-500" />
              </Box>
              <Text className="text-typography-400 text-xs text-center">
                Version 1.0.0 • Build 2026
              </Text>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
