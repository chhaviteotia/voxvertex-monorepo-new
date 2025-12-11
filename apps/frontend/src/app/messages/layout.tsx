"use client";

import { useEffect, Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function MessagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="antialiased overflow-x-hidden bg-[#fffbf5] min-h-screen">
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
        <div className="hidden lg:block">
          <Suspense
            fallback={
              <div className="fixed left-0 top-0 w-64 h-screen bg-teal-700 animate-pulse" />
            }
          >
            <Sidebar />
          </Suspense>
        </div>

        <div className="flex-1 w-full lg:ml-64 min-h-screen">
          <Header
            title="Messages"
            showMobileMenu={showMobileSidebar}
            onMobileMenuToggle={() => setShowMobileSidebar(true)}
          />

          <main className="mt-16 p-6 h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </div>
  );
}
