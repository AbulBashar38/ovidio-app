import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { BookJob } from "@/type/book";
import { InProgressCard } from "./InProgressCard";

interface InProgressSectionProps {
    jobs: BookJob[];
}

export function InProgressSection({ jobs }: InProgressSectionProps) {
    if (jobs.length === 0) return null;

    return (
        <VStack space="lg">
            <HStack className="items-center justify-between">
                <VStack>
                    <Text className="text-typography-900 font-bold text-lg">
                        Converting Now
                    </Text>
                    <Text className="text-typography-500 text-xs">
                        Live progress from current conversions
                    </Text>
                </VStack>
                <Box className="bg-primary-500/10 border border-primary-500/20 px-2.5 py-1 rounded-full">
                    <Text className="text-primary-600 text-xs font-semibold">
                        {jobs.length} Active
                    </Text>
                </Box>
            </HStack>
            {jobs.map((job) => (
                <InProgressCard key={job.id} job={job} />
            ))}
        </VStack>
    );
}
