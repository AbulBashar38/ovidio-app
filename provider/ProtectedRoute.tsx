import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { selectAuth } from "@/state-management/features/auth/authSlice";
import { selectUser, setUser } from "@/state-management/features/auth/userSlice";
import { useGetUserQuery } from "@/state-management/services/auth/authApi";
import { router, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);

  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useAppDispatch();

  // Fetch user data if we have a token but no user ID
  const { data: userData, isLoading: isUserLoading } = useGetUserQuery(undefined, {
    skip: !token || !!user.id,
  });

  useEffect(() => {
    if (userData?.user) {
      dispatch(setUser(userData.user));
    }
  }, [userData, dispatch]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inVerifyEmail = segments[1] === "verify-email";

    if (!token && !inAuthGroup) {
      // If not authenticated and not in auth group, redirect to login
      router.replace("/(auth)/login");
    } else if (token) {
      // User is authenticated

      // Check if email is verified
      const isEmailVerified = !!user.emailVerifiedAt;

      if (!isEmailVerified) {
        // If email not verified, and not already on verify-email page, redirect there
        if (!inVerifyEmail) {
          router.replace("/(auth)/verify-email");
        }
      } else if (inAuthGroup) {
        // If email IS verified, but trying to access auth pages (login/register/verify-email), redirect to home
        router.replace("/(main)/home");
      }
    }
  }, [token, segments, isMounted, user.emailVerifiedAt]);

  // If not mounted, show loader to prevent flashes
  if (!isMounted || (token && !user.id && isUserLoading)) {
    // While checking, redirecting, or fetching user data, show nothing or a spinner
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#181719" }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return <>{children}</>;
}
