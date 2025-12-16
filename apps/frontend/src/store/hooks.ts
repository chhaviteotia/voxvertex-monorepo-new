"use client";

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "./index";
import { logout as logoutAction, fetchCurrentUser } from "./slices/authSlice";
import { logout as logoutService } from "@/services/authService";
import { baseApi } from "./api/baseApi";
import { expertBaseApi } from "./api/expertBaseApi";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Auth hook - Provides authentication state and logout functionality
 * Improved with better error handling and TypeScript
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);

  const logout = useCallback(async () => {
    try {
      // Clear Redux state FIRST to prevent refetching
      dispatch(logoutAction());
      
      // Invalidate all RTK Query cache tags to clear cached data
      dispatch(baseApi.util.invalidateTags(['User', 'Profile', 'Post', 'FeedPost', 'ExpertUser', 'ExpertProfile']));
      dispatch(expertBaseApi.util.invalidateTags(['Expert', 'ExpertProfile', 'ExpertUser']));
      
      // Reset all RTK Query caches to prevent stale data
      dispatch(baseApi.util.resetApiState());
      dispatch(expertBaseApi.util.resetApiState());
      
      // Call logout service to clear server-side cookies
      // Do this after clearing state to prevent race conditions
      try {
        await logoutService();
      } catch (serviceError) {
        console.error("Logout service error:", serviceError);
        // Continue even if service call fails - we've already cleared local state
      }
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Small delay to ensure state is cleared before reload
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force a hard reload to clear all component state, cache, and prevent refetching
      // Use window.location.replace to prevent back button navigation
      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      dispatch(logoutAction());
      dispatch(baseApi.util.invalidateTags(['User', 'Profile', 'Post', 'FeedPost', 'ExpertUser', 'ExpertProfile']));
      dispatch(expertBaseApi.util.invalidateTags(['Expert', 'ExpertProfile', 'ExpertUser']));
      dispatch(baseApi.util.resetApiState());
      dispatch(expertBaseApi.util.resetApiState());
      sessionStorage.clear();
      window.location.replace("/");
    }
  }, [dispatch]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loginStatus: auth.loginStatus,
    signupStatus: auth.signupStatus,
    loginError: auth.loginError,
    signupError: auth.signupError,
    logout,
  };
};

/**
 * Get current user query hook - Fetches user from API if not in state
 */
export const useGetCurrentUserQuery = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const fetchUserStatus = useAppSelector((state) => state.auth.fetchUserStatus);
  const fetchUserError = useAppSelector((state) => state.auth.fetchUserError);
  const isLoading = fetchUserStatus === "loading";

  // Fetch user on mount if not in state (may be authenticated via cookies)
  useEffect(() => {
    // Only fetch if:
    // 1. User is not in state
    // 2. We haven't tried fetching yet (status is idle)
    // 3. Status is not "failed" (which indicates logout)
    // Note: We don't check isAuthenticated here because cookies might be present
    // even if Redux state hasn't been updated yet (e.g., after login redirect)
    // BUT: If fetchUserStatus is "failed", it means we logged out, so don't refetch
    if (!user && fetchUserStatus === "idle" && fetchUserStatus !== "failed") {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, fetchUserStatus]);

  return {
    data: user ? { user } : null,
    isLoading,
    isError: fetchUserStatus === "failed",
    error: fetchUserError,
    refetch: () => {
      // Only refetch if authenticated
      if (isAuthenticated) {
        dispatch(fetchCurrentUser());
      }
    },
  };
};

