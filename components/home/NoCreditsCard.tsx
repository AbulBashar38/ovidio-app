import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BookOpen, Sparkles, X, Zap } from "lucide-react-native";
import { MotiView } from "moti";
import { TouchableOpacity } from "react-native";

interface NoCreditsCardProps {
  variant?: "banner" | "full";
  onClose?: () => void;
}

export function NoCreditsCard({
  variant = "banner",
  onClose,
}: NoCreditsCardProps) {
  const handleBuyCredits = () => {
    router.push("/(main)/buy-credits");
  };

  if (variant === "full") {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <Box className="bg-background-50 rounded-3xl p-6 border border-outline-100 relative">
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-4 top-4 w-8 h-8 items-center justify-center rounded-full bg-background-100"
              activeOpacity={0.8}
            >
              <X size={16} className="text-typography-500" />
            </TouchableOpacity>
          )}
          <VStack space="xl" className="items-center">
            {/* Icon */}
            <MotiView
              from={{ rotate: "-10deg" }}
              animate={{ rotate: "10deg" }}
              transition={{
                type: "timing",
                duration: 2000,
                loop: true,
              }}
            >
              <Box className="w-20 h-20 bg-primary-500/10 rounded-full items-center justify-center">
                <BookOpen size={40} className="text-primary-500" />
              </Box>
            </MotiView>

            {/* Message */}
            <VStack space="sm" className="items-center">
              <Heading size="xl" className="text-typography-900 text-center">
                Ready to Listen?
              </Heading>
              <Text className="text-typography-500 text-center text-base max-w-[280px]">
                Get credits to convert your favorite books into immersive audio
                experiences.
              </Text>
            </VStack>

            {/* Benefits */}
            <VStack space="xs" className="w-full">
              {[
                "AI-powered expressive narration",
                "Background music & ambiance",
                "Download & listen offline",
              ].map((benefit, i) => (
                <HStack key={i} space="sm" className="items-center">
                  <Box className="w-5 h-5 bg-success-500/10 rounded-full items-center justify-center">
                    <Sparkles size={12} className="text-success-500" />
                  </Box>
                  <Text className="text-typography-600 text-sm">{benefit}</Text>
                </HStack>
              ))}
            </VStack>

            {/* CTA Button */}
            <Button
              size="xl"
              className="w-full rounded-2xl"
              onPress={handleBuyCredits}
            >
              <HStack space="sm" className="items-center">
                <Zap size={20} color="white" />
                <ButtonText className="font-bold text-lg">
                  Get Credits
                </ButtonText>
              </HStack>
            </Button>

            <Text className="text-typography-400 text-xs text-center">
              Starting from $2.99 • No subscription required
            </Text>
          </VStack>
        </Box>
      </MotiView>
    );
  }

  // Banner variant - more compact
  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
    >
      <TouchableOpacity onPress={handleBuyCredits} activeOpacity={0.9}>
        <Box className="rounded-2xl overflow-hidden">
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16 }}
          >
            <HStack className="items-center justify-between">
              <HStack space="md" className="items-center flex-1">
                <Box className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                  <Sparkles size={24} color="white" />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-white font-bold text-base">
                    No Credits Remaining
                  </Text>
                  <Text className="text-white/80 text-sm">
                    Get credits to convert more books
                  </Text>
                </VStack>
              </HStack>

              <Box className="bg-white rounded-xl px-4 py-2">
                <Text className="text-primary-600 font-bold text-sm">
                  Buy Now
                </Text>
              </Box>
            </HStack>
          </LinearGradient>
        </Box>
      </TouchableOpacity>
    </MotiView>
  );
}

// Low credits warning banner
interface LowCreditsWarningProps {
  credits: number;
}

export function LowCreditsWarning({ credits }: LowCreditsWarningProps) {
  if (credits > 2) return null;

  return (
    <MotiView
      from={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ type: "timing", duration: 300 }}
    >
      <TouchableOpacity
        onPress={() => router.push("/(main)/buy-credits")}
        activeOpacity={0.9}
      >
        <Box className="bg-warning-50 border border-warning-200 rounded-xl p-3">
          <HStack className="items-center justify-between">
            <HStack space="sm" className="items-center">
              <Zap size={18} className="text-warning-600" />
              <Text className="text-warning-700 text-sm font-medium">
                Only {credits} credit{credits !== 1 ? "s" : ""} left
              </Text>
            </HStack>
            <Text className="text-warning-600 text-sm font-bold">Top up →</Text>
          </HStack>
        </Box>
      </TouchableOpacity>
    </MotiView>
  );
}
