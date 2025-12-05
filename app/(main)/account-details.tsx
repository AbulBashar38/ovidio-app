import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useGetUserQuery, useUpdateProfilePhotoMutation } from "@/state-management/services/auth/authApi";
import { uploadToS3 } from "@/state-management/services/s3Upload";
import * as DocumentPicker from "expo-document-picker";
import { Stack } from "expo-router";
import { Calendar, Camera, Mail, Shield, User as UserIcon } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountDetailsScreen() {
    const { data, isLoading } = useGetUserQuery();
    const [updateProfilePhoto, { isLoading: isUpdating }] = useUpdateProfilePhotoMutation();
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
                        <ToastDescription>Profile photo updated successfully.</ToastDescription>
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
                        <ToastDescription>{err.message || "Something went wrong."}</ToastDescription>
                    </Toast>
                ),
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <Box className="flex-1 bg-background-0 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </Box>
        );
    }

    if (!user) return null;

    return (
        <Box className="flex-1 bg-background-0">
            <Stack.Screen options={{ title: "Account Details", headerBackTitle: "Profile" }} />
            <SafeAreaView className="flex-1" edges={['bottom', 'top']}>
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <VStack space="4xl" className="items-center">

                        {/* Profile Photo Section */}
                        <Center className="relative mb-6">
                            <Box className="rounded-full border-4 border-background-50 shadow-md">
                                <Avatar size="2xl" className="bg-primary-500 w-32 h-32">
                                    <AvatarFallbackText className="text-4xl text-white">
                                        {user.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "JD"}
                                    </AvatarFallbackText>
                                    <AvatarImage
                                        source={{ uri: user.profilePhotoUrl }}
                                        alt="Profile Photo"
                                        className="w-full h-full rounded-full"
                                    />
                                </Avatar>
                            </Box>
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 bg-primary-500 p-3 rounded-full border-4 border-background-0 shadow-sm active:bg-primary-600"
                                onPress={handleUpdatePhoto}
                                disabled={isUploading || isUpdating}
                            >
                                {isUploading || isUpdating ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Camera size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        </Center>

                        <VStack space="md" className="w-full">
                            <Heading size="md" className="text-typography-900 font-bold mb-2">
                                Personal Information
                            </Heading>

                            {/* Name Field */}
                            <Box className="bg-background-50 p-4 rounded-xl border border-outline-100">
                                <Text className="text-typography-400 text-xs uppercase font-bold mb-1">Full Name</Text>
                                <HStack space="md" className="items-center">
                                    <UserIcon size={20} className="text-typography-400" />
                                    <Text className="text-typography-900 font-medium text-base">
                                        {user.firstName} {user.lastName}
                                    </Text>
                                </HStack>
                            </Box>

                            {/* Email Field */}
                            <Box className="bg-background-50 p-4 rounded-xl border border-outline-100">
                                <Text className="text-typography-400 text-xs uppercase font-bold mb-1">Email Address</Text>
                                <HStack space="md" className="items-center">
                                    <Mail size={20} className="text-typography-400" />
                                    <Text className="text-typography-900 font-medium text-base">
                                        {user.email}
                                    </Text>
                                </HStack>
                            </Box>

                            {/* Role Field */}
                            <Box className="bg-background-50 p-4 rounded-xl border border-outline-100">
                                <Text className="text-typography-400 text-xs uppercase font-bold mb-1">Account Type</Text>
                                <HStack space="md" className="items-center">
                                    <Shield size={20} className="text-typography-400" />
                                    <Text className="text-typography-900 font-medium text-base capitalize">
                                        {user.role}
                                    </Text>
                                </HStack>
                            </Box>

                            {/* Joined Date */}
                            <Box className="bg-background-50 p-4 rounded-xl border border-outline-100">
                                <Text className="text-typography-400 text-xs uppercase font-bold mb-1">Member Since</Text>
                                <HStack space="md" className="items-center">
                                    <Calendar size={20} className="text-typography-400" />
                                    <Text className="text-typography-900 font-medium text-base">
                                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </HStack>
                            </Box>

                        </VStack>

                    </VStack>
                </ScrollView>
            </SafeAreaView>
        </Box>
    );
}
