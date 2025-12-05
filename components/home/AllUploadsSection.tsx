import { Box } from "@/components/ui/box";
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
        <VStack space="md">
            <Box className="flex-row justify-between items-center">
                <Text className="text-typography-900 font-bold text-lg">
                    All Uploads
                </Text>
            </Box>
            <VStack space="sm">
                {books.map((book) => (
                    <BookListItem key={book.id} book={book} />
                ))}
            </VStack>
        </VStack>
    );
}
