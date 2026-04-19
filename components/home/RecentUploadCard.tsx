import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookJob } from "@/type/book";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { FileText, Play } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

interface RecentUploadCardProps {
  book: BookJob;
}

export function RecentUploadCard({ book }: RecentUploadCardProps) {
  const formattedDuration = book.estimatedDuration
    ? `${Math.round(book.estimatedDuration / 60)} min`
    : "Unknown";

  // Format date as "Nov 23"
  const dateLabel = new Date(book.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(main)/player",
          params: { jobId: book.id, title: book.originalFilename },
        })
      }
      activeOpacity={0.86}
    >
      <Box className="w-44 bg-background-50 rounded-2xl p-3 border border-outline-100">
        <Box className="w-full aspect-[3/4] rounded-xl mb-3 relative overflow-hidden">
          <LinearGradient
            colors={["#e8efff", "#dbe8ff", "#eef4ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: "100%", height: "100%" }}
          >
            <Center className="flex-1">
              <Box className="w-14 h-14 bg-primary-500/10 rounded-2xl items-center justify-center border border-primary-500/20">
                <FileText size={28} className="text-primary-500" />
              </Box>
            </Center>
          </LinearGradient>

          <Box className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-md border border-outline-100">
            <Text className="text-typography-700 text-[10px] font-semibold uppercase tracking-wide">
              Ready
            </Text>
          </Box>

          <Box className="absolute bottom-2 right-2 bg-black/65 px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-medium">{formattedDuration}</Text>
          </Box>

          <Box className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/90 border border-outline-100 items-center justify-center">
            <Play size={14} className="text-primary-500 ml-0.5" fill="currentColor" />
          </Box>
        </Box>
        <VStack space="xs">
          <Text
            className="text-typography-900 font-bold text-base"
            numberOfLines={1}
          >
            {book.originalFilename}
          </Text>
          <HStack className="justify-between items-center">
            <Text className="text-typography-500 text-xs">{dateLabel}</Text>
            <Text className="text-typography-600 text-xs font-medium">
              Completed
            </Text>
          </HStack>
        </VStack>
      </Box>
    </TouchableOpacity>
  );
}
