import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { AlertCircle, ArrowLeft } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, TouchableOpacity } from "react-native";
import { z } from "zod";

import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useForgotPasswordMutation } from "@/state-management/services/auth/authApi";

const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const toast = useToast();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordSchema) => {
        Keyboard.dismiss();
        try {
            await forgotPassword(data).unwrap();

            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                        <ToastTitle>Reset Link Sent</ToastTitle>
                        <ToastDescription>Check your email for instructions to reset your password.</ToastDescription>
                    </Toast>
                ),
            });

            // Optionally redirect to login after a delay or let user navigate manually
            setTimeout(() => {
                router.back();
            }, 2000);

        } catch (err: any) {
            console.error("Forgot Password failed", err);
            const errorMessage = err?.data?.message || "Failed to send reset link. Please try again.";
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>{errorMessage}</ToastDescription>
                    </Toast>
                ),
            });
        }
    };

    return (
        <Box className="flex-1 bg-background-0 p-6 justify-center">
            {/* Back Button */}
            <TouchableOpacity
                className="absolute top-12 left-6 z-10 p-2 rounded-full bg-background-50 active:bg-background-100"
                onPress={() => router.back()}
            >
                <ArrowLeft size={24} className="text-typography-900" />
            </TouchableOpacity>

            <Center className="flex-1">
                <VStack space="4xl" className="w-full max-w-[400px]">
                    {/* Header Section */}
                    <VStack space="xs" className="items-center">
                        <Box className="w-20 h-20 bg-primary-500/10 rounded-full items-center justify-center mb-4">
                            <AlertCircle size={40} className="text-primary-500" />
                        </Box>
                        <Heading
                            size="2xl"
                            className="text-typography-900 tracking-tight text-center"
                        >
                            Forgot Password?
                        </Heading>
                        <Text className="text-typography-500 text-center leading-relaxed px-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </Text>
                    </VStack>

                    {/* Form Section */}
                    <VStack space="xl">
                        {/* Email Field */}
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormControl isInvalid={!!errors.email} size="lg">
                                    <FormControlLabel className="mb-2">
                                        <FormControlLabelText className="text-typography-500 font-medium">
                                            Email Address
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        size="xl"
                                        variant="outline"
                                        className="border-outline-100 focus:border-primary-500 bg-background-50 h-14 rounded-xl"
                                    >
                                        <InputField
                                            placeholder="name@example.com"
                                            placeholderTextColor="#737373"
                                            className="text-typography-900 text-base font-body"
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    </Input>
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircle} />
                                        <FormControlErrorText className="text-error-500">
                                            {errors.email?.message}
                                        </FormControlErrorText>
                                    </FormControlError>
                                </FormControl>
                            )}
                        />

                        {/* Submit Button */}
                        <Button
                            size="xl"
                            className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-full h-14 mt-2 shadow-soft-1"
                            onPress={handleSubmit(onSubmit)}
                            isDisabled={isLoading}
                        >
                            {isLoading ? (
                                <ButtonSpinner color="#FFFFFF" />
                            ) : (
                                <ButtonText className="font-bold text-lg">Send Reset Link</ButtonText>
                            )}
                        </Button>
                    </VStack>

                    {/* Footer Section */}
                    <Center>
                        <Link
                            href="/(auth)/login"
                            className="text-typography-500 font-medium"
                        >
                            Back to Login
                        </Link>
                    </Center>
                </VStack>
            </Center>
        </Box>
    );
}
