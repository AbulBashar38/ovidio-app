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
        <VStack space="md">
            <Text className="text-typography-900 font-bold text-lg">
                Converting Now
            </Text>
            {jobs.map((job) => (
                <InProgressCard key={job.id} job={job} />
            ))}
        </VStack>
    );
}
