import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Book } from "@/lib/mock-data";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity } from "react-native";
import { RecentUploadCard } from "./RecentUploadCard";

interface RecentUploadsSectionProps {
    books: Book[];
}

export function RecentUploadsSection({ books }: RecentUploadsSectionProps) {
    if (books.length === 0) return null;

    return (
        <VStack space="md">
            <HStack className="justify-between items-center">
                <Text className="text-typography-900 font-bold text-lg">
                    Recent Uploads
                </Text>
                <TouchableOpacity onPress={() => router.push("/(main)/library")}>
                    <Text className="text-primary-500 font-medium text-sm">See All</Text>
                </TouchableOpacity>
            </HStack>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6"
            >
                <HStack space="md">
                    {books.map((book) => (
                        <RecentUploadCard key={book.id} book={book} />
                    ))}
                </HStack>
            </ScrollView>
        </VStack>
    );
}
