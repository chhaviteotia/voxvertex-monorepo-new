"use client";

import React, { Suspense } from "react";
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
