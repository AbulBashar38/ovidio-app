import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useGetBookDetailsQuery } from "@/state-management/services/books/booksApi";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  Hash,
  XCircle,
} from "lucide-react-native";
import { MotiView } from "moti";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetBookDetailsQuery(id!);

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0">
        <LinearGradient
          colors={["#070A12", "#10131D", "#181719"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <Center className="flex-1">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Center>
      </Box>
    );
  }

  if (error || !data?.job) {
    return (
      <Box className="flex-1 bg-background-0">
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={["#070A12", "#10131D", "#181719"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <SafeAreaView className="flex-1" edges={["top"]}>
          <Center className="flex-1 px-6">
            <Box className="rounded-3xl border border-outline-100 bg-background-0 p-6 w-full">
              <VStack space="md" className="items-center">
                <Center className="w-16 h-16 bg-error-500/10 rounded-full">
                  <AlertCircle size={32} className="text-error-500" />
                </Center>
                <Heading size="lg" className="text-typography-900 text-center">
                  Failed to load details
                </Heading>
                <Text className="text-typography-500 text-center">
                  We could not fetch the book information. Please try again
                  later.
                </Text>
              </VStack>
            </Box>
          </Center>
        </SafeAreaView>
      </Box>
    );
  }

  const { job } = data;
  const events = job.events || [];
  // Sort events by date descending (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-success-500";
      case "FAILED":
        return "text-error-500";
      case "PROCESSING":
        return "text-primary-500";
      default:
        return "text-typography-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={24} className="text-success-500" />;
      case "FAILED":
        return <XCircle size={24} className="text-error-500" />;
      case "PROCESSING":
        return <Clock size={24} className="text-primary-500" />;
      default:
        return <Clock size={24} className="text-typography-500" />;
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#070A12", "#10131D", "#181719"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <MotiView
        from={{ opacity: 0.18, scale: 0.9 }}
        animate={{ opacity: 0.3, scale: 1.05 }}
        transition={{ type: "timing", duration: 6000, loop: true }}
        style={{
          position: "absolute",
          top: -90,
          right: -90,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: "rgba(59,130,246,0.22)",
        }}
      />
      <MotiView
        from={{ opacity: 0.12, translateY: 0 }}
        animate={{ opacity: 0.22, translateY: -12 }}
        transition={{ type: "timing", duration: 4800, loop: true }}
        style={{
          position: "absolute",
          bottom: 90,
          left: -80,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: "rgba(99,102,241,0.18)",
        }}
      />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="3xl" className="px-6 pt-5">
            <HStack className="items-center" space="md">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                <Center className="w-11 h-11 rounded-2xl bg-background-0 border border-outline-100">
                  <ChevronLeft size={22} className="text-typography-900" />
                </Center>
              </TouchableOpacity>
              <VStack className="flex-1" space="xs">
                <Heading
                  size="2xl"
                  className="text-typography-900 font-heading"
                >
                  Book Details
                </Heading>
                <Text className="text-typography-500 text-base leading-relaxed">
                  Track conversion progress and processing activity.
                </Text>
              </VStack>
            </HStack>

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
            >
              <Box className="rounded-3xl border border-outline-100 bg-background-0 p-4">
                <HStack space="md" className="items-center">
                  <Center className="w-16 h-16 bg-primary-500/10 rounded-2xl">
                    <FileText size={30} className="text-primary-500" />
                  </Center>
                  <VStack className="flex-1" space="xs">
                    <Heading
                      size="md"
                      className="text-typography-900"
                      numberOfLines={2}
                    >
                      {job.originalFilename}
                    </Heading>
                    <HStack
                      space="xs"
                      className="items-center bg-background-50 self-start px-3 py-1 rounded-full border border-outline-100"
                    >
                      {getStatusIcon(job.status)}
                      <Text
                        className={`font-bold ${getStatusColor(job.status)} uppercase text-xs tracking-wider`}
                      >
                        {job.status}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            </MotiView>

            {job.status === "FAILED" && job.errorMessage && (
              <Box className="bg-error-500/10 border border-error-500/20 rounded-3xl p-5">
                <VStack space="md">
                  <HStack space="md" className="items-center">
                    <Center className="w-10 h-10 bg-error-500/10 rounded-2xl">
                      <AlertTriangle size={20} className="text-error-500" />
                    </Center>
                    <Text className="text-error-500 font-bold text-lg">
                      Conversion Failed
                    </Text>
                  </HStack>

                  <Text className="text-typography-600 text-sm leading-6">
                    {job.errorMessage}
                  </Text>
                </VStack>
              </Box>
            )}

            <HStack space="md" className="justify-between">
              <Box className="flex-1 bg-background-0 p-4 rounded-2xl border border-outline-100">
                <HStack space="sm" className="items-center">
                  <Center className="w-10 h-10 bg-primary-500/10 rounded-2xl">
                    <Hash size={18} className="text-primary-500" />
                  </Center>
                  <VStack className="flex-1">
                    <Text className="text-typography-500 text-xs">
                      Characters
                    </Text>
                    <Text className="text-typography-900 font-bold text-lg">
                      {(job.totalCharacters || 0).toLocaleString()}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
              <Box className="flex-1 bg-background-0 p-4 rounded-2xl border border-outline-100">
                <HStack space="sm" className="items-center">
                  <Center className="w-10 h-10 bg-background-50 rounded-2xl">
                    <Clock size={18} className="text-typography-500" />
                  </Center>
                  <VStack className="flex-1">
                    <Text className="text-typography-500 text-xs">Created</Text>
                    <Text className="text-typography-900 font-bold text-lg">
                      {new Date(job.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </HStack>

            <VStack space="lg">
              <Text className="text-typography-500 font-semibold text-xs uppercase tracking-wider">
                Activity Log
              </Text>
              <VStack space="sm">
                {sortedEvents.map((event, index) => (
                  <Box
                    key={event.id}
                    className="rounded-2xl border border-outline-100 bg-background-0 px-4 py-3"
                  >
                    <HStack space="md" className="items-start">
                      <Center
                        className={`w-9 h-9 rounded-2xl ${
                          event.status === "FAILED"
                            ? "bg-error-500/10"
                            : "bg-primary-500/10"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            event.status === "FAILED"
                              ? "text-error-500"
                              : "text-primary-500"
                          }`}
                        >
                          {index + 1}
                        </Text>
                      </Center>
                      <VStack className="flex-1" space="xs">
                        <Text className="text-typography-900 font-bold text-base">
                          {event.message}
                        </Text>
                        <HStack space="sm" className="items-center flex-wrap">
                          <Text className="text-typography-400 text-xs font-medium uppercase tracking-wider bg-background-50 px-2 py-0.5 rounded-full border border-outline-100">
                            {event.step.replace("_", " ")}
                          </Text>
                          <Text className="text-typography-400 text-xs">
                            {new Date(event.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </HStack>
                        {event.status === "FAILED" && (
                          <Text className="text-error-500 text-xs mt-1">
                            Step Failed
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </Box>
                ))}
                {sortedEvents.length === 0 && (
                  <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
                    <Text className="text-typography-400 text-sm text-center">
                      No activity recorded yet.
                    </Text>
                  </Box>
                )}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
