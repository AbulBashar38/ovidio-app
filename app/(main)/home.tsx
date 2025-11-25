import { router } from "expo-router";
import { FileText, MoreVertical, Play, User } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { MOCK_BOOKS } from "@/lib/mock-data";

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
            {/* Header */}
            <HStack className="justify-between items-end">
              <VStack space="xs">
                <Text className="text-typography-500 font-medium text-sm uppercase tracking-wider">
                  Good Evening
                </Text>
                <Heading
                  size="2xl"
                  className="text-typography-900 font-heading"
                >
                  Your Library
                </Heading>
              </VStack>
              <TouchableOpacity
                onPress={() => router.push("/(main)/profile")}
                className="bg-primary-500 w-12 h-12 rounded-full items-center justify-center shadow-soft-1"
              >
                <User size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </HStack>

            {/* In Progress Section */}
            {convertingBooks.length > 0 && (
              <VStack space="md">
                <Text className="text-typography-900 font-bold text-lg">
                  Converting Now
                </Text>
                {convertingBooks.map((book) => (
                  <MotiView
                    key={book.id}
                    from={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "timing", duration: 1000, loop: true }}
                  >
                    <Box className="bg-background-50 rounded-2xl p-5 border border-outline-100 shadow-sm">
                      <HStack space="md" className="items-center mb-4">
                        <Center className="w-12 h-12 bg-primary-500/10 rounded-full">
                          <FileText size={24} className="text-primary-500" />
                        </Center>
                        <VStack className="flex-1">
                          <Text className="text-typography-900 font-bold text-lg truncate">
                            {book.title}
                          </Text>
                          <Text className="text-typography-500 text-sm">
                            {book.author}
                          </Text>
                        </VStack>
                        <Box className="bg-primary-500 px-3 py-1 rounded-full">
                          <Text className="text-typography-0 text-xs font-bold">
                            {book.progress}%
                          </Text>
                        </Box>
                      </HStack>
                      <Progress
                        value={book.progress}
                        size="sm"
                        className="bg-outline-100 h-2 rounded-full"
                      >
                        <ProgressFilledTrack className="bg-primary-500 rounded-full" />
                      </Progress>
                      <Text className="text-typography-400 text-xs mt-2 text-right">
                        Generating audio...
                      </Text>
                    </Box>
                  </MotiView>
                ))}
              </VStack>
            )}

            {/* Recent Uploads */}
            <VStack space="md">
              <HStack className="justify-between items-center">
                <Text className="text-typography-900 font-bold text-lg">
                  Recent Uploads
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(main)/library")}
                >
                  <Text className="text-primary-500 font-medium text-sm">
                    See All
                  </Text>
                </TouchableOpacity>
              </HStack>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6"
              >
                <HStack space="md">
                  {recentUploads.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => router.push("/(main)/player")}
                    >
                      <Box className="w-40 bg-background-50 rounded-2xl p-4 border border-outline-100">
                        <Box className="w-full aspect-[2/3] bg-background-200 rounded-xl mb-3 relative overflow-hidden">
                          {/* Placeholder for Cover Art */}
                          <Center className="flex-1">
                            <FileText
                              size={32}
                              className="text-typography-400"
                            />
                          </Center>
                          <Box className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                            <Text className="text-white text-[10px] font-medium">
                              {book.duration}
                            </Text>
                          </Box>
                        </Box>
                        <Text
                          className="text-typography-900 font-bold text-base truncate"
                          numberOfLines={1}
                        >
                          {book.title}
                        </Text>
                        <Text
                          className="text-typography-500 text-xs truncate"
                          numberOfLines={1}
                        >
                          {book.author}
                        </Text>
                      </Box>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>

            {/* All Uploads List */}
            <VStack space="md">
              <Text className="text-typography-900 font-bold text-lg">
                All Uploads
              </Text>
              <VStack space="sm" className="bg-background-50 rounded-3xl p-2">
                {completedBooks.map((book, index) => (
                  <React.Fragment key={book.id}>
                    {index > 0 && <Divider className="bg-outline-100 my-1" />}
                    <TouchableOpacity
                      className="p-3 flex-row items-center rounded-2xl active:bg-background-100"
                      onPress={() => router.push("/(main)/player")}
                    >
                      <Box className="w-12 h-12 bg-background-200 rounded-xl justify-center items-center mr-4">
                        <Play
                          size={20}
                          className="text-typography-900 ml-1"
                          fill="currentColor"
                        />
                      </Box>
                      <VStack className="flex-1">
                        <Text className="text-typography-900 font-bold text-base">
                          {book.title}
                        </Text>
                        <Text className="text-typography-500 text-sm">
                          {book.author} • {book.duration}
                        </Text>
                      </VStack>
                      <MoreVertical size={20} className="text-typography-400" />
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
