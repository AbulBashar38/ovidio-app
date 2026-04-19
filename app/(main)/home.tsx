import { AllUploadsSection } from "@/components/home/AllUploadsSection";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { InProgressSection } from "@/components/home/InProgressSection";
import {
  LowCreditsWarning,
  NoCreditsCard,
} from "@/components/home/NoCreditsCard";
import { RecentUploadsSection } from "@/components/home/RecentUploadsSection";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { useGetBooksQuery } from "@/state-management/services/books/booksApi";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { data, isLoading } = useGetBooksQuery();
  const { data: userData } = useGetUserQuery();
  const credits = userData?.user?.creditsRemaining ?? 0;
  const [showNoCreditsPopup, setShowNoCreditsPopup] = useState(false);
  const hasShownNoCreditsRef = useRef(false);

  useEffect(() => {
    if (credits === 0 && !hasShownNoCreditsRef.current) {
      setShowNoCreditsPopup(true);
      hasShownNoCreditsRef.current = true;
      return;
    }

    if (credits > 0) {
      setShowNoCreditsPopup(false);
      hasShownNoCreditsRef.current = false;
    }
  }, [credits]);

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0">
        <SafeAreaView className="flex-1" edges={["top"]}>
          <HomeSkeleton />
        </SafeAreaView>
      </Box>
    );
  }

  // Filter for in-progress books (PENDING or PROCESSING)
  const inProgressBooks =
    data?.jobs.filter(
      (job) => job.status !== "COMPLETED" && job.status !== "FAILED",
    ) || [];

  const recentBooks =
    data?.jobs.filter(
      (job) => job.status === "COMPLETED",
      // && job.completedAt,
      // &&
      // new Date(job.completedAt) > oneMonthAgo,
    ) || [];

  return (
    <Box className="flex-1 bg-background-0">
      <LinearGradient
        colors={["#f8fbff", "#f4f7fc", "#f2f5f9"]}
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
          backgroundColor: "rgba(59,130,246,0.18)",
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
          backgroundColor: "rgba(99,102,241,0.14)",
        }}
      />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="3xl" className="px-6 pt-5">
            <HomeHeader />

            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
            >
              <Box className="rounded-3xl border border-outline-100 bg-background-0 p-4">
                <VStack space="md">
                  <Text className="text-typography-500 text-xs font-semibold uppercase tracking-wider">
                    Today Snapshot
                  </Text>
                  <HStack space="sm">
                    <Box className="flex-1 bg-background-50 border border-outline-100 rounded-2xl px-3 py-3">
                      <Text className="text-typography-500 text-xs">
                        Converting
                      </Text>
                      <Text className="text-typography-900 text-2xl font-bold">
                        {inProgressBooks.length}
                      </Text>
                    </Box>
                    <Box className="flex-1 bg-background-50 border border-outline-100 rounded-2xl px-3 py-3">
                      <Text className="text-typography-500 text-xs">
                        Completed
                      </Text>
                      <Text className="text-typography-900 text-2xl font-bold">
                        {recentBooks.length}
                      </Text>
                    </Box>
                    <Box className="flex-1 bg-background-50 border border-outline-100 rounded-2xl px-3 py-3">
                      <Text className="text-typography-500 text-xs">Total</Text>
                      <Text className="text-typography-900 text-2xl font-bold">
                        {data?.jobs?.length || 0}
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </Box>
            </MotiView>

            {/* Show prominent CTA when no credits */}
            {credits === 0 && showNoCreditsPopup && (
              <NoCreditsCard
                variant="full"
                onClose={() => setShowNoCreditsPopup(false)}
              />
            )}

            {/* Show low credits warning */}
            {credits > 0 && credits <= 2 && (
              <LowCreditsWarning credits={credits} />
            )}

            <Box className="rounded-3xl border border-outline-100 bg-background-0 p-4">
              <InProgressSection jobs={inProgressBooks} />
            </Box>

            <Box className="rounded-3xl border border-outline-100 bg-background-0 p-4">
              <RecentUploadsSection books={recentBooks} />
            </Box>

            <Box className="rounded-3xl border border-outline-100 bg-background-0 p-4 mb-4">
              <AllUploadsSection books={data?.jobs || []} />
            </Box>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
