import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookJob } from "@/type/book";
import { router } from "expo-router";
import { AlertCircle, ChevronRight, FileText, Play } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

interface BookListItemProps {
    book: BookJob;
}

export function BookListItem({ book }: BookListItemProps) {
    const handlePress = () => {
        if (book.status === "COMPLETED") {
            router.push("/(main)/player");
        } else {
            router.push(`/book/${book.id}`);
        }
    };

    const formattedDuration = book.estimatedDuration
        ? `${Math.round(book.estimatedDuration / 60)} min`
        : "Processing...";

    const isCompleted = book.status === "COMPLETED";
    const isFailed = book.status === "FAILED";
    const metaText = isFailed
        ? "Conversion failed"
        : `${new Date(book.createdAt).toLocaleDateString()} • ${formattedDuration}`;
    const statusChipClass = isFailed
        ? "bg-error-500/10 text-error-600 border-error-500/20"
        : isCompleted
            ? "bg-success-500/10 text-success-700 border-success-500/20"
            : "bg-primary-500/10 text-primary-600 border-primary-500/20";
    const statusLabel = isFailed ? "Failed" : isCompleted ? "Ready" : "Converting";

    return (
        <TouchableOpacity
            className="p-3 flex-row items-center rounded-2xl border border-outline-100 bg-background-50 active:bg-background-100"
            onPress={handlePress}
            activeOpacity={0.86}
        >
            <Box className={`w-12 h-12 ${isCompleted ? 'bg-primary-500/10 border border-primary-500/20' : isFailed ? 'bg-error-500/10 border border-error-500/20' : 'bg-background-100 border border-outline-200'} rounded-xl justify-center items-center mr-4`}>
                {isCompleted ? (
                    <Play
                        size={20}
                        className="text-primary-500 ml-1"
                        fill="currentColor"
                    />
                ) : isFailed ? (
                    <AlertCircle
                        size={20}
                        className="text-error-500"
                    />
                ) : (
                    <FileText
                        size={20}
                        className="text-typography-400"
                    />
                )}
            </Box>
            <VStack className="flex-1" space="xs">
                <Text className="text-typography-900 font-bold text-base truncate" numberOfLines={1}>
                    {book.originalFilename}
                </Text>
                <HStack className="items-center justify-between">
                    <Text className={`${isFailed ? 'text-error-600' : 'text-typography-500'} text-sm`}>
                        {metaText}
                    </Text>
                    <Box className={`px-2 py-0.5 rounded-full border ${statusChipClass}`}>
                        <Text className="text-[10px] font-semibold uppercase tracking-wide">
                            {statusLabel}
                        </Text>
                    </Box>
                </HStack>
            </VStack>
            <ChevronRight size={18} className="text-typography-400 ml-2" />
        </TouchableOpacity>
    );
}
