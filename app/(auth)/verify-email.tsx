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
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, TextInput, View } from "react-native";
import { z } from "zod";

const verifyEmailSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmailScreen() {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const inputRefs = useRef<Array<TextInput | null>>([]);
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
            // Handle paste or auto-fill (simplified)
            const newOtp = [...otp];
            text.split("").slice(0, 6).forEach((char, i) => {
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

        // Move to next input if text is entered
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const onSubmit = (data: VerifyEmailSchema) => {
        Keyboard.dismiss();
        console.log("OTP Submitted:", data);
        dispatch(setEmailVerified(new Date()));
        // Simulate navigation or success
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

    return (
        <Box className="flex-1 bg-background-0 p-4">
            <Center className="flex-1">
                <VStack space="xl" className="w-full max-w-[400px]">
                    <VStack space="xs">
                        <Heading className="text-3xl font-bold">Verify your email</Heading>
                        <Text className="text-typography-500">
                            Please enter the 6-digit code sent to your email.
                        </Text>
                    </VStack>

                    <View className="flex-row justify-between gap-2">
                        {otp.map((digit, index) => (
                            <Input key={index} className="w-12 h-14 text-center">
                                <InputField
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    className="text-center text-xl font-bold"
                                    tabIndex={index}
                                />
                            </Input>
                        ))}
                    </View>
                    {errors.otp && (
                        <Text className="text-error-500 text-sm">{errors.otp.message}</Text>
                    )}

                    <Button onPress={handleSubmit(onSubmit)} className="w-full">
                        <ButtonText>Verify</ButtonText>
                    </Button>
                </VStack>
            </Center>
        </Box>
    );
}
