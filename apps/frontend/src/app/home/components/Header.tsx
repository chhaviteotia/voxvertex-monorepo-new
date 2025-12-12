"use client";

import React from "react";
import { Search } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
        {/* Logo and Company Name */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div
            className="overflow-hidden"
            style={{ background: "transparent", lineHeight: 0 }}
          >
            <img
              src="/voxvertex-logo.png"
              alt="VoxVertex Logo"
              className="h-15 w-auto object-contain block"
              style={{
                background: "transparent",
                padding: 0,
                margin: 0,
                display: "block",
              }}
            />
          </div>
          <span className="text-xl font-semibold text-gray-800">Voxvertex</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden flex-1 items-center justify-center md:flex" style={{ maxWidth: "380px" }}>
          <div className="relative w-full" style={{ maxWidth: "360px" }}>
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Navigation Links - Between Search and Buttons */}
        <nav
          className="hidden items-center gap-6 lg:flex shrink-0"
          style={{ marginLeft: "-60px" }}
        >
          <Link
            href="/community"
            className="px-4 text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            Community
          </Link>
          <Link
            href="/marketplace"
            className="px-4 text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            Marketplace
          </Link>
          <Link
            href="#"
            className="px-4 text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="px-4 text-base font-medium text-gray-700 transition-colors hover:text-teal-600 whitespace-nowrap"
          >
            About
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/signup/organiser"
            className="hidden rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-600 sm:block whitespace-nowrap"
          >
            Find Experts
          </Link>
          <Link
            href="/signup/expert"
            className="hidden rounded-lg border-2 border-teal-500 bg-white px-5 py-2.5 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 sm:block whitespace-nowrap"
          >
            Join as an Expert
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 whitespace-nowrap"
          >
            Login
          </Link>
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
