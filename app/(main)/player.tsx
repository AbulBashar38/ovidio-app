import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Airplay,
  ChevronDown,
  ListMusic,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { MOCK_BOOKS } from "@/lib/mock-data";

const { width } = Dimensions.get("window");

export default function PlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const book = MOCK_BOOKS[1]; // Using "1984" as example

  // Animation state for the background blobs
  const [blobState, setBlobState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlobState((prev) => (prev + 1) % 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="flex-1 bg-background-950">
      {/* Animated Background */}
      <Box className="absolute inset-0 overflow-hidden">
        <MotiView
          animate={{
            translateX: blobState === 0 ? -50 : 50,
            translateY: blobState === 0 ? -50 : 50,
            scale: blobState === 0 ? 1 : 1.2,
          }}
          transition={{
            type: "timing",
            duration: 4000,
          }}
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: width * 0.4,
            backgroundColor: "#3b82f6", // primary-500 approx
            opacity: 0.2,
          }}
        />
        <MotiView
          animate={{
            translateX: blobState === 0 ? 50 : -50,
            translateY: blobState === 0 ? 100 : -50,
            scale: blobState === 0 ? 1.2 : 1,
          }}
          transition={{
            type: "timing",
            duration: 5000,
          }}
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            backgroundColor: "#a855f7", // purple-500 approx
            opacity: 0.2,
          }}
        />
        <LinearGradient
          colors={["transparent", "#181818"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "100%",
          }}
        />
      </Box>

      <SafeAreaView className="flex-1">
        <VStack className="flex-1 p-6 justify-between">
          {/* Header */}
          <HStack className="justify-between items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <ChevronDown size={28} className="text-typography-500" />
            </TouchableOpacity>
            <Text className="text-typography-500 font-medium text-xs uppercase tracking-widest">
              Now Playing
            </Text>
            <TouchableOpacity className="p-2">
              <MoreHorizontal size={24} className="text-typography-500" />
            </TouchableOpacity>
          </HStack>

          {/* Album Art */}
          <Center className="flex-1 my-8">
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              style={{
                width: width * 0.8,
                height: width * 0.8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 25,
                elevation: 10,
              }}
            >
              <Box className="w-full h-full bg-background-200 rounded-3xl overflow-hidden border border-outline-100/10">
                {/* Placeholder for actual image */}
                <LinearGradient
                  colors={["#333", "#111"]}
                  style={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text className="text-typography-500 font-heading text-6xl opacity-20">
                    {book.title.charAt(0)}
                  </Text>
                </LinearGradient>
              </Box>
            </MotiView>
          </Center>

          {/* Track Info & Controls */}
          <VStack space="4xl" className="mb-8">
            {/* Title & Author */}
            <VStack space="xs" className="items-start">
              <Heading
                size="2xl"
                className="text-typography-900 font-heading"
                numberOfLines={1}
              >
                {book.title}
              </Heading>
              <Text
                className="text-typography-500 text-lg font-medium"
                numberOfLines={1}
              >
                {book.author}
              </Text>
            </VStack>

            {/* Progress Bar */}
            <VStack space="sm">
              <Slider
                value={progress}
                maxValue={100}
                onChange={(v) => setProgress(v)}
                size="md"
                orientation="horizontal"
                isDisabled={false}
                isReversed={false}
              >
                <SliderTrack className="bg-outline-200 h-1 rounded-full">
                  <SliderFilledTrack className="bg-typography-900" />
                </SliderTrack>
                <SliderThumb className="bg-typography-900 w-3 h-3" />
              </Slider>
              <HStack className="justify-between">
                <Text className="text-typography-500 text-xs font-medium">
                  12:45
                </Text>
                <Text className="text-typography-500 text-xs font-medium">
                  -{book.duration}
                </Text>
              </HStack>
            </VStack>

            {/* Main Controls */}
            <HStack className="justify-between items-center px-4">
              <TouchableOpacity className="p-2">
                <RotateCcw size={28} className="text-typography-900" />
                <Text className="absolute top-3 left-3 text-[8px] font-bold text-typography-900 text-center w-full">
                  10
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="p-2">
                <SkipBack
                  size={32}
                  className="text-typography-900"
                  fill="currentColor"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-typography-900 rounded-full justify-center items-center shadow-lg active:scale-95"
              >
                {isPlaying ? (
                  <Pause
                    size={36}
                    className="text-background-950"
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={36}
                    className="text-background-950 ml-1"
                    fill="currentColor"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity className="p-2">
                <SkipForward
                  size={32}
                  className="text-typography-900"
                  fill="currentColor"
                />
              </TouchableOpacity>

              <TouchableOpacity className="p-2">
                <RotateCw size={28} className="text-typography-900" />
                <Text className="absolute top-3 left-3 text-[8px] font-bold text-typography-900 text-center w-full">
                  10
                </Text>
              </TouchableOpacity>
            </HStack>

            {/* Bottom Actions */}
            <HStack className="justify-between items-center mt-4 px-4">
              <TouchableOpacity className="p-2">
                <ListMusic size={24} className="text-typography-500" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Airplay size={24} className="text-typography-500" />
              </TouchableOpacity>
            </HStack>
          </VStack>
        </VStack>
      </SafeAreaView>
    </Box>
  );
}
