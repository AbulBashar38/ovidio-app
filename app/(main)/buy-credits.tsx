import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
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
import { useAppSelector } from "@/hooks/reduxHooks";
import { CREDIT_PACKAGES, revenueCatService } from "@/lib/revenuecat";
import { selectUser } from "@/state-management/features/auth/userSlice";
import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import {
  BookOpen,
  Check,
  ChevronLeft,
  CreditCard,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";

interface CreditPackageCard {
  id: string;
  credits: number;
  price: string;
  pricePerCredit: string;
  label: string;
  popular?: boolean;
  package?: PurchasesPackage;
}

export default function BuyCreditsScreen() {
  const [packages, setPackages] = useState<CreditPackageCard[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const { refetch: refetchUser } = useGetUserQuery();
  const user = useAppSelector(selectUser);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);

      // Initialize RevenueCat with user ID
      if (user.id) {
        await revenueCatService.initialize(user.id);
      }

      const offering = await revenueCatService.getOfferings();

      if (offering?.availablePackages) {
        const mappedPackages: CreditPackageCard[] = offering.availablePackages
          .map((pkg) => {
            const productId = pkg.product.identifier;
            const creditInfo = CREDIT_PACKAGES[productId];

            if (!creditInfo) return null;

            const price = pkg.product.priceString;
            const priceValue = pkg.product.price;
            const pricePerCredit = (priceValue / creditInfo.credits).toFixed(2);

            return {
              id: productId,
              credits: creditInfo.credits,
              price,
              pricePerCredit: `$${pricePerCredit}/book`,
              label: creditInfo.label,
              popular: creditInfo.popular,
              package: pkg,
            };
          })
          .filter(Boolean) as CreditPackageCard[];

        setPackages(mappedPackages.sort((a, b) => a.credits - b.credits));

        // Auto-select popular package
        const popular = mappedPackages.find((p) => p.popular);
        if (popular) {
          setSelectedPackage(popular.id);
        }
      } else {
        // Fallback mock packages for development
        setPackages([
          {
            id: "credits_1",
            credits: 1,
            price: "$2.99",
            pricePerCredit: "$2.99/book",
            label: "1 Book",
          },
          {
            id: "credits_5",
            credits: 5,
            price: "$9.99",
            pricePerCredit: "$2.00/book",
            label: "5 Books",
            popular: true,
          },
          {
            id: "credits_10",
            credits: 10,
            price: "$14.99",
            pricePerCredit: "$1.50/book",
            label: "10 Books",
          },
          {
            id: "credits_25",
            credits: 25,
            price: "$29.99",
            pricePerCredit: "$1.20/book",
            label: "25 Books",
          },
        ]);
        setSelectedPackage("credits_5");
      }
    } catch (error) {
      console.error("Failed to load offerings:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>
              Failed to load packages. Please try again.
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOfferings();
  }, [user.id]);

  const handlePurchase = async () => {
    const selected = packages.find((p) => p.id === selectedPackage);
    if (!selected?.package) {
      // Mock purchase for development
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="info" variant="solid">
            <ToastTitle>Development Mode</ToastTitle>
            <ToastDescription>
              RevenueCat not configured. This is a mock purchase.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      setIsPurchasing(true);
      const result = await revenueCatService.purchasePackage(selected.package);

      if (result) {
        // Refresh user to get updated credits
        await refetchUser();

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={id} action="success" variant="solid">
              <ToastTitle>Purchase Successful! 🎉</ToastTitle>
              <ToastDescription>
                {selected.credits} credits have been added to your account.
              </ToastDescription>
            </Toast>
          ),
        });

        router.back();
      }
    } catch (error: any) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Purchase Failed</ToastTitle>
            <ToastDescription>
              {error.message || "Something went wrong. Please try again."}
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      await revenueCatService.restorePurchases();
      await refetchUser();

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success" variant="solid">
            <ToastTitle>Restored</ToastTitle>
            <ToastDescription>
              Your purchases have been restored.
            </ToastDescription>
          </Toast>
        ),
      });
    } catch (error) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Restore Failed</ToastTitle>
            <ToastDescription>Could not restore purchases.</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackage);

  if (isLoading && packages.length === 0) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-typography-500 mt-4">Loading packages...</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadOfferings} />
          }
        >
          {/* Header */}
          <VStack className="p-6" space="lg">
            <HStack className="items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2 rounded-full active:bg-background-100"
              >
                <ChevronLeft size={28} className="text-typography-900" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRestore}>
                <Text className="text-primary-500 font-medium">Restore</Text>
              </TouchableOpacity>
            </HStack>

            {/* Hero Section */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
            >
              <VStack space="md" className="items-center mt-4">
                <Box className="w-20 h-20 bg-primary-500/10 rounded-full items-center justify-center">
                  <Sparkles size={40} className="text-primary-500" />
                </Box>
                <VStack space="xs" className="items-center">
                  <Heading
                    size="2xl"
                    className="text-typography-900 text-center"
                  >
                    Get More Credits
                  </Heading>
                  <Text className="text-typography-500 text-center text-base max-w-[280px]">
                    Convert your books to immersive audio experiences
                  </Text>
                </VStack>

                {/* Current Balance */}
                <Box className="bg-background-50 border border-outline-100 rounded-2xl px-6 py-4 mt-2">
                  <HStack space="md" className="items-center">
                    <Box className="w-10 h-10 bg-primary-500/10 rounded-full items-center justify-center">
                      <CreditCard size={20} className="text-primary-500" />
                    </Box>
                    <VStack>
                      <Text className="text-typography-500 text-xs">
                        Current Balance
                      </Text>
                      <HStack space="xs" className="items-baseline">
                        <Text className="text-typography-900 text-2xl font-bold">
                          {user.creditsRemaining}
                        </Text>
                        <Text className="text-typography-500 text-sm">
                          credits
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </MotiView>
          </VStack>

          {/* Packages */}
          <VStack className="px-6" space="md">
            <Text className="text-typography-500 font-medium text-sm uppercase tracking-wider">
              Choose a Package
            </Text>

            <VStack space="sm">
              {packages.map((pkg, index) => (
                <MotiView
                  key={pkg.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: "timing",
                    duration: 400,
                    delay: index * 100,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedPackage(pkg.id)}
                    activeOpacity={0.8}
                  >
                    <Box
                      className={`relative rounded-2xl border-2 overflow-hidden ${
                        selectedPackage === pkg.id
                          ? "border-primary-500 bg-primary-500/5"
                          : "border-outline-100 bg-background-50"
                      }`}
                    >
                      {pkg.popular && (
                        <Box className="absolute top-0 right-0">
                          <LinearGradient
                            colors={["#3B82F6", "#2563EB"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderBottomLeftRadius: 12,
                            }}
                          >
                            <HStack space="xs" className="items-center">
                              <Zap size={12} color="white" />
                              <Text className="text-white text-xs font-bold">
                                BEST VALUE
                              </Text>
                            </HStack>
                          </LinearGradient>
                        </Box>
                      )}

                      <HStack className="p-4 items-center">
                        {/* Selection Indicator */}
                        <Box
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                            selectedPackage === pkg.id
                              ? "border-primary-500 bg-primary-500"
                              : "border-outline-300"
                          }`}
                        >
                          {selectedPackage === pkg.id && (
                            <Check size={14} color="white" strokeWidth={3} />
                          )}
                        </Box>

                        {/* Icon */}
                        <Box className="w-12 h-12 bg-background-200 rounded-xl items-center justify-center mr-4">
                          <BookOpen
                            size={24}
                            className={
                              selectedPackage === pkg.id
                                ? "text-primary-500"
                                : "text-typography-500"
                            }
                          />
                        </Box>

                        {/* Info */}
                        <VStack className="flex-1">
                          <Text className="text-typography-900 font-bold text-lg">
                            {pkg.label}
                          </Text>
                          <Text className="text-typography-500 text-sm">
                            {pkg.pricePerCredit}
                          </Text>
                        </VStack>

                        {/* Price */}
                        <VStack className="items-end">
                          <Text className="text-typography-900 font-bold text-xl">
                            {pkg.price}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </TouchableOpacity>
                </MotiView>
              ))}
            </VStack>
          </VStack>

          {/* Features */}
          <VStack className="px-6 mt-8" space="md">
            <Text className="text-typography-500 font-medium text-sm uppercase tracking-wider">
              What You Get
            </Text>
            <VStack space="sm">
              {[
                "AI-powered narration with expressive voices",
                "Background music tailored to your book",
                "High-quality MP3 audio files",
                "Listen offline anytime",
              ].map((feature, i) => (
                <HStack key={i} space="sm" className="items-center">
                  <Box className="w-5 h-5 bg-success-500/10 rounded-full items-center justify-center">
                    <Check size={12} className="text-success-500" />
                  </Box>
                  <Text className="text-typography-700 text-sm flex-1">
                    {feature}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <Box className="absolute bottom-0 left-0 right-0 bg-background-0 border-t border-outline-100 p-6 pb-8">
          <Button
            size="xl"
            onPress={handlePurchase}
            disabled={!selectedPackage || isPurchasing}
            className="rounded-2xl"
          >
            {isPurchasing ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText className="font-bold text-lg">
                Buy {selectedPkg?.credits || 0} Credits for{" "}
                {selectedPkg?.price || "$0"}
              </ButtonText>
            )}
          </Button>
          <Text className="text-typography-400 text-xs text-center mt-3">
            One-time purchase • No subscription required
          </Text>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
