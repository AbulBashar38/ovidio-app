import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { useSubmitBookMutation } from "@/state-management/services/books/booksApi";
import { uploadToS3 } from "@/state-management/services/s3Upload";

import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import {
  AlertCircle,
  CreditCard,
  FileText,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

export default function UploadScreen() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const { data: userData } = useGetUserQuery();
  const credits = userData?.user?.creditsRemaining ?? 0;

  const [submitBook] = useSubmitBookMutation();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    // 1. Upload to S3
    const s3Result = await uploadToS3({
      file: {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
      },
      onProgress: (progress) => {
        // Optional: Update progress state if you want to show a bar
      },
    });

    if (!s3Result.success || !s3Result.fileUrl) {
      setIsUploading(false);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle className="text-white font-bold">
                Upload Failed
              </ToastTitle>
              <ToastDescription className="text-white">
                {s3Result.error}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
      return;
    }

    // 2. Submit to Backend API
    try {
      await submitBook({
        pdfUrl: s3Result.fileUrl,
        originalFilename: file.name,
        backgroundAudio: true,
      }).unwrap();

      setIsUploading(false);

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast
            nativeID={"toast-" + id}
            action="success"
            variant="outline"
            className="bg-background-0 border-success-500"
          >
            <VStack space="xs">
              <ToastTitle className="text-success-500 font-bold">
                Success!
              </ToastTitle>
              <ToastDescription className="text-typography-500">
                Book submitted for processing.
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });

      setFile(null);
      router.push("/(main)/home");
    } catch (err: any) {
      setIsUploading(false);
      console.error("Book submission failed", err);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle className="text-white font-bold">
                Submission Failed
              </ToastTitle>
              <ToastDescription className="text-white">
                {err?.data?.message || "Failed to submit book."}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const estimatePages = (bytes?: number) => {
    if (!bytes) return 1;
    return Math.max(1, Math.round(bytes / (95 * 1024)));
  };

  return (
    <Box className="flex-1 bg-background-0">
      <LinearGradient
        colors={["#070A12", "#10131D", "#181719"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <MotiView
        from={{ opacity: 0.16, scale: 0.95 }}
        animate={{ opacity: 0.28, scale: 1.06 }}
        transition={{ type: "timing", duration: 5200, loop: true }}
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: 120,
          top: -80,
          right: -90,
          backgroundColor: "rgba(59,130,246,0.22)",
        }}
      />
      <MotiView
        from={{ opacity: 0.12, translateY: 0 }}
        animate={{ opacity: 0.24, translateY: -14 }}
        transition={{ type: "timing", duration: 4600, loop: true }}
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 110,
          bottom: 70,
          left: -70,
          backgroundColor: "rgba(6,182,212,0.18)",
        }}
      />

      <SafeAreaView className="flex-1">
        <VStack className="flex-1 px-6 pt-5 pb-4" space="2xl">
          <VStack space="md">
            <HStack className="items-start justify-between">
              <VStack space="xs" className="flex-1 pr-3">
                <Heading size="2xl" className="text-typography-900 font-heading">
                  Upload Book
                </Heading>
                <Text className="text-typography-500 text-base leading-relaxed">
                  Transform your PDF into expressive audio with one tap.
                </Text>
              </VStack>
              <Box
                className={`px-3 py-2 rounded-2xl border ${
                  credits > 0
                    ? "bg-primary-500/10 border-primary-500/30"
                    : "bg-error-500/10 border-error-500/25"
                }`}
              >
                <HStack className="items-center" space="xs">
                  <CreditCard
                    size={14}
                    className={credits > 0 ? "text-primary-500" : "text-error-500"}
                  />
                  <Text
                    className={
                      credits > 0
                        ? "text-primary-500 text-xs font-bold"
                        : "text-error-500 text-xs font-bold"
                    }
                  >
                    {credits} Credit{credits !== 1 ? "s" : ""}
                  </Text>
                </HStack>
              </Box>
            </HStack>

            <Box className="rounded-2xl border border-outline-100 bg-background-0 px-4 py-3">
              <HStack space="sm" className="items-center">
                <Sparkles size={14} className="text-primary-500" />
                <Text className="text-typography-600 text-xs font-medium">
                  PDF only • Up to 50MB • 1 credit per conversion
                </Text>
              </HStack>
            </Box>
          </VStack>

          <Center className="flex-1">
            {credits === 0 ? (
              <MotiView
                from={{ opacity: 0, translateY: 14 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full"
              >
                <Box className="rounded-3xl border border-outline-100 bg-background-0 px-5 py-6">
                  <VStack space="xl" className="items-center">
                    <Center className="w-20 h-20 bg-error-500/10 rounded-full">
                      <CreditCard size={36} className="text-error-500" />
                    </Center>

                    <VStack space="sm" className="items-center">
                      <Heading size="xl" className="text-typography-900 text-center">
                        No Credits Available
                      </Heading>
                      <Text className="text-typography-500 text-center text-sm leading-relaxed max-w-[280px]">
                        You need at least 1 credit before starting a conversion.
                      </Text>
                    </VStack>

                    <TouchableOpacity
                      onPress={() => router.push("/(main)/buy-credits")}
                      activeOpacity={0.9}
                      className="w-full"
                    >
                      <Box className="rounded-2xl overflow-hidden">
                        <LinearGradient
                          colors={["#3B82F6", "#1D4ED8"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ paddingVertical: 14, paddingHorizontal: 16 }}
                        >
                          <HStack className="items-center justify-center" space="sm">
                            <Sparkles size={18} color="#FFFFFF" />
                            <Text className="text-white font-bold text-base">
                              Buy Credits
                            </Text>
                          </HStack>
                        </LinearGradient>
                      </Box>
                    </TouchableOpacity>

                    <Text className="text-typography-400 text-xs text-center">
                      Starting from $2.99 • No subscription required
                    </Text>
                  </VStack>
                </Box>
              </MotiView>
            ) : !file ? (
              <TouchableOpacity
                onPress={pickDocument}
                activeOpacity={0.85}
                className="w-full rounded-3xl border-2 border-dashed border-outline-200 bg-background-0 p-7"
              >
                <VStack space="xl" className="items-center">
                  <Center className="w-20 h-20 bg-primary-500/10 rounded-full">
                    <UploadCloud size={36} className="text-primary-500" />
                  </Center>

                  <VStack space="xs" className="items-center">
                    <Heading size="md" className="text-typography-900 text-center">
                      Tap to Upload Your PDF
                    </Heading>
                    <Text className="text-typography-500 text-center text-sm">
                      Drag-and-drop style upload for your next audiobook.
                    </Text>
                  </VStack>

                  <HStack space="sm" className="items-center">
                    <Box className="bg-background-50 border border-outline-100 px-3 py-1.5 rounded-full">
                      <Text className="text-typography-500 text-xs font-medium">
                        PDF
                      </Text>
                    </Box>
                    <Box className="bg-background-50 border border-outline-100 px-3 py-1.5 rounded-full">
                      <Text className="text-typography-500 text-xs font-medium">
                        Max 50MB
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </TouchableOpacity>
            ) : (
              <VStack space="lg" className="w-full">
                <Box className="rounded-3xl border border-outline-100 bg-background-0 px-5 py-5 relative">
                  <TouchableOpacity
                    onPress={() => setFile(null)}
                    className="absolute top-3 right-3 p-2 z-10"
                  >
                    <X size={18} className="text-typography-400" />
                  </TouchableOpacity>

                  <HStack space="md" className="items-center">
                    <Center className="w-14 h-14 bg-error-500/10 rounded-2xl">
                      <FileText size={26} className="text-error-500" />
                    </Center>
                    <VStack className="flex-1 pr-8" space="xs">
                      <Text
                        className="text-typography-900 font-bold text-base"
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                      <HStack space="sm" className="items-center">
                        <Text className="text-typography-500 text-sm">
                          {formatSize(file.size)}
                        </Text>
                        <Box className="w-1 h-1 rounded-full bg-outline-300" />
                        <Text className="text-typography-500 text-sm">
                          ~{estimatePages(file.size)} pages
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>

                <Box className="bg-info-500/5 border border-info-500/20 rounded-2xl p-4">
                  <HStack space="sm" className="items-start">
                    <AlertCircle size={18} className="text-info-500 mt-0.5" />
                    <Text className="text-typography-500 text-sm flex-1 leading-relaxed">
                      AI narration starts after upload. Processing time depends on file
                      size and complexity.
                    </Text>
                  </HStack>
                </Box>

                <Button
                  variant="outline"
                  action="secondary"
                  size="lg"
                  className="h-12 rounded-2xl border-outline-300 bg-background-0"
                  onPress={pickDocument}
                >
                  <ButtonText className="text-typography-700 font-semibold">
                    Choose Different File
                  </ButtonText>
                </Button>
              </VStack>
            )}
          </Center>

          <VStack space="md">
            <Button
              size="xl"
              className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-2xl h-14"
              onPress={handleUpload}
              isDisabled={!file || isUploading || credits === 0}
            >
              {isUploading ? (
                <HStack className="items-center" space="sm">
                  <ButtonSpinner color="#FFFFFF" />
                  <ButtonText className="font-bold text-base">Uploading...</ButtonText>
                </HStack>
              ) : (
                <ButtonText className="font-bold text-base">
                  {file ? "Start Conversion" : "Select File to Continue"}
                </ButtonText>
              )}
            </Button>
            <Text className="text-typography-400 text-xs text-center">
              Your upload is securely processed and only used for conversion.
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    </Box>
  );
}
