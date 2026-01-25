import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export function HomeHeader() {
  const { data: userData } = useGetUserQuery();
  const credits = userData?.user?.creditsRemaining || 0;

  return (
    <HStack className="justify-between items-end">
      <VStack space="xs">
        <Text className="text-typography-500 font-medium text-sm uppercase tracking-wider">
          Good Evening
        </Text>
        <Heading size="2xl" className="text-typography-900 font-heading">
          Your Library
        </Heading>
      </VStack>

      <HStack space="md" className="items-center">
        {/* Credits Badge - Tappable to buy more */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/buy-credits")}
          activeOpacity={0.8}
        >
          <Box className="rounded-full overflow-hidden shadow-sm border-2 border-[#78acffff]">
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]} // primary-500 to primary-600
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            >
              <HStack space="xs" className="items-center">
                <Text className="text-white font-bold text-sm">{credits}</Text>
                <Text className="text-white/90 text-xs font-medium">
                  Credits
                </Text>
              </HStack>
            </LinearGradient>
          </Box>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(main)/profile")}
          className="bg-background-800 w-12 h-12 rounded-full items-center justify-center border border-outline-800"
        >
          {/* Show first letter of name if available, else icon */}
          {userData?.user?.firstName ? (
            <Text className="text-xl font-bold text-primary-500">
              {userData.user.firstName.charAt(0)}
            </Text>
          ) : (
            <User size={24} className="text-primary-500" />
          )}
        </TouchableOpacity>
      </HStack>
    </HStack>
  );
}
