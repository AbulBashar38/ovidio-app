import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookJob } from "@/type/book";
import { BookListItem } from "./BookListItem";

interface AllUploadsSectionProps {
    books: BookJob[];
}

export function AllUploadsSection({ books }: AllUploadsSectionProps) {
    if (books.length === 0) return null;

    return (
        <VStack space="lg">
            <HStack className="justify-between items-end">
                <VStack>
                    <Text className="text-typography-900 font-bold text-lg">
                        All Uploads
                    </Text>
                    <Text className="text-typography-500 text-xs">
                        Every upload and conversion status
                    </Text>
                </VStack>
                <Box className="px-2.5 py-1 rounded-full bg-background-100 border border-outline-200">
                    <Text className="text-typography-600 text-xs font-semibold">
                        {books.length} total
                    </Text>
                </Box>
            </HStack>
            <VStack space="sm">
                {books.map((book) => (
                    <BookListItem key={book.id} book={book} />
                ))}
            </VStack>
        </VStack>
    );
}
