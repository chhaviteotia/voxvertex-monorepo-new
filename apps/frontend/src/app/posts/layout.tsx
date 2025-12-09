"use client";

import { useEffect, Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

/**
 * Posts Layout - Shared layout for posts page
 * Sidebar on left, header on top, content on right
 */
export default function PostsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="antialiased overflow-x-hidden bg-[#fffbf5] min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 bg-teal-700 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex">
        {/* Sidebar - Fixed on left, hidden on mobile */}
        <div className="hidden lg:block">
          <Suspense
            fallback={
              <div className="fixed left-0 top-0 w-64 h-screen bg-teal-700 animate-pulse" />
            }
          >
            <Sidebar />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64 min-h-screen">
          {/* Top Header Bar */}
          <Header
            title="Posts"
            showMobileMenu={showMobileSidebar}
            onMobileMenuToggle={() => setShowMobileSidebar(true)}
          />

          {/* Content with top margin for header - Full width after sidebar */}
          <main className="mt-16 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
