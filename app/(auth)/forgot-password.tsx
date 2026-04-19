import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { AlertCircle, ArrowLeft } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

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
            <ToastDescription>
              Check your email for instructions to reset your password.
            </ToastDescription>
          </Toast>
        ),
      });

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      console.error("Forgot Password failed", err);
      const errorMessage =
        err?.data?.message || "Failed to send reset link. Please try again.";
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
    <Box className="flex-1 bg-background-950">
      <LinearGradient
        colors={["#0f1115", "#181719", "#0b0c0f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <MotiView
        from={{ opacity: 0.2, translateX: 0 }}
        animate={{ opacity: 0.3, translateX: -14 }}
        transition={{ loop: true, type: "timing", duration: 3900 }}
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 110,
          top: 40,
          right: -70,
          backgroundColor: "rgba(59,130,246,0.2)",
        }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 28,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Center>
              <VStack space="3xl" className="w-full max-w-[420px]">
                <Box className="items-start">
                  <TouchableOpacity
                    className="p-2 rounded-full bg-background-900 border border-outline-800 active:opacity-80"
                    onPress={() => router.back()}
                  >
                    <ArrowLeft size={20} color="#e4e4e7" />
                  </TouchableOpacity>
                </Box>

                <Box className="rounded-3xl border border-outline-300 bg-background-50 px-5 py-6">
                  <VStack space="xl">
                    <VStack space="sm" className="items-center">
                      <Box className="w-16 h-16 bg-primary-500/15 rounded-full items-center justify-center">
                        <AlertCircle size={28} color="#60a5fa" />
                      </Box>
                      <Heading
                        size="2xl"
                        className="text-typography-900 tracking-tight text-center"
                      >
                        Forgot password?
                      </Heading>
                      <Text className="text-typography-600 text-center leading-relaxed">
                        Enter your email and we&apos;ll send a reset link.
                      </Text>
                    </VStack>

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

                    <Button
                      size="xl"
                      className="bg-primary-500 rounded-2xl h-14"
                      onPress={handleSubmit(onSubmit)}
                      isDisabled={isLoading}
                    >
                      {isLoading ? (
                        <ButtonSpinner color="#FFFFFF" />
                      ) : (
                        <ButtonText className="font-bold text-base">
                          Send Reset Link
                        </ButtonText>
                      )}
                    </Button>

                    <Center>
                      <Link
                        href="/(auth)/login"
                        className="text-typography-600 font-medium"
                      >
                        Back to Login
                      </Link>
                    </Center>
                  </VStack>
                </Box>
              </VStack>
            </Center>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
}
