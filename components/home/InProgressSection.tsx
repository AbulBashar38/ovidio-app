import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Book } from "@/lib/mock-data";
import { FileText } from "lucide-react-native";
import { MotiView } from "moti";

interface InProgressSectionProps {
    books: Book[];
}

export function InProgressSection({ books }: InProgressSectionProps) {
    if (books.length === 0) return null;

    return (
        <VStack space="md">
            <Text className="text-typography-900 font-bold text-lg">
                Converting Now
            </Text>
            {books.map((book) => (
                <MotiView
                    key={book.id}
                    from={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "timing", duration: 1000, loop: true }}
                >
                    <Box className="bg-background-50 rounded-2xl p-5 border border-outline-100 shadow-sm">
                        <HStack space="md" className="items-center mb-4">
                            <Center className="w-12 h-12 bg-primary-500/10 rounded-full">
                                <FileText size={24} className="text-primary-500" />
                            </Center>
                            <VStack className="flex-1">
                                <Text className="text-typography-900 font-bold text-lg truncate">
                                    {book.title}
                                </Text>
                                <Text className="text-typography-500 text-sm">
                                    {book.author}
                                </Text>
                            </VStack>
                            <Box className="bg-primary-500 px-3 py-1 rounded-full">
                                <Text className="text-typography-0 text-xs font-bold">
                                    {book.progress}%
                                </Text>
                            </Box>
                        </HStack>
                        <Progress
                            value={book.progress}
                            size="sm"
                            className="bg-outline-100 h-2 rounded-full"
                        >
                            <ProgressFilledTrack className="bg-primary-500 rounded-full" />
                        </Progress>
                        <Text className="text-typography-400 text-xs mt-2 text-right">
                            Generating audio...
                        </Text>
                    </Box>
                </MotiView>
            ))}
        </VStack>
    );
}
