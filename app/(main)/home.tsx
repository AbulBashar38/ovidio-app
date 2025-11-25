import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import React from "react";

export default function HomeScreen() {
  return (
    <Box className="flex-1 bg-background-950">
      <Center className="flex-1">
        <Text className="text-typography-0">Home Screen</Text>
      </Center>
    </Box>
  );
}
