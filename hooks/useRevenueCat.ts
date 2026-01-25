import { useAppSelector } from "@/hooks/reduxHooks";
import { revenueCatService } from "@/lib/revenuecat";
import { selectUser } from "@/state-management/features/auth/userSlice";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to manage RevenueCat lifecycle with user authentication
 * Call this in a component that has access to user auth state
 */
export function useRevenueCat() {
  const user = useAppSelector(selectUser);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        if (user.id) {
          // Initialize with user ID for logged-in users
          await revenueCatService.initialize(user.id);
        } else {
          // Initialize anonymously for guests
          await revenueCatService.initialize();
        }
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize RevenueCat:", err);
        setError(err as Error);
        // Still set ready to true so the app doesn't block
        setIsReady(true);
      }
    };

    initRevenueCat();
  }, [user.id]);

  // Handle user logout - reset RevenueCat
  const handleLogout = useCallback(async () => {
    try {
      await revenueCatService.logOut();
    } catch (err) {
      console.error("Failed to logout from RevenueCat:", err);
    }
  }, []);

  return {
    isReady,
    error,
    handleLogout,
  };
}
