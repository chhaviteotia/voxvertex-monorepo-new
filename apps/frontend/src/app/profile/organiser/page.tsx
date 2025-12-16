"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import dynamic from "next/dynamic";
import AboutUser from "../components/sections/AboutUser";
import WorkExperience from "../components/sections/WorkExperience";
import Education from "../components/sections/Education";
import AwardsAndCertifications from "../components/sections/AwardsAndCertifications";
import FeaturedVideos from "../components/sections/FeaturedVideos";
import Reviews from "../components/sections/Reviews";

// Dynamic imports matching the speaker profile structure
const Posts = dynamic(() => import("../components/sections/Posts/index"), {
  loading: () => (
    <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
  ),
  ssr: false,
});

/**
 * Organiser Profile Page - Uses shared components with speaker profile
 * Displays all profile sections in order:
 * AboutUser -> Posts -> WorkExperience -> Education ->
 * AwardsAndCertifications -> FeaturedVideos -> Reviews
 */
export default function OrganiserProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: currentUserData, isLoading } = useGetCurrentUserQuery();

  useEffect(() => {
    // Only redirect if we've finished loading and there's no user data
    // Give it time for auth state to update after login
    if (!isLoading && !isAuthenticated && !currentUserData?.user) {
      // Add a small delay to allow auth state to update after login redirect
      const timer = setTimeout(() => {
        if (!isAuthenticated && !currentUserData?.user) {
          router.push("/login");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, currentUserData, router]);

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

  if (!isAuthenticated && !currentUserData?.user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-between gap-5 px-0">
      <Suspense
        fallback={
          <div className="bg-white py-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <AboutUser />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <Posts />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <WorkExperience />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <Education />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <AwardsAndCertifications />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <FeaturedVideos />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white p-6 animate-pulse h-64 rounded-lg"></div>
        }
      >
        <Reviews />
      </Suspense>
    </main>
  );
}
