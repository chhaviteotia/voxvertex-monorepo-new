"use client";

import { useRouter } from "next/navigation";
import { Bell, Settings, Menu } from "lucide-react";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  title?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

/**
 * Header Component
 * Common header with notification, settings, and user dropdown
 */
export default function Header({
  title = "Profile",
  showMobileMenu = false,
  onMobileMenuToggle,
}: HeaderProps) {
  const router = useRouter();
  const { logout: authLogout, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  const displayUser = currentUserData?.user;
  const userName = displayUser?.fullName || displayUser?.firstName || displayUser?.email?.split("@")[0] || "User";
  // Show as logged in if user data is present (cookies might be set even if Redux state isn't updated yet)
  const isLoggedIn = !!displayUser || isAuthenticated;

  const handleLogout = async () => {
    // Use unified logout for all user types
    await authLogout();
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left Side - Mobile Menu and Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Title */}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      {/* Right Side - Icons: Bell, Settings, User Dropdown */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notification Bell with Orange Badge */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-teal-500" />
          {/* Orange Notification Badge */}
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Settings Gear Icon */}
        <button
          onClick={() => router.push("/settings")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-teal-500" />
        </button>

        {/* User Dropdown */}
        {isLoggedIn && (
          <UserDropdown userName={userName} onLogout={handleLogout} />
        )}
      </div>
    </header>
  );
}
