import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { setAuth } from "@/state-management/features/auth/authSlice";
import { setUser } from "@/state-management/features/auth/userSlice";
import { useLoginMutation } from "@/state-management/services/auth/authApi";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    Keyboard.dismiss();
    console.log("Form Data Submitted:", data);

    try {
      const response = await login(data).unwrap();

      // Dispatch auth data to auth slice
      dispatch(setAuth({
        token: response.accessToken,
        refreshToken: response.refreshToken,
        emailVerified: response.emailVerified,
      }));

      // Dispatch user data to user slice
      dispatch(setUser(response.user));

      // Navigate to home on success
      router.replace("/(main)/home");
    } catch (err: any) {
      console.error("Login failed", err);

      // Show error toast
      const errorMessage = err?.data?.message || "Login failed. Please try again.";
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>{errorMessage}</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  return (
    <Box className="flex-1 bg-background-950">
      <LinearGradient
        colors={["#0f1115", "#181719", "#0b0c0f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <MotiView
        from={{ opacity: 0.2, scale: 0.95 }}
        animate={{ opacity: 0.35, scale: 1.05 }}
        transition={{ loop: true, type: "timing", duration: 5000 }}
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          top: -40,
          right: -80,
          backgroundColor: "rgba(59,130,246,0.22)",
        }}
      />
      <MotiView
        from={{ opacity: 0.18, translateX: -10 }}
        animate={{ opacity: 0.28, translateX: 18 }}
        transition={{ loop: true, type: "timing", duration: 4200 }}
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 110,
          bottom: 70,
          left: -60,
          backgroundColor: "rgba(99,102,241,0.20)",
        }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            showsVerticalScrollIndicator={false}
          >
            <Box className="px-6 py-8">
              <Center>
                <VStack space="3xl" className="w-full max-w-[420px]">
                  <VStack space="sm" className="items-center">
                    <Image
                      source={require("@/assets/logos/ovidio_logo.png")}
                      className="w-20 h-20"
                      resizeMode="contain"
                    />
                    <Heading
                      size="3xl"
                      className="text-typography-900 tracking-tight text-center"
                    >
                      Welcome back
                    </Heading>
                    <Text className="text-typography-600 text-center leading-relaxed max-w-[300px]">
                      Continue your audiobook journey with a clean and focused sign-in
                      experience.
                    </Text>
                  </VStack>

                  <Box className="rounded-3xl border border-outline-300 bg-background-50 px-5 py-6">
                    <VStack space="xl">
                      <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl isInvalid={!!errors.email} size="lg">
                            <FormControlLabel className="mb-2">
                              <FormControlLabelText className="text-typography-700 font-medium">
                                Email Address
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input
                              size="xl"
                              variant="outline"
                              className="border-outline-400 focus:border-primary-500 bg-background-100 h-14 rounded-2xl"
                            >
                              <InputField
                                placeholder="name@example.com"
                                placeholderTextColor="#737373"
                                className="text-typography-900 text-base"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                            </Input>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircle} />
                              <FormControlErrorText className="text-error-400">
                                {errors.email?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        )}
                      />

                      <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <FormControl isInvalid={!!errors.password} size="lg">
                            <FormControlLabel className="mb-2">
                              <FormControlLabelText className="text-typography-700 font-medium">
                                Password
                              </FormControlLabelText>
                            </FormControlLabel>
                            <Input
                              size="xl"
                              variant="outline"
                              className="border-outline-400 focus:border-primary-500 bg-background-100 h-14 rounded-2xl"
                            >
                              <InputField
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                placeholderTextColor="#737373"
                                className="text-typography-900 text-base"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                              />
                              <InputSlot
                                className="pr-4"
                                onPress={() => setShowPassword(!showPassword)}
                              >
                                <InputIcon
                                  as={showPassword ? Eye : EyeOff}
                                  className="text-typography-600"
                                />
                              </InputSlot>
                            </Input>
                            <FormControlError>
                              <FormControlErrorIcon as={AlertCircle} />
                              <FormControlErrorText className="text-error-400">
                                {errors.password?.message}
                              </FormControlErrorText>
                            </FormControlError>
                          </FormControl>
                        )}
                      />

                      <Box className="items-end">
                        <Link href="/(auth)/forgot-password">
                          <Text className="text-primary-400 font-medium text-sm">
                            Forgot Password?
                          </Text>
                        </Link>
                      </Box>

                      <Button
                        size="xl"
                        className="bg-primary-500 rounded-2xl h-14 mt-2"
                        onPress={handleSubmit(onSubmit)}
                        isDisabled={isLoading}
                      >
                        {isLoading ? (
                          <ButtonSpinner color="#FFFFFF" />
                        ) : (
                          <ButtonText className="font-bold text-base">Sign In</ButtonText>
                        )}
                      </Button>
                    </VStack>
                  </Box>

                  <Center>
                    <Text className="text-typography-600">
                      Don&apos;t have an account?{" "}
                      <Link href="/(auth)/register" className="text-primary-400 font-bold">
                        Sign Up
                      </Link>
                    </Text>
                  </Center>
                </VStack>
              </Center>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
}
