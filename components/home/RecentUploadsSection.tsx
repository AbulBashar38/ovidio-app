import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookJob } from "@/type/book";
import { ScrollView } from "react-native";
import { RecentUploadCard } from "./RecentUploadCard";

interface RecentUploadsSectionProps {
    books: BookJob[];
}

export function RecentUploadsSection({ books }: RecentUploadsSectionProps) {
    if (books.length === 0) return null;

    return (
        <VStack space="lg">
            <HStack className="justify-between items-end">
                <VStack>
                    <Text className="text-typography-900 font-bold text-lg">
                        Recent Uploads
                    </Text>
                    <Text className="text-typography-500 text-xs">
                        Your latest completed audiobooks
                    </Text>
                </VStack>
                <Box className="px-2.5 py-1 rounded-full bg-background-100 border border-outline-200">
                    <Text className="text-typography-600 text-xs font-semibold">
                        {books.length} items
                    </Text>
                </Box>
            </HStack>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            >
                {books.map((book) => (
                    <RecentUploadCard key={book.id} book={book} />
                ))}
            </ScrollView>
        </VStack>
    );
}
