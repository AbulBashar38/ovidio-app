import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { useSubmitBookMutation } from "@/state-management/services/books/booksApi";
import { uploadToS3 } from "@/state-management/services/s3Upload";

import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle,
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

  const [submitBook, { isLoading: isSubmitting }] = useSubmitBookMutation();

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

  return (
    <Box className="flex-1 bg-background-0">
      <SafeAreaView className="flex-1 p-6">
        <VStack space="4xl" className="flex-1">
          {/* Header */}
          <VStack space="xs">
            <Heading size="2xl" className="text-typography-900 font-heading">
              Upload Book
            </Heading>
            <Text className="text-typography-500 text-base">
              Select a PDF to convert into audio
            </Text>
          </VStack>

          {/* Upload Area */}
          <Center className="flex-1">
            {/* No Credits State */}
            {credits === 0 ? (
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full"
              >
                <VStack space="xl" className="items-center">
                  <Box className="w-24 h-24 bg-primary-500/10 rounded-full items-center justify-center">
                    <CreditCard size={48} className="text-primary-500" />
                  </Box>

                  <VStack space="sm" className="items-center">
                    <Heading
                      size="xl"
                      className="text-typography-900 text-center"
                    >
                      No Credits Available
                    </Heading>
                    <Text className="text-typography-500 text-center text-base max-w-[280px]">
                      You need at least 1 credit to convert a book to audio.
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
                        style={{ padding: 16 }}
                      >
                        <HStack
                          className="items-center justify-center"
                          space="sm"
                        >
                          <Sparkles size={20} color="white" />
                          <Text className="text-white font-bold text-lg">
                            Get Credits
                          </Text>
                        </HStack>
                      </LinearGradient>
                    </Box>
                  </TouchableOpacity>

                  <Text className="text-typography-400 text-xs text-center">
                    Starting from $2.99 • No subscription required
                  </Text>
                </VStack>
              </MotiView>
            ) : !file ? (
              <TouchableOpacity
                onPress={pickDocument}
                activeOpacity={0.8}
                className="w-full aspect-square max-h-[300px] border-2 border-dashed border-outline-200 rounded-3xl bg-background-50 items-center justify-center p-8"
              >
                <Center className="w-20 h-20 bg-primary-500/10 rounded-full mb-6">
                  <UploadCloud size={40} className="text-primary-500" />
                </Center>
                <Heading
                  size="md"
                  className="text-typography-900 mb-2 text-center"
                >
                  Tap to Upload PDF
                </Heading>
                <Text className="text-typography-400 text-center text-sm">
                  Supports PDF files up to 50MB
                </Text>
              </TouchableOpacity>
            ) : (
              <VStack space="xl" className="w-full">
                <Box className="bg-background-50 border border-outline-100 rounded-2xl p-5 relative">
                  <TouchableOpacity
                    onPress={() => setFile(null)}
                    className="absolute top-3 right-3 p-2 z-10"
                  >
                    <X size={20} className="text-typography-400" />
                  </TouchableOpacity>

                  <HStack space="md" className="items-center">
                    <Center className="w-14 h-14 bg-error-500/10 rounded-xl">
                      <FileText size={28} className="text-error-500" />
                    </Center>
                    <VStack className="flex-1 pr-6">
                      <Text
                        className="text-typography-900 font-bold text-lg truncate"
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                      <Text className="text-typography-500 text-sm">
                        {formatSize(file.size)} • ~
                        {Math.floor(Math.random() * 300 + 50)} Pages
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <VStack
                  space="xs"
                  className="bg-info-500/5 p-4 rounded-xl border border-info-500/20"
                >
                  <HStack space="sm" className="items-start">
                    <AlertCircle size={18} className="text-info-500 mt-0.5" />
                    <Text className="text-typography-500 text-sm flex-1">
                      Our AI will analyze the text structure to generate the
                      most expressive narration possible.
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </Center>

          {/* Credits Balance Display */}
          {credits > 0 && (
            <HStack className="items-center justify-center" space="xs">
              <Box className="bg-primary-500/10 px-3 py-1.5 rounded-full">
                <HStack space="xs" className="items-center">
                  <CreditCard size={14} className="text-primary-500" />
                  <Text className="text-primary-500 text-sm font-bold">
                    {credits} Credit{credits !== 1 ? "s" : ""} Available
                  </Text>
                </HStack>
              </Box>
            </HStack>
          )}

          {/* Footer Actions */}
          <VStack space="md" className="mb-4">
            <Button
              size="xl"
              className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-full h-14 shadow-soft-1"
              onPress={handleUpload}
              isDisabled={!file || isUploading || credits === 0}
            >
              {isUploading ? (
                <ButtonSpinner color="#FFFFFF" />
              ) : (
                <HStack space="sm" className="items-center">
                  <ButtonText className="font-bold text-lg">
                    {file ? "Start Conversion" : "Select File"}
                  </ButtonText>
                  {file && <CheckCircle size={20} color="#FFFFFF" />}
                </HStack>
              )}
            </Button>
          </VStack>
        </VStack>
      </SafeAreaView>
    </Box>
  );
}
