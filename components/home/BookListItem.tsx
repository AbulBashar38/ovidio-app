import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Book } from "@/lib/mock-data";
import { router } from "expo-router";
import { MoreVertical, Play } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

interface BookListItemProps {
    book: Book;
}

export function BookListItem({ book }: BookListItemProps) {
    return (
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
    );
}
