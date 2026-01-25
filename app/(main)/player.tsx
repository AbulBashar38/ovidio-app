import { Audio, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
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
import { useGetBookAudioQuery } from "@/state-management/services/books/booksApi";

const { width } = Dimensions.get("window");

export default function PlayerScreen() {
  const { jobId, title } = useLocalSearchParams<{
    jobId: string;
    title?: string;
  }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Use refs for values that need to be accessed in callbacks without causing re-renders
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSeekingRef = useRef(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const lastSeekTimeRef = useRef(0);

  const book = MOCK_BOOKS[1]; // Fallback for UI display

  // Fetch audio from API using jobId from route params
  const {
    data: audioData,
    isLoading: audioLoading,
    error: audioError,
  } = useGetBookAudioQuery(jobId!, {
    skip: !jobId, // Skip query if no jobId
  });

  // Format time from milliseconds to mm:ss
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Playback status update callback
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // Don't update UI during seeking to prevent flickering
    if (isSeekingRef.current) return;

    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis || 0);
    setProgress(
      status.durationMillis
        ? (status.positionMillis / status.durationMillis) * 100
        : 0,
    );
    setIsPlaying(status.isPlaying);

    // Handle playback finished
    if (status.didJustFinish) {
      setIsPlaying(false);
      setProgress(0);
      setPosition(0);
    }
  };

  // Load and setup audio when audioData is available
  useEffect(() => {
    const loadAudio = async () => {
      if (!audioData?.url) return;

      try {
        setIsAudioLoading(true);

        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Unload previous sound if exists
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        // Create and load new sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioData.url },
          { shouldPlay: false, progressUpdateIntervalMillis: 500 },
          onPlaybackStatusUpdate,
        );

        soundRef.current = sound;
        console.log("✅ Audio loaded successfully");
      } catch (error) {
        console.error("❌ Error loading audio:", error);
      } finally {
        setIsAudioLoading(false);
      }
    };

    loadAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, [audioData?.url]);

  // Play/Pause toggle
  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error("❌ Error toggling playback:", error);
    }
  };

  // Debounced seek function - waits for user to stop seeking before actually seeking
  const performSeek = async (seekPosition: number) => {
    if (!soundRef.current || !duration) return;

    const now = Date.now();
    // Throttle: minimum 300ms between seek operations
    if (now - lastSeekTimeRef.current < 300) {
      // Queue this seek for later
      pendingSeekRef.current = seekPosition;
      return;
    }

    try {
      lastSeekTimeRef.current = now;
      await soundRef.current.setPositionAsync(seekPosition);
      pendingSeekRef.current = null;
    } catch (error: any) {
      // Ignore "Seeking interrupted" errors - they're expected when seeking rapidly
      if (!error?.message?.includes("Seeking interrupted")) {
        console.error("❌ Error seeking:", error);
      }
    }
  };

  // Handle slider change while dragging (just update UI, don't seek yet)
  const handleSliderChange = (value: number) => {
    isSeekingRef.current = true;
    setProgress(value);
    // Update position preview
    const previewPosition = (value / 100) * duration;
    setPosition(previewPosition);
  };

  // Seek to position when user finishes dragging
  const handleSeekEnd = async (value: number) => {
    if (!soundRef.current || !duration) {
      isSeekingRef.current = false;
      return;
    }

    const seekPosition = (value / 100) * duration;

    // Clear any pending seek timeout
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }

    // Small delay to ensure we get the final position
    seekTimeoutRef.current = setTimeout(async () => {
      try {
        lastSeekTimeRef.current = Date.now();
        await soundRef.current?.setPositionAsync(seekPosition);
      } catch (error: any) {
        if (!error?.message?.includes("Seeking interrupted")) {
          console.error("❌ Error seeking:", error);
        }
      } finally {
        isSeekingRef.current = false;
      }
    }, 50);
  };

  // Skip forward 10 seconds with debouncing
  const skipForward = async () => {
    if (!soundRef.current || !duration) return;

    // Calculate new position based on current state, not async position
    const newPosition = Math.min(position + 10000, duration);

    // Update UI immediately for responsiveness
    setPosition(newPosition);
    setProgress((newPosition / duration) * 100);

    // Perform the actual seek with throttling
    performSeek(newPosition);
  };

  // Skip backward 10 seconds with debouncing
  const skipBackward = async () => {
    if (!soundRef.current || !duration) return;

    // Calculate new position based on current state
    const newPosition = Math.max(position - 10000, 0);

    // Update UI immediately for responsiveness
    setPosition(newPosition);
    setProgress((newPosition / duration) * 100);

    // Perform the actual seek with throttling
    performSeek(newPosition);
  };

  // Process any pending seeks after throttle period
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingSeekRef.current !== null && !isSeekingRef.current) {
        const seekPos = pendingSeekRef.current;
        pendingSeekRef.current = null;
        performSeek(seekPos);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [duration]);

  // Log API response
  useEffect(() => {
    console.log("🎵 Player opened with jobId:", jobId);
    if (audioData) {
      console.log("📻 Audio API Response:", audioData);
    }
    if (audioError) {
      console.error("❌ Audio API Error:", audioError);
    }
  }, [jobId, audioData, audioError]);

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
                {title || book.title}
              </Heading>
              <Text
                className="text-typography-500 text-lg font-medium"
                numberOfLines={1}
              >
                {audioData?.backgroundTrack
                  ? `🎵 ${audioData.backgroundTrack}`
                  : audioLoading
                    ? "Loading..."
                    : book.author}
              </Text>
            </VStack>

            {/* Progress Bar */}
            <VStack space="sm">
              <Slider
                value={progress}
                maxValue={100}
                onChange={handleSliderChange}
                onChangeEnd={handleSeekEnd}
                size="md"
                orientation="horizontal"
                isDisabled={!soundRef.current}
                isReversed={false}
              >
                <SliderTrack className="bg-outline-200 h-1 rounded-full">
                  <SliderFilledTrack className="bg-typography-900" />
                </SliderTrack>
                <SliderThumb className="bg-typography-900 w-3 h-3" />
              </Slider>
              <HStack className="justify-between">
                <Text className="text-typography-500 text-xs font-medium">
                  {formatTime(position)}
                </Text>
                <Text className="text-typography-500 text-xs font-medium">
                  -{formatTime(duration - position)}
                </Text>
              </HStack>
            </VStack>

            {/* Main Controls */}
            <HStack className="justify-between items-center px-4">
              <TouchableOpacity onPress={skipBackward} className="p-2">
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
                onPress={togglePlayPause}
                disabled={isAudioLoading || audioLoading || !audioData?.url}
                className="w-20 h-20 bg-typography-900 rounded-full justify-center items-center shadow-lg active:scale-95"
              >
                {isAudioLoading || audioLoading ? (
                  <ActivityIndicator size="large" color="#181818" />
                ) : isPlaying ? (
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

              <TouchableOpacity onPress={skipForward} className="p-2">
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
