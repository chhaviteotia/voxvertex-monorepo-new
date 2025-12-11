"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Speaker Profile Layout - Matches backup code structure
 * Includes UnifiedHeader and Sidebar for speaker profile pages
 */
export default function SpeakerProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure page always starts from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Authentication hooks
  const { user } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  const contentWrapperClasses =
    "ml-0 sm:ml-[18rem] md:ml-[19.5rem] lg:ml-[21.5rem] mr-0 sm:mr-[2.5rem] md:mr-[3rem] lg:mr-[3.5rem]";

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden bg-[#fffbf5]`}
    >
      {/* Background cover to prevent content showing behind header - only covers content area, not sidebar */}
      <div className="fixed top-0 left-[264px] sm:left-[304px] md:left-[312px] right-0 h-20 sm:h-24 md:h-28 lg:h-32 bg-[#fffbf5] z-99 pointer-events-none"></div>

      <Suspense
        fallback={
          <div className="h-32 bg-white border-b border-gray-200 animate-pulse p-3 fixed"></div>
        }
      >
        <UnifiedHeader
          variant="authenticated"
          user={user}
          currentUserData={currentUserData}
        />
      </Suspense>

      <div className="flex flex-col lg:flex-row min-h-screen gap-10">
        <Suspense
          fallback={
            <div className="w-64 bg-gray-100 animate-pulse h-screen"></div>
          }
        >
          <Sidebar />
        </Suspense>

        <div className="w-full bg-[#fffbf5] mt-20 sm:mt-24 md:mt-28 lg:mt-32">
          <div className={contentWrapperClasses}>{children}</div>
        </div>
      </div>
    </div>
  );
}
