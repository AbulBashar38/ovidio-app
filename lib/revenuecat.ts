import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "";
const REVENUECAT_ANDROID_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "";

// Plan display order and popular flag by package identifier
export const PLAN_DISPLAY_CONFIG: Record<
  string,
  { popular?: boolean; order: number }
> = {
  silver: { order: 1 },
  gold: { popular: true, order: 2 },
  platinum: { order: 3 },
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
      // console.log("✅ RevenueCat initialized");
    } catch (error) {
      console.error("❌ RevenueCat initialization failed:", error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      // console.log(offerings);

      return offerings.current;
    } catch (error) {
      console.error("❌ Failed to get offerings:", error);
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      // console.log("✅ Purchase successful:", customerInfo);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        // console.log("⚠️ User cancelled purchase");
        return null;
      }
      // console.error("❌ Purchase failed:", error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      // console.error("❌ Failed to get customer info:", error);
      return null;
    }
  }

  async restorePurchases(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      // console.log("✅ Purchases restored:", customerInfo);
      return customerInfo;
    } catch (error) {
      // console.error("❌ Restore failed:", error);
      throw error;
    }
  }

  async logIn(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      // console.log("✅ RevenueCat user logged in:", userId);
    } catch (error) {
      // console.error("❌ RevenueCat login failed:", error);
    }
  }

  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
      // console.log("✅ RevenueCat user logged out");
    } catch (error) {
      // console.error("❌ RevenueCat logout failed:", error);
    }
  }
}

export const revenueCatService = new RevenueCatService();
