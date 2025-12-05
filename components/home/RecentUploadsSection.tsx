import { Box } from "@/components/ui/box";
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
        <VStack space="md">
            <Box className="flex-row justify-between items-center">
                <Text className="text-typography-900 font-bold text-lg">
                    Recent Uploads
                </Text>
                <Text className="text-primary-500 font-bold text-sm">See All</Text>
            </Box>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
            >
                {books.map((book) => (
                    <RecentUploadCard key={book.id} book={book} />
                ))}
            </ScrollView>
        </VStack>
    );
}
