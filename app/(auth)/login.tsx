import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Keyboard } from "react-native";
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
import { useLoginMutation } from "@/state-management/features/auth/authApi";
import { setAuth } from "@/state-management/features/auth/authSlice";
import { setUser } from "@/state-management/features/auth/userSlice";

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
    <Box className="flex-1 bg-background-0 p-6 justify-center">
      <Center className="flex-1">
        <VStack space="4xl" className="w-full max-w-[400px]">
          {/* Header Section */}
          <VStack space="xs" className="items-center">
            <Image
              source={require("@/assets/logos/ovidio_logo.png")}
              className="w-24 h-24 mb-2"
              resizeMode="contain"
            />
            <Heading
              size="3xl"
              className="text-typography-900 tracking-tight text-center"
            >
              Welcome Back
            </Heading>
            <Text className="text-typography-500 text-center leading-relaxed">
              Sign in to continue your audio journey with Ovidio
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

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors.password} size="lg">
                  <FormControlLabel className="mb-2">
                    <FormControlLabelText className="text-typography-500 font-medium">
                      Password
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input
                    size="xl"
                    variant="outline"
                    className="border-outline-100 focus:border-primary-500 bg-background-50 h-14 rounded-xl"
                  >
                    <InputField
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      placeholderTextColor="#737373"
                      className="text-typography-900 text-base font-body"
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
                        className="text-typography-400"
                      />
                    </InputSlot>
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircle} />
                    <FormControlErrorText className="text-error-500">
                      {errors.password?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />

            {/* Submit Button */}
            <Button
              size="xl"
              className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-full h-14 mt-6 shadow-soft-1"
              onPress={handleSubmit(onSubmit)}
              isDisabled={isLoading}
            >
              {isLoading ? (
                <ButtonSpinner color="#FFFFFF" />
              ) : (
                <ButtonText className="font-bold text-lg">Sign In</ButtonText>
              )}
            </Button>
          </VStack>

          {/* Footer Section */}
          <Center>
            <Text className="text-typography-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/(auth)/register"
                className="text-primary-500 font-bold"
              >
                Sign Up
              </Link>
            </Text>
          </Center>
        </VStack>
      </Center>
    </Box>
  );
}
