"use client";

import React from "react";
import { Search, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation Bar */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              Voxvertex
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden flex-1 items-center justify-center px-8 md:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search experts..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-600"
            >
              Community
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-600"
            >
              Marketplace
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-600"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-teal-600"
            >
              About
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:block">
              Find Experts
            </button>
            <Link
              href="/join-expert"
              className="hidden rounded-lg border-2 border-teal-500 bg-white px-4 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 sm:block"
            >
              Join as an Expert
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600"
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

      {/* Main Content Area - Can be expanded later */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Add your main content here */}
      </main>
    </div>
  );
}
