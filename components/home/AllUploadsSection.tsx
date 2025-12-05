import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Book } from "@/lib/mock-data";
import React from "react";
import { BookListItem } from "./BookListItem";

interface AllUploadsSectionProps {
    books: Book[];
}

export function AllUploadsSection({ books }: AllUploadsSectionProps) {
    if (books.length === 0) return null;

    return (
        <VStack space="md">
            <Text className="text-typography-900 font-bold text-lg">All Uploads</Text>
            <VStack space="sm" className="bg-background-50 rounded-3xl p-2">
                {books.map((book, index) => (
                    <React.Fragment key={book.id}>
                        {index > 0 && <Divider className="bg-outline-100 my-1" />}
                        <BookListItem book={book} />
                    </React.Fragment>
                ))}
            </VStack>
        </VStack>
    );
}
