import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

export function HomeSkeleton() {
    return (
        <VStack space="4xl" className="p-6">
            {/* Header Skeleton */}
            <HStack className="justify-between items-end">
                <VStack space="xs" className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-8 w-40" />
                </VStack>
                <Skeleton variant="circular" className="w-12 h-12" />
            </HStack>

            {/* In Progress Section Skeleton */}
            <VStack space="md">
                <Skeleton className="h-6 w-32" />
                <Box className="bg-background-50 rounded-2xl p-5 border border-outline-100">
                    <HStack space="md" className="items-center mb-4">
                        <Skeleton variant="circular" className="w-12 h-12" />
                        <VStack className="flex-1 gap-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </VStack>
                    </HStack>
                    <Skeleton className="h-2 rounded-full mb-2" />
                    <Skeleton className="h-3 w-20 self-end" />
                </Box>
            </VStack>

            {/* Recent Uploads Skeleton */}
            <VStack space="md">
                <HStack className="justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-16" />
                </HStack>
                <HStack space="md">
                    <Skeleton className="w-40 h-56 rounded-2xl" />
                    <Skeleton className="w-40 h-56 rounded-2xl" />
                </HStack>
            </VStack>
        </VStack>
    );
}
