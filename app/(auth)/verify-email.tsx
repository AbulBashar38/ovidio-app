import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { setEmailVerified } from "@/state-management/features/auth/userSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronLeft, ShieldCheck } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const verifyEmailSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
type OtpInputRef = { focus: () => void } | null;

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<OtpInputRef[]>([]);
  const toast = useToast();
  const dispatch = useAppDispatch();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const newOtp = [...otp];
      text
        .split("")
        .slice(0, 6)
        .forEach((char, i) => {
          if (index + i < 6) newOtp[index + i] = char;
        });
      setOtp(newOtp);
      setValue("otp", newOtp.join(""));
      inputRefs.current[Math.min(index + text.length, 5)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setValue("otp", newOtp.join(""));

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = (data: VerifyEmailSchema) => {
    Keyboard.dismiss();
    dispatch(setEmailVerified(new Date().toISOString()));
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="solid">
          <ToastTitle>OTP Submitted: {data.otp}</ToastTitle>
        </Toast>
      ),
    });
    router.replace("/(main)/home");
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(auth)/register");
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
        from={{ opacity: 0.2, translateY: 0 }}
        animate={{ opacity: 0.3, translateY: -16 }}
        transition={{ loop: true, type: "timing", duration: 4200 }}
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: 125,
          top: 30,
          right: -80,
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
            <Box className="w-full max-w-[420px] self-center mb-4">
              <Button
                variant="outline"
                action="secondary"
                onPress={handleBackPress}
                className="self-start h-10 px-3 rounded-xl border-outline-400 bg-background-50"
              >
                <ChevronLeft size={18} color="#111827" />
                <ButtonText className="text-typography-900 font-semibold">
                  Back
                </ButtonText>
              </Button>
            </Box>

            <Center>
              <VStack space="3xl" className="w-full max-w-[420px]">
                <Box className="rounded-3xl border border-outline-300 bg-background-50 px-5 py-6">
                  <VStack space="xl">
                    <VStack space="sm" className="items-center">
                      <Box className="w-16 h-16 bg-primary-500/15 rounded-full items-center justify-center">
                        <ShieldCheck size={28} color="#60a5fa" />
                      </Box>
                      <Heading
                        size="2xl"
                        className="text-typography-900 tracking-tight text-center"
                      >
                        Verify your email
                      </Heading>
                      <Text className="text-typography-600 text-center leading-relaxed">
                        Enter the 6-digit code sent to your email address.
                      </Text>
                    </VStack>

                    <View className="flex-row justify-between gap-2">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          variant="outline"
                          className="w-12 h-14 border-outline-400 bg-background-100 rounded-xl"
                        >
                          <InputField
                            ref={(el) => {
                              inputRefs.current[index] =
                                el as unknown as OtpInputRef;
                            }}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            className="text-center text-typography-900 text-xl font-bold"
                          />
                        </Input>
                      ))}
                    </View>

                    {errors.otp && (
                      <Text className="text-error-400 text-sm text-center">
                        {errors.otp.message}
                      </Text>
                    )}

                    <Button
                      size="xl"
                      onPress={handleSubmit(onSubmit)}
                      className="w-full bg-primary-500 rounded-2xl h-14"
                    >
                      <ButtonText className="font-bold text-base">
                        Verify
                      </ButtonText>
                    </Button>
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
