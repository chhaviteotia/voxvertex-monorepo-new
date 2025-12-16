"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Home, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";

interface UserDropdownProps {
  userName: string;
  onLogout: () => void;
  hideHomeOption?: boolean; // Hide "Go to Home Page" option when true
  userRole?: string; // Optional user role, will be fetched if not provided
}

/**
 * User Dropdown Component - Shows user name with dropdown menu
 * Contains "Profile", "Go to Home Page", and "Logout" options
 */
export default function UserDropdown({ userName, onLogout, hideHomeOption = false, userRole }: UserDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user: authUser } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();
  
  // Get user role from props, auth state, or current user data
  const role = userRole || authUser?.role || currentUserData?.user?.role;
  
  // Get profile path based on role
  const getProfilePath = (): string => {
    switch (role) {
      case "trainer":
        return "/profile/trainer";
      case "speaker":
        return "/profile/speaker";
      case "organiser":
      case "organizer":
        return "/profile/organiser";
      case "participant":
        return "/profile/participant";
      default:
        return "/profile";
    }
  };
  
  const profilePath = getProfilePath();
  
  // Hide "Go to Home Page" if already on home page or if hideHomeOption is true
  const shouldHideHome = hideHomeOption || pathname === "/";
  
  // Hide "Profile" if already on profile page
  const shouldHideProfile = pathname?.startsWith("/profile");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleProfile = () => {
    router.push(profilePath);
    setIsOpen(false);
  };

  const handleHome = () => {
    router.push("/");
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout error in dropdown:", error);
      // Force logout even if there's an error
      window.location.replace("/");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 xl:px-4 py-2 xl:py-2.5 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0"></div>
        <span className="text-xs xl:text-sm font-medium text-teal-700 whitespace-nowrap truncate max-w-[120px] xl:max-w-none">
          {userName}
        </span>
        <ChevronDown className={`w-4 h-4 text-teal-600 transition-transform shrink-0 ${isOpen ? "transform rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          {!shouldHideProfile && role && (
            <button
              onClick={handleProfile}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4 text-gray-600" />
              Profile
            </button>
          )}

          {!shouldHideHome && (
            <button
              onClick={handleHome}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-4 h-4 text-gray-600" />
              Go to Home Page
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

