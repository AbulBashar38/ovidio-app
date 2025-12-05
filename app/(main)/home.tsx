import { AllUploadsSection } from "@/components/home/AllUploadsSection";
import { HomeHeader } from "@/components/home/HomeHeader";
import { InProgressSection } from "@/components/home/InProgressSection";
import { RecentUploadsSection } from "@/components/home/RecentUploadsSection";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { MOCK_BOOKS } from "@/lib/mock-data";
import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const convertingBooks = MOCK_BOOKS.filter((b) => b.status === "converting");
  const completedBooks = MOCK_BOOKS.filter((b) => b.status === "completed");
  const recentUploads = completedBooks.slice(0, 3);

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

            <InProgressSection books={convertingBooks} />

            <RecentUploadsSection books={recentUploads} />

            <AllUploadsSection books={completedBooks} />
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
