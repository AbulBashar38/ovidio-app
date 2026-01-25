import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { BookJob } from "@/type/book";
import { router } from "expo-router";
import { FileText } from "lucide-react-native";
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
    >
      <Box className="w-40 bg-background-50 rounded-2xl p-4 border border-outline-100">
        <Box className="w-full aspect-[2/3] bg-background-200 rounded-xl mb-3 relative overflow-hidden">
          {/* Placeholder for Cover Art */}
          <Center className="flex-1">
            <FileText size={32} className="text-typography-400" />
          </Center>
          <Box className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
            <Text className="text-white text-[10px] font-medium">
              {formattedDuration}
            </Text>
          </Box>
        </Box>
        <Text
          className="text-typography-900 font-bold text-base truncate"
          numberOfLines={1}
        >
          {book.originalFilename}
        </Text>
        <Text
          className="text-typography-500 text-xs truncate"
          numberOfLines={1}
        >
          {dateLabel}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
