import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

// RevenueCat API Keys - Replace with your actual keys
const REVENUECAT_IOS_KEY = "appl_YOUR_IOS_KEY";
const REVENUECAT_ANDROID_KEY = "goog_YOUR_ANDROID_KEY";

// Credit package mapping - maps RevenueCat product IDs to credits
export const CREDIT_PACKAGES: Record<
  string,
  { credits: number; label: string; popular?: boolean }
> = {
  credits_1: { credits: 1, label: "1 Book" },
  credits_5: { credits: 5, label: "5 Books", popular: true },
  credits_10: { credits: 10, label: "10 Books" },
  credits_25: { credits: 25, label: "25 Books" },
};

class RevenueCatService {
  private initialized = false;

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey =
        Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

      Purchases.configure({ apiKey });

      if (userId) {
        await Purchases.logIn(userId);
      }

      this.initialized = true;
      console.log("✅ RevenueCat initialized");
    } catch (error) {
      console.error("❌ RevenueCat initialization failed:", error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error("❌ Failed to get offerings:", error);
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log("✅ Purchase successful:", customerInfo);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log("⚠️ User cancelled purchase");
        return null;
      }
      console.error("❌ Purchase failed:", error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error("❌ Failed to get customer info:", error);
      return null;
    }
  }

  async restorePurchases(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log("✅ Purchases restored:", customerInfo);
      return customerInfo;
    } catch (error) {
      console.error("❌ Restore failed:", error);
      throw error;
    }
  }

  async logIn(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log("✅ RevenueCat user logged in:", userId);
    } catch (error) {
      console.error("❌ RevenueCat login failed:", error);
    }
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log("✅ RevenueCat user logged out");
    } catch (error) {
      console.error("❌ RevenueCat logout failed:", error);
    }
  }
}

export const revenueCatService = new RevenueCatService();
