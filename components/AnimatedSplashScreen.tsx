import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useEffect } from "react";
import { Image } from "react-native";

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(onFinish, 2100);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <Box className="absolute inset-0 z-50 bg-background-0">
      <LinearGradient
        colors={["#05070D", "#10131D", "#181719"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <MotiView
        from={{ opacity: 0.14, scale: 0.88 }}
        animate={{ opacity: 0.32, scale: 1.08 }}
        transition={{ type: "timing", duration: 1900 }}
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: 160,
          top: -92,
          right: -112,
          backgroundColor: "rgba(59,130,246,0.24)",
        }}
      />
      <MotiView
        from={{ opacity: 0.1, translateY: 20, scale: 0.96 }}
        animate={{ opacity: 0.24, translateY: -10, scale: 1.04 }}
        transition={{ type: "timing", duration: 2100 }}
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          bottom: 70,
          left: -86,
          backgroundColor: "rgba(6,182,212,0.18)",
        }}
      />

      <Center className="flex-1 px-8">
        <VStack space="2xl" className="items-center w-full">
          <MotiView
            from={{ opacity: 0, scale: 0.86, translateY: 18 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 110 }}
          >
            <Box className="w-28 h-28 rounded-[32px] bg-background-50 border border-outline-100 items-center justify-center">
              <MotiView
                from={{ rotate: "-4deg", scale: 0.92 }}
                animate={{ rotate: "0deg", scale: 1 }}
                transition={{ type: "timing", duration: 700 }}
              >
                <Image
                  source={require("@/assets/logos/ovidio_logo.png")}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </MotiView>
            </Box>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 520, delay: 220 }}
          >
            <VStack space="xs" className="items-center">
              <Heading size="3xl" className="text-typography-900 font-heading">
                Ovidio
              </Heading>
              <Text className="text-typography-500 text-sm text-center">
                Books into immersive audio
              </Text>
            </VStack>
          </MotiView>

          <Box className="w-full max-w-[220px] h-1.5 rounded-full bg-background-50 overflow-hidden border border-outline-100">
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ type: "timing", duration: 1500, delay: 300 }}
              style={{ height: "100%" }}
            >
              <LinearGradient
                colors={["#3B82F6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: "100%", height: "100%" }}
              />
            </MotiView>
          </Box>
        </VStack>
      </Center>
    </Box>
  );
}
