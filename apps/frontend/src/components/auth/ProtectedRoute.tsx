"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExpertAuth } from "@/store/hooks/expertAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string | string[]; // Role(s) required to access this route
}

/**
 * Protected Route Component
 * Protects routes that require authentication
 * Optionally checks for specific role(s)
 * Redirects to login if user is not authenticated
 * Redirects to dashboard if role doesn't match
 */
export default function ProtectedRoute({
  children,
  redirectTo = "/login",
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useExpertAuth();

  useEffect(() => {
    // Only check if we're done loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role if required
    if (requiredRole && user) {
      const userRole = user.role;
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      if (!allowedRoles.includes(userRole)) {
        // Redirect to dashboard if role doesn't match
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbf5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check role if required
  if (requiredRole && user) {
    const userRole = user.role;
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      return null; // Will redirect in useEffect
    }
  }

  // Render children if authenticated and role matches (if required)
  return <>{children}</>;
}
