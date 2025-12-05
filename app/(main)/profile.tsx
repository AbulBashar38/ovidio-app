import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  CreditCard,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { api } from "@/state-management/apiConfig";
import { clearAuth } from "@/state-management/features/auth/authSlice";
import { clearUser, selectUser } from "@/state-management/features/auth/userSlice";
import { persistor } from "@/state-management/store";

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
    { icon: User, label: "Account Details" },
    { icon: Bell, label: "Notifications" },
    { icon: CreditCard, label: "Subscription" },
    { icon: Shield, label: "Privacy & Security" },
    { icon: Settings, label: "App Settings" },
  ];

  return (
    <Box className="flex-1 bg-background-0">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <VStack space="4xl" className="p-6">
            {/* Header */}
            <Heading size="2xl" className="text-typography-900 font-heading">
              Profile
            </Heading>

            {/* User Info */}
            <HStack space="md" className="items-center">
              <Avatar size="xl" className="bg-primary-500">
                <AvatarFallbackText className="text-white">
                  {user.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}` : "JD"}
                </AvatarFallbackText>
              </Avatar>
              <VStack>
                <Heading size="md" className="text-typography-900">
                  {user.firstName} {user.lastName}
                </Heading>
                <Text className="text-typography-500">
                  {user.email}
                </Text>
                <Box className="bg-primary-500/10 self-start px-2 py-1 rounded-md mt-1">
                  <Text className="text-primary-500 text-xs font-bold">
                    {user.role}
                  </Text>
                </Box>
              </VStack>
            </HStack>

            {/* Menu */}
            <VStack space="lg">
              <Text className="text-typography-500 font-bold text-sm uppercase tracking-wider mb-2">
                General
              </Text>
              <VStack className="bg-background-50 rounded-2xl overflow-hidden border border-outline-100">
                {menuItems.map((item, index) => (
                  <React.Fragment key={item.label}>
                    {index > 0 && <Divider className="bg-outline-100" />}
                    <TouchableOpacity className="p-4 flex-row items-center active:bg-background-100">
                      <Box className="w-10 h-10 bg-background-200 rounded-full items-center justify-center mr-4">
                        <item.icon size={20} className="text-typography-900" />
                      </Box>
                      <Text className="flex-1 text-typography-900 font-medium text-base">
                        {item.label}
                      </Text>
                      <ChevronRight size={20} className="text-typography-400" />
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </VStack>
            </VStack>

            {/* Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-center p-4 rounded-2xl border border-error-500/20 bg-error-500/5 active:bg-error-500/10"
            >
              <LogOut size={20} className="text-error-500 mr-2" />
              <Text className="text-error-500 font-bold">Log Out</Text>
            </TouchableOpacity>

            <VStack className="items-center mt-6">
              <Image
                source={require("@/assets/logos/ovidio_logo.png")}
                className="w-10 h-10 mb-2 opacity-30"
                resizeMode="contain"
              />
              <Text className="text-typography-400 text-xs text-center">
                Version 1.0.0 • Build 2024
              </Text>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
