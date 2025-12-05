import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookJob } from "@/type/book";
import { router } from "expo-router";
import { AlertCircle, FileText, MoreVertical, Play } from "lucide-react-native";
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

    return (
        <TouchableOpacity
            className="p-3 flex-row items-center rounded-2xl active:bg-background-100"
            onPress={handlePress}
        >
            <Box className={`w-12 h-12 ${isCompleted ? 'bg-primary-500/10' : isFailed ? 'bg-error-500/10' : 'bg-background-200'} rounded-xl justify-center items-center mr-4`}>
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
            <VStack className="flex-1">
                <Text className="text-typography-900 font-bold text-base truncate" numberOfLines={1}>
                    {book.originalFilename}
                </Text>
                <Text className={`${isFailed ? 'text-error-500' : 'text-typography-500'} text-sm`}>
                    {isFailed ? "Conversion Failed" : `${new Date(book.createdAt).toLocaleDateString()} • ${formattedDuration}`}
                </Text>
            </VStack>
            <MoreVertical size={20} className="text-typography-400" />
        </TouchableOpacity>
    );
}
