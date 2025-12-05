import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { api } from "@/state-management/apiConfig";
import { useGetBookProgressQuery } from "@/state-management/services/books/booksApi";
import { BookJob, JobStep } from "@/type/book";
import { FileText } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect } from "react";

interface InProgressCardProps {
    job: BookJob;
}

const STEP_PROGRESS: Record<JobStep, number> = {
    UPLOAD_RECEIVED: 5,
    VALIDATING: 10,
    DOWNLOADING_PDF: 15,
    EXTRACTING_TEXT: 25,
    CLEANING_TEXT: 35,
    GENERATING_AUDIO: 60,
    MIXING_AUDIO: 80,
    UPLOADING_ASSETS: 90,
    FINALIZING: 95,
    COMPLETED: 100,
    ERROR: 0,
};

const STEP_LABELS: Record<JobStep, string> = {
    UPLOAD_RECEIVED: "Upload received",
    VALIDATING: "Validating file...",
    DOWNLOADING_PDF: "Processing PDF...",
    EXTRACTING_TEXT: "Reading text...",
    CLEANING_TEXT: "Preparing text...",
    GENERATING_AUDIO: "Generating audio...",
    MIXING_AUDIO: "Mixing audio...",
    UPLOADING_ASSETS: "Finalizing...",
    FINALIZING: "Almost done...",
    COMPLETED: "Ready!",
    ERROR: "Failed",
};

export function InProgressCard({ job }: InProgressCardProps) {
    const dispatch = useAppDispatch();
    const { data: progressData } = useGetBookProgressQuery(job.id, {
        pollingInterval: 30000, // Poll every 30 seconds
        skipPollingIfUnfocused: true, // Pause polling when tab is not focused
    });


    // Use progress data if available, otherwise use the job prop
    const currentStatus = progressData?.status || job.status;
    const currentStep = progressData?.currentStep || job.currentStep;
    const latestEvent = progressData?.events?.find(
        (event) => event.step === currentStep
    );
    const progress = latestEvent?.progress ?? STEP_PROGRESS[currentStep] ?? 5;
    const statusLabel = latestEvent?.message ?? STEP_LABELS[currentStep] ?? "Processing...";

    useEffect(() => {
        if (progress === 100 || currentStatus === "COMPLETED") {
            // Refetch all books to update lists
            dispatch(api.util.invalidateTags(["books"]));
        }
    }, [progress, currentStatus, dispatch]);

    return (
        <MotiView
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
                        <Text className="text-typography-900 font-bold text-lg truncate" numberOfLines={1}>
                            {job.originalFilename}
                        </Text>
                        <Text className="text-typography-500 text-sm">
                            {job.totalCharacters > 0 ? `${(job.totalCharacters / 1000).toFixed(1)}k chars` : "Processing..."}
                        </Text>
                    </VStack>
                    <Box className="bg-primary-500 px-3 py-1 rounded-full">
                        <Text className="text-typography-0 text-xs font-bold">
                            {progress}%
                        </Text>
                    </Box>
                </HStack>
                <Progress
                    value={progress}
                    size="sm"
                    className="bg-outline-100 h-2 rounded-full"
                >
                    <ProgressFilledTrack className="bg-primary-500 rounded-full" />
                </Progress>
                <Text className="text-typography-400 text-xs mt-2 text-right">
                    {statusLabel}
                </Text>
            </Box>
        </MotiView>
    );
}
