"use client";

import React from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import UserDropdown from "@/components/UserDropdown";

export default function Header() {
  const { isAuthenticated, logout: authLogout } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  const displayUser = currentUserData?.user;
  const userName = displayUser?.fullName || displayUser?.firstName || displayUser?.email?.split("@")[0] || "User";
  // Show as logged in only if BOTH auth state AND user data are present
  // This prevents showing user data after logout when cookies might still exist temporarily
  const isLoggedIn = isAuthenticated && !!displayUser;

  const handleLogout = async () => {
    try {
      // Use unified logout for all user types
      await authLogout();
    } catch (error) {
      console.error("Logout error in header:", error);
      // Force logout even if there's an error
      window.location.replace("/");
    }
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 lg:py-5">
        {/* Logo and Company Name */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 order-1">
          <div
            className="overflow-hidden"
            style={{ background: "transparent", lineHeight: 0 }}
          >
            <img
              src="/voxvertex-logo.jpeg"
              alt="VoxVertex Logo"
              className="h-10 sm:h-12 lg:h-15 w-auto object-contain block"
              style={{
                background: "transparent",
                padding: 0,
                margin: 0,
                display: "block",
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".logo-text-fallback")) {
                  const textFallback = document.createElement("span");
                  textFallback.className = "logo-text-fallback text-2xl font-bold text-teal-600";
                  textFallback.textContent = "VV";
                  parent.appendChild(textFallback);
                }
              }}
            />
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden flex-1 items-center justify-center md:flex order-3 md:order-2" style={{ maxWidth: "450px" }}>
          <div className="relative w-full" style={{ maxWidth: "430px" }}>
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden items-center gap-4 xl:gap-6 lg:flex shrink-0 order-2 md:order-3">
          <Link
            href="/community"
            className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            Community
          </Link>
          <Link
            href="/marketplace"
            className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            Marketplace
          </Link>
          <Link
            href="#"
            className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="px-2 xl:px-4 text-sm xl:text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            About
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 order-2 md:order-4">
          {!isLoggedIn && (
            <>
              <Link
                href="/signup/organiser"
                className="hidden rounded-lg bg-teal-500 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-teal-600 sm:block whitespace-nowrap"
              >
                Find Experts
              </Link>
              <Link
                href="/signup/expert"
                className="hidden rounded-lg border-2 border-teal-500 bg-white px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 sm:block whitespace-nowrap"
              >
                Join as Expert
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <UserDropdown userName={userName} onLogout={handleLogout} hideHomeOption={true} />
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-orange-500 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 whitespace-nowrap"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="border-t border-gray-200 px-4 py-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search experts..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>
    </header>
  );
}
