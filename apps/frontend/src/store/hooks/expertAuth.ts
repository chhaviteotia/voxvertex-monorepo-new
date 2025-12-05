"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useGetCurrentExpertQuery,
  useLogoutExpertMutation,
  useCheckExpertAuthStatusQuery,
} from "../api/expertApi";

/**
 * Expert Auth Hook - Provides expert authentication state and functionality
 * Completely separate from existing auth system
 */
export const useExpertAuth = () => {
  const router = useRouter();
  const { data: currentUserData, isLoading, isError } = useGetCurrentExpertQuery();
  const [logoutExpert, { isLoading: isLoggingOut }] = useLogoutExpertMutation();

  const logout = useCallback(async () => {
    try {
      await logoutExpert().unwrap();
      router.push("/");
    } catch (error) {
      console.error("Expert logout error:", error);
      // Even if logout fails, redirect to home
      router.push("/");
    }
  }, [logoutExpert, router]);

  return {
    user: currentUserData?.user,
    isAuthenticated: !!currentUserData?.user,
    isLoading,
    isError,
    logout,
    isLoggingOut,
  };
};

/**
 * Check Expert Authentication Status
 */
export const useExpertAuthStatus = () => {
  const { data, isLoading, isError } = useCheckExpertAuthStatusQuery();

  return {
    isAuthenticated: data?.isAuthenticated || false,
    user: data?.user,
    isLoading,
    isError,
  };
};

