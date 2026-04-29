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
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
  useGetUserQuery,
  useUpdateProfilePhotoMutation,
} from "@/state-management/services/auth/authApi";
import { uploadToS3 } from "@/state-management/services/s3Upload";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import {
  Calendar,
  Camera,
  ChevronLeft,
  Mail,
  Shield,
  Sparkles,
  User as UserIcon,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountDetailsScreen() {
  const { data, isLoading } = useGetUserQuery();
  const [updateProfilePhoto, { isLoading: isUpdating }] =
    useUpdateProfilePhotoMutation();
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const user = data?.user;

  const handleUpdatePhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setIsUploading(true);

      // 1. Upload to S3
      const uploadResult = await uploadToS3({
        file: {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
        },
      });

      if (!uploadResult.success || !uploadResult.fileUrl) {
        throw new Error(uploadResult.error || "Failed to upload image.");
      }

      // 2. Update via API
      await updateProfilePhoto({ imageUrl: uploadResult.fileUrl }).unwrap();

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Success</ToastTitle>
            <ToastDescription>
              Profile photo updated successfully.
            </ToastDescription>
          </Toast>
        ),
      });
    } catch (err: any) {
      console.error(err);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>
              {err.message || "Something went wrong."}
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0">
        <LinearGradient
          colors={["#070A12", "#10131D", "#181719"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <Center className="flex-1">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Center>
      </Box>
    );
  }

  if (!user) return null;

  const infoItems = [
    {
      icon: UserIcon,
      label: "Full Name",
      value: `${user.firstName} ${user.lastName}`,
    },
    { icon: Mail, label: "Email Address", value: user.email },
    { icon: Shield, label: "Account Type", value: user.role, capitalize: true },
    {
      icon: Calendar,
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen options={{ headerShown: false }} />
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
            <HStack className="items-center" space="md">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                <Center className="w-11 h-11 rounded-2xl bg-background-0 border border-outline-100">
                  <ChevronLeft size={22} className="text-typography-900" />
                </Center>
              </TouchableOpacity>
              <VStack className="flex-1" space="xs">
                <Heading
                  size="2xl"
                  className="text-typography-900 font-heading"
                >
                  Account Details
                </Heading>
                <Text className="text-typography-500 text-base leading-relaxed">
                  Review your profile information and update your photo.
                </Text>
              </VStack>
            </HStack>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
            >
              <Box className="rounded-3xl border border-outline-100 bg-background-0 px-5 py-6">
                <VStack space="lg" className="items-center">
                  <Center className="relative">
                    <Box className="rounded-full border-4 border-background-50">
                      <Avatar size="2xl" className="bg-primary-500 w-32 h-32">
                        <AvatarFallbackText className="text-4xl text-white">
                          {user.firstName
                            ? `${user.firstName[0]}${user.lastName?.[0] || ""}`
                            : "JD"}
                        </AvatarFallbackText>
                        <AvatarImage
                          source={{ uri: user.profilePhotoUrl }}
                          alt="Profile Photo"
                          className="w-full h-full rounded-full"
                        />
                      </Avatar>
                    </Box>
                    <TouchableOpacity
                      className="absolute bottom-0 right-0 bg-primary-500 p-3 rounded-full border-4 border-background-0 active:bg-primary-600"
                      onPress={handleUpdatePhoto}
                      disabled={isUploading || isUpdating}
                      activeOpacity={0.85}
                    >
                      {isUploading || isUpdating ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Camera size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  </Center>

                  <VStack space="xs" className="items-center">
                    <Heading
                      size="lg"
                      className="text-typography-900 text-center"
                    >
                      {user.firstName} {user.lastName}
                    </Heading>
                    <Text
                      className="text-typography-500 text-sm text-center"
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                    <Box className="bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20">
                      <Text className="text-primary-500 text-xs font-bold capitalize">
                        {user.role}
                      </Text>
                    </Box>
                  </VStack>
                </VStack>
              </Box>
            </MotiView>

            <VStack space="lg">
              <Text className="text-typography-500 font-semibold text-xs uppercase tracking-wider">
                Personal Information
              </Text>
              <VStack space="sm">
                {infoItems.map((item, index) => (
                  <Box
                    key={item.label}
                    className="rounded-2xl border border-outline-100 bg-background-0 px-4 py-3"
                  >
                    <HStack className="items-center" space="md">
                      <Center
                        className={`w-11 h-11 rounded-2xl ${
                          index < 2 ? "bg-primary-500/10" : "bg-background-50"
                        }`}
                      >
                        <item.icon
                          size={20}
                          className={
                            index < 2
                              ? "text-primary-500"
                              : "text-typography-500"
                          }
                        />
                      </Center>
                      <VStack className="flex-1" space="xs">
                        <Text className="text-typography-400 text-xs font-semibold uppercase tracking-wider">
                          {item.label}
                        </Text>
                        <Text
                          className={`text-typography-900 font-semibold text-base ${
                            item.capitalize ? "capitalize" : ""
                          }`}
                          numberOfLines={2}
                        >
                          {item.value}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>

            <Box className="bg-info-500/5 border border-info-500/20 rounded-2xl p-4 mb-4">
              <HStack space="sm" className="items-start">
                <Sparkles size={18} className="text-info-500 mt-0.5" />
                <Text className="text-typography-500 text-sm flex-1 leading-relaxed">
                  Profile details are used to personalize your Ovidio library
                  and account experience.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
