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
import { useCallback, useEffect, useRef, useState } from "react";
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
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const performSeek = useCallback(
    async (seekPosition: number) => {
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
    },
    [duration],
  );

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
  }, [performSeek]);

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

  const artworkSize = Math.min(width * 0.78, 360);

  return (
    <Box className="flex-1 bg-background-950">
      {/* Animated Background */}
      <Box className="absolute inset-0 overflow-hidden">
        <MotiView
          animate={{
            translateX: blobState === 0 ? -40 : 35,
            translateY: blobState === 0 ? -45 : 40,
            scale: blobState === 0 ? 0.95 : 1.15,
          }}
          transition={{
            type: "timing",
            duration: 4000,
          }}
          style={{
            position: "absolute",
            top: "8%",
            left: "8%",
            width: width * 0.78,
            height: width * 0.78,
            borderRadius: width * 0.39,
            backgroundColor: "#2563EB",
            opacity: 0.24,
          }}
        />
        <MotiView
          animate={{
            translateX: blobState === 0 ? 40 : -45,
            translateY: blobState === 0 ? 85 : -35,
            scale: blobState === 0 ? 1.1 : 0.92,
          }}
          transition={{
            type: "timing",
            duration: 5000,
          }}
          style={{
            position: "absolute",
            bottom: "16%",
            right: "10%",
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            backgroundColor: "#0891B2",
            opacity: 0.22,
          }}
        />
        <MotiView
          animate={{
            translateX: blobState === 0 ? 0 : 18,
            translateY: blobState === 0 ? 0 : -18,
            scale: blobState === 0 ? 1.05 : 0.94,
          }}
          transition={{
            type: "timing",
            duration: 4300,
          }}
          style={{
            position: "absolute",
            top: "42%",
            left: "-18%",
            width: width * 0.6,
            height: width * 0.6,
            borderRadius: width * 0.3,
            backgroundColor: "#0F766E",
            opacity: 0.16,
          }}
        />
        <LinearGradient
          colors={["#11131800", "#0E1015E6", "#0E1015"]}
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
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full border border-outline-700 items-center justify-center"
              style={{ backgroundColor: "rgba(24, 23, 25, 0.72)" }}
              activeOpacity={0.8}
            >
              <ChevronDown size={24} className="text-typography-800" />
            </TouchableOpacity>
            <Text className="text-typography-500 font-semibold text-[11px] uppercase tracking-[2px]">
              Now Playing
            </Text>
            <TouchableOpacity
              className="w-11 h-11 rounded-full border border-outline-700 items-center justify-center"
              style={{ backgroundColor: "rgba(24, 23, 25, 0.72)" }}
              activeOpacity={0.8}
            >
              <MoreHorizontal size={22} className="text-typography-800" />
            </TouchableOpacity>
          </HStack>

          {/* Album Art */}
          <Center className="flex-1 my-7">
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 16 }}
              style={{
                width: artworkSize,
                height: artworkSize,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.45,
                shadowRadius: 28,
                elevation: 14,
              }}
            >
              <Box className="w-full h-full rounded-3xl overflow-hidden border border-outline-700/60">
                <LinearGradient
                  colors={["#1E293B", "#0F172A", "#111827"]}
                  style={{
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MotiView
                    animate={{ scale: isPlaying ? [1, 1.04, 1] : 1 }}
                    transition={{
                      type: "timing",
                      duration: 2400,
                      loop: isPlaying,
                    }}
                  >
                    <Box className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 items-center justify-center">
                      <Text className="text-white/70 font-heading text-5xl">
                        {book.title.charAt(0)}
                      </Text>
                    </Box>
                  </MotiView>
                  <Text className="text-white/70 text-xs uppercase tracking-[2px] mt-5">
                    Ovidio Player
                  </Text>
                  <Text className="text-white/45 text-[10px] uppercase tracking-[2px] mt-1">
                    Immersive Audio
                  </Text>
                </LinearGradient>
              </Box>
            </MotiView>
          </Center>

          {/* Track Info & Controls */}
          <Box className="rounded-[28px] border border-outline-700/70 px-5 pt-5 pb-6">
            <LinearGradient
              colors={["rgba(24,23,25,0.86)", "rgba(17,18,23,0.92)"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 28,
              }}
            />
            <VStack space="2xl">
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
                  className="text-typography-500 text-base font-medium"
                  numberOfLines={1}
                >
                  {audioData?.backgroundTrack
                    ? `Background: ${audioData.backgroundTrack}`
                    : audioLoading
                      ? "Loading audio..."
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
                  <SliderTrack className="bg-outline-600 h-1.5 rounded-full">
                    <SliderFilledTrack className="bg-primary-500" />
                  </SliderTrack>
                  <SliderThumb className="bg-primary-500 w-3.5 h-3.5" />
                </Slider>
                <HStack className="justify-between">
                  <Box className="px-2.5 py-1 rounded-full bg-background-800/90 border border-outline-700">
                    <Text className="text-typography-500 text-[11px] font-semibold">
                      {formatTime(position)}
                    </Text>
                  </Box>
                  <Box className="px-2.5 py-1 rounded-full bg-background-800/90 border border-outline-700">
                    <Text className="text-typography-500 text-[11px] font-semibold">
                      -{formatTime(duration - position)}
                    </Text>
                  </Box>
                </HStack>
              </VStack>

              {/* Main Controls */}
              <HStack className="justify-between items-center">
                <TouchableOpacity
                  onPress={skipBackward}
                  className="w-12 h-12 rounded-full bg-background-800 border border-outline-700 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <RotateCcw size={21} className="text-typography-800" />
                  <Text className="absolute text-[8px] font-bold text-typography-800 mt-5">
                    10
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-12 h-12 rounded-full bg-background-800 border border-outline-700 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <SkipBack
                    size={22}
                    className="text-typography-900"
                    fill="currentColor"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={togglePlayPause}
                  disabled={isAudioLoading || audioLoading || !audioData?.url}
                  className="w-20 h-20 rounded-full justify-center items-center shadow-lg active:opacity-90"
                  style={{
                    backgroundColor:
                      isAudioLoading || audioLoading || !audioData?.url
                        ? "#3A3D45"
                        : "#3B82F6",
                  }}
                >
                  {isAudioLoading || audioLoading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  ) : isPlaying ? (
                    <Pause
                      size={34}
                      className="text-white"
                      fill="currentColor"
                    />
                  ) : (
                    <Play
                      size={34}
                      className="text-white ml-1"
                      fill="currentColor"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-12 h-12 rounded-full bg-background-800 border border-outline-700 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <SkipForward
                    size={22}
                    className="text-typography-900"
                    fill="currentColor"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={skipForward}
                  className="w-12 h-12 rounded-full bg-background-800 border border-outline-700 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <RotateCw size={21} className="text-typography-800" />
                  <Text className="absolute text-[8px] font-bold text-typography-800 mt-5">
                    10
                  </Text>
                </TouchableOpacity>
              </HStack>

              {/* Bottom Actions */}
              <HStack className="justify-between items-center">
                <TouchableOpacity
                  className="px-3.5 py-2 rounded-full bg-background-800 border border-outline-700"
                  activeOpacity={0.8}
                >
                  <HStack space="xs" className="items-center">
                    <ListMusic size={16} className="text-typography-600" />
                    <Text className="text-typography-600 text-xs font-medium">
                      Queue
                    </Text>
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-3.5 py-2 rounded-full bg-background-800 border border-outline-700"
                  activeOpacity={0.8}
                >
                  <HStack space="xs" className="items-center">
                    <Airplay size={16} className="text-typography-600" />
                    <Text className="text-typography-600 text-xs font-medium">
                      Output
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </SafeAreaView>
    </Box>
  );
}
