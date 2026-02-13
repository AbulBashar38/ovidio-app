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
import { PLAN_DISPLAY_CONFIG, revenueCatService } from "@/lib/revenuecat";
import { selectUser } from "@/state-management/features/auth/userSlice";
import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import {
  useCheckRevenueCatSubscriptionQuery,
  useGetPlansQuery,
  useGetRevenueCatActiveSubscriptionsQuery,
  useGetRevenueCatSubscriberQuery,
} from "@/state-management/services/billing/billingApi";
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

interface SubscriptionPlanCard {
  id: string;
  label: string;
  tier: string;
  price: string;
  period: string;
  description: string;
  booksIncluded: number;
  popular?: boolean;
  order: number;
  package?: PurchasesPackage;
}

export default function BuyCreditsScreen() {
  const [packages, setPackages] = useState<SubscriptionPlanCard[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const { refetch: refetchUser } = useGetUserQuery();
  const user = useAppSelector(selectUser);

  // Fetch plans from API
  const {
    data: plansData,
    isLoading: isPlansLoading,
    refetch: refetchPlans,
  } = useGetPlansQuery();

  // RevenueCat API queries
  const { data: subscriberData, error: subscriberError } =
    useGetRevenueCatSubscriberQuery();
  const { data: subscriptionCheck, error: subscriptionCheckError } =
    useCheckRevenueCatSubscriptionQuery();
  const { data: activeSubscriptions, error: activeSubscriptionsError } =
    useGetRevenueCatActiveSubscriptionsQuery();

  // Console log RevenueCat API results
  useEffect(() => {
    console.log("=== RevenueCat API Results ===");
    console.log("Subscriber Data:", JSON.stringify(subscriberData, null, 2));
    console.log("Subscriber Error:", subscriberError);
    console.log(
      "Subscription Check:",
      JSON.stringify(subscriptionCheck, null, 2),
    );
    console.log("Subscription Check Error:", subscriptionCheckError);
    console.log(
      "Active Subscriptions:",
      JSON.stringify(activeSubscriptions, null, 2),
    );
    console.log("Active Subscriptions Error:", activeSubscriptionsError);
    console.log("==============================");
  }, [
    subscriberData,
    subscriberError,
    subscriptionCheck,
    subscriptionCheckError,
    activeSubscriptions,
    activeSubscriptionsError,
  ]);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);

      // Initialize RevenueCat with user ID
      if (user.id) {
        await revenueCatService.initialize(user.id);
      }

      const offering = await revenueCatService.getOfferings();
      console.log("RevenueCat Offering:", JSON.stringify(offering, null, 2));

      if (offering?.availablePackages && plansData?.plans) {
        const mappedPackages: SubscriptionPlanCard[] =
          offering.availablePackages
            .map((pkg) => {
              const packageId = pkg.identifier; // "silver", "gold", "platinum"
              const apiPlan = plansData.plans.find((p) => p.id === packageId);
              const displayConfig = PLAN_DISPLAY_CONFIG[packageId];

              if (!apiPlan || !displayConfig) {
                console.log(
                  "No matching API plan or display config for:",
                  packageId,
                );
                return null;
              }

              const price = pkg.product.priceString;
              const period =
                pkg.product.subscriptionPeriod === "P1M" ? "/mo" : "";

              return {
                id: packageId,
                label: apiPlan.name,
                tier: packageId,
                price,
                period,
                description: apiPlan.description || "",
                booksIncluded: apiPlan.booksIncluded,
                popular: displayConfig.popular,
                order: displayConfig.order,
                package: pkg,
              };
            })
            .filter(Boolean) as SubscriptionPlanCard[];

        setPackages(mappedPackages.sort((a, b) => a.order - b.order));

        // Auto-select popular package
        const popular = mappedPackages.find((p) => p.popular);
        if (popular) {
          setSelectedPackage(popular.id);
        } else if (mappedPackages.length > 0) {
          setSelectedPackage(mappedPackages[0].id);
        }
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
    if (!isPlansLoading) {
      loadOfferings();
    }
  }, [user.id, plansData, isPlansLoading]);

  const handlePurchase = async () => {
    const selected = packages.find((p) => p.id === selectedPackage);
    if (!selected?.package) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="info" variant="solid">
            <ToastTitle>No Package Selected</ToastTitle>
            <ToastDescription>
              Please select a plan to continue.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    try {
      setIsPurchasing(true);
      const result = await revenueCatService.purchasePackage(selected.package);
      console.log("Purchase result:", result);

      if (result) {
        // Refresh user to get updated subscription
        await refetchUser();

        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={id} action="success" variant="solid">
              <ToastTitle>Purchase Successful!</ToastTitle>
              <ToastDescription>
                You are now subscribed to the {selected.label} plan.
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                refetchPlans();
                loadOfferings();
              }}
            />
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
                    Choose Your Plan
                  </Heading>
                  <Text className="text-typography-500 text-center text-base max-w-[280px]">
                    Subscribe to convert your books into immersive audio
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
              Choose a Plan
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
                            {pkg.booksIncluded} books/month
                          </Text>
                        </VStack>

                        {/* Price */}
                        <VStack className="items-end">
                          <Text className="text-typography-900 font-bold text-xl">
                            {pkg.price}
                          </Text>
                          {pkg.period ? (
                            <Text className="text-typography-500 text-xs">
                              {pkg.period}
                            </Text>
                          ) : null}
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
                Subscribe
                {/* to {selectedPkg?.label || "Plan"} for{" "}
                {selectedPkg?.price || "$0"}
                {selectedPkg?.period || ""} */}
              </ButtonText>
            )}
          </Button>
          <Text className="text-typography-400 text-xs text-center mt-3">
            Cancel anytime from your device settings
          </Text>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
