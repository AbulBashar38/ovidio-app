import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useGetBookDetailsQuery } from "@/state-management/services/books/booksApi";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  XCircle,
} from "lucide-react-native";
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGetBookDetailsQuery(id!);

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </Box>
    );
  }

  if (error || !data?.job) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center p-6">
        <AlertCircle size={48} className="text-error-500 mb-4" />
        <Text className="text-typography-900 font-bold text-lg mb-2">
          Failed to load details
        </Text>
        <Text className="text-typography-500 text-center">
          We couldn't fetch the book information. Please try again later.
        </Text>
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
      <Stack.Screen
        options={{
          title: "Book Details",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="active:opacity-70 flex-row items-center"
            >
              <ChevronLeft size={24} className="text-typography-900" />
              <Text className="text-typography-900 text-base ml-1">Back</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView className="flex-1" edges={["bottom", "top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 50, paddingHorizontal: 24 }}
        >
          <VStack space="4xl">
            {/* Header Info */}
            <Center className="mb-4">
              <Box className="w-20 h-20 bg-background-100 rounded-2xl items-center justify-center mb-4 border border-outline-100">
                <FileText size={40} className="text-typography-400" />
              </Box>
              <Heading
                size="xl"
                className="text-center text-typography-900 font-bold mb-1"
              >
                {job.originalFilename}
              </Heading>
              <HStack
                space="xs"
                className="items-center bg-background-50 px-3 py-1 rounded-full border border-outline-100"
              >
                {getStatusIcon(job.status)}
                <Text
                  className={`font-bold ${getStatusColor(job.status)} uppercase text-xs tracking-wider`}
                >
                  {job.status}
                </Text>
              </HStack>
            </Center>

            {/* Error Box */}
            {job.status === "FAILED" && job.errorMessage && (
              <Box className="bg-error-500 rounded-3xl p-6 shadow-soft-4 overflow-hidden relative">
                {/* Decorative background circle */}
                <Box className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full" />

                <VStack space="md">
                  <HStack space="md" className="items-center">
                    <Box className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md">
                      <AlertTriangle size={20} color="white" />
                    </Box>
                    <Text className="text-white font-bold text-lg">
                      Conversion Failed
                    </Text>
                  </HStack>

                  <Text className="text-white/90 text-sm leading-6">
                    {job.errorMessage}
                  </Text>

                  {/* Action Button */}
                  {/* <Button className="bg-white rounded-xl mt-2 p-3 active:bg-white/90">
                                          <Text className="text-error-500 font-bold text-center">Retry Conversion</Text>
                                     </Button> */}
                </VStack>
              </Box>
            )}

            {/* Stats Grid */}
            <HStack space="md" className="justify-between">
              <Box className="flex-1 bg-background-50 p-4 rounded-xl border border-outline-100 items-center">
                <Text className="text-typography-400 text-xs uppercase font-bold mb-1">
                  Characters
                </Text>
                <Text className="text-typography-900 font-bold text-lg">
                  {(job.totalCharacters || 0).toLocaleString()}
                </Text>
              </Box>
              <Box className="flex-1 bg-background-50 p-4 rounded-xl border border-outline-100 items-center">
                <Text className="text-typography-400 text-xs uppercase font-bold mb-1">
                  Created
                </Text>
                <Text className="text-typography-900 font-bold text-lg">
                  {new Date(job.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </Box>
            </HStack>

            {/* Activity Timeline */}
            <VStack space="lg">
              <Heading size="md" className="text-typography-900 font-bold">
                Activity Log
              </Heading>
              <VStack className="pl-4 border-l-2 border-outline-100 ml-2 space-y-8 pb-4">
                {sortedEvents.map((event, index) => (
                  <Box key={event.id} className="relative pl-6">
                    {/* Timeline Dot */}
                    <Box
                      className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background-0 ${event.status === "FAILED" ? "bg-error-500" : "bg-primary-500"}`}
                    />

                    <VStack space="xs">
                      <Text className="text-typography-900 font-bold text-base">
                        {event.message}
                      </Text>
                      <HStack space="sm" className="items-center">
                        <Text className="text-typography-400 text-xs font-medium uppercase tracking-wider bg-background-100 px-2 py-0.5 rounded">
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
                  </Box>
                ))}
                {sortedEvents.length === 0 && (
                  <Text className="text-typography-400 text-sm italic pl-6">
                    No activity recorded yet.
                  </Text>
                )}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
