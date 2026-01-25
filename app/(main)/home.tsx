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
import { VStack } from "@/components/ui/vstack";
import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { useGetBooksQuery } from "@/state-management/services/books/booksApi";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { data, isLoading, error } = useGetBooksQuery();
  const { data: userData } = useGetUserQuery();
  const credits = userData?.user?.creditsRemaining ?? 0;

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

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const recentBooks =
    data?.jobs.filter(
      (job) => job.status === "COMPLETED",
      // && job.completedAt,
      // &&
      // new Date(job.completedAt) > oneMonthAgo,
    ) || [];

  return (
    <Box className="flex-1 bg-background-0">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="4xl" className="p-6">
            <HomeHeader />

            {/* Show prominent CTA when no credits */}
            {credits === 0 && <NoCreditsCard variant="full" />}

            {/* Show low credits warning */}
            {credits > 0 && credits <= 2 && (
              <LowCreditsWarning credits={credits} />
            )}

            <InProgressSection jobs={inProgressBooks} />

            <RecentUploadsSection books={recentBooks} />

            <AllUploadsSection books={data?.jobs || []} />
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
