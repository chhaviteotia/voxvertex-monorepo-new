"use client";

import React from "react";
import { Search, Zap, Users, MessageCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

/**
 * Community Page
 * Main community page for users to interact and connect
 */
export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation Bar */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo and Company Name */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              Voxvertex
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/community"
              className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
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
            <Link
              href="/signup/organiser"
              className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 sm:block"
            >
              Find Experts
            </Link>
            <Link
              href="/signup/expert"
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
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the Community
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experts, share knowledge, and grow together in our
            vibrant community of trainers, speakers, and professionals.
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature Card 1 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-4">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect with Experts
            </h3>
            <p className="text-gray-600">
              Network with trainers, speakers, and industry professionals from
              around the world.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-4">
              <MessageCircle className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Share Knowledge
            </h3>
            <p className="text-gray-600">
              Participate in discussions, share insights, and learn from the
              best in the industry.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mb-4">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Grow Together
            </h3>
            <p className="text-gray-600">
              Collaborate on projects, find opportunities, and advance your
              career with community support.
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Community Features Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            We're building amazing features to help you connect and grow. Stay
            tuned for updates!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
              Discussion Forums
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
              Expert Groups
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
              Events & Webinars
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
              Resource Library
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
