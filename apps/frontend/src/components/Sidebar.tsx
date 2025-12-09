"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  MessageCircle,
  Calendar,
  FileText,
  Wallet,
  AlertCircle,
  Video,
  Brain,
  Settings,
  Bell,
  LogOut,
  SquarePen,
  BookOpen,
} from "lucide-react";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import { useGetCurrentExpertQuery } from "@/store/api/expertApi";

/**
 * Sidebar Component
 * Matches the dark teal design from the trainer profile UI
 */
export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useExpertAuth();
  const { data: currentUserData } = useGetCurrentExpertQuery();

  const currentPath = pathname || "/";

  // Get user details
  const userDetails = {
    name: user?.fullName || currentUserData?.user?.fullName || "Trainer",
    role: user?.role || currentUserData?.user?.role || "trainer",
  };

  // Navigation items matching the UI design
  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      active: currentPath === "/dashboard",
      disabled: true, // Dashboard not implemented yet
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile/trainer",
      active:
        currentPath === "/profile/trainer" ||
        currentPath.startsWith("/profile/trainer"),
    },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "/messages",
      active:
        currentPath === "/messages" || currentPath.startsWith("/messages"),
      badge: 2, // Unread messages count
    },
    {
      icon: Calendar,
      label: "Bookings",
      href: "/booking",
      active: currentPath === "/booking" || currentPath.startsWith("/booking"),
    },
    {
      icon: FileText,
      label: "Documents",
      href: "/documents",
      active:
        currentPath === "/documents" || currentPath.startsWith("/documents"),
    },
    {
      icon: Wallet,
      label: "Payments",
      href: "/payments",
      active:
        currentPath === "/payments" || currentPath.startsWith("/payments"),
    },
    {
      icon: AlertCircle,
      label: "Disputes",
      href: "/dispute",
      active: currentPath === "/dispute" || currentPath.startsWith("/dispute"),
    },
    {
      icon: Video,
      label: "Sessions",
      href: "/sessions",
      active:
        currentPath === "/sessions" || currentPath.startsWith("/sessions"),
    },
    {
      icon: Brain,
      label: "AI Tech Readiness",
      href: "/readiness_testing/trainer",
      active: currentPath.startsWith("/readiness_testing"),
    },
    {
      icon: SquarePen,
      label: "Post",
      href: "/posts",
      active: currentPath === "/posts" || currentPath.startsWith("/posts"),
    },
    {
      icon: BookOpen,
      label: "Resources",
      href: "/resources",
      active:
        currentPath === "/resources" || currentPath.startsWith("/resources"),
    },
  ];

  const handleNavigation = (href: string, disabled?: boolean) => {
    if (!disabled && href) {
      router.push(href);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    return userDetails.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-teal-700 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-teal-600">
        <h2 className="text-white text-xl font-bold">Voxvertex</h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.active;
            const isDisabled = item.disabled;

            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.href, isDisabled)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : isDisabled
                    ? "text-teal-300/50 cursor-not-allowed"
                    : "text-teal-100 hover:bg-teal-600/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-teal-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {userDetails.name}
            </p>
            <p className="text-teal-200 text-xs truncate">
              Expert {userDetails.role === "trainer" ? "Trainer" : "Speaker"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
