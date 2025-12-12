"use client";

import React from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent/80 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Badge */}
            <div className="inline-block rounded-lg bg-gray-200/30 backdrop-blur-sm px-4 py-1.5 mb-6">
              <span className="text-sm font-medium text-white">
                Trusted by 200+ Organizations
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find & book the right speaker or trainer in minutes
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
              AI-powered discovery, matching, coordination, contracts, and
              secure payments for your events and L&D programs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/marketplace"
                className="rounded-lg bg-white px-6 py-3 text-base font-medium text-teal-600 transition-colors hover:bg-gray-50 flex items-center gap-2"
              >
                Find Experts
                <span>→</span>
              </Link>
              <Link
                href="/signup/expert"
                className="rounded-lg bg-teal-600 border-2 border-white px-6 py-3 text-base font-medium text-white transition-colors hover:bg-teal-700"
              >
                Join as an Expert
              </Link>
            </div>

            {/* Bullet Points */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white shrink-0" />
                <span className="text-base">
                  AI-powered matching with 500+ verified experts
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white shrink-0" />
                <span className="text-base">
                  End-to-end workflow automation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-white shrink-0" />
                <span className="text-base">
                  Secure escrow payment protection
                </span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gray-200 relative">
                {/* Placeholder for training image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-gray-400 text-lg">
                    Training Session Image
                  </span>
                </div>
              </div>
              {/* Time Saved Badge */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg px-4 py-2 shadow-lg">
                <div className="text-2xl font-bold text-teal-500">70%</div>
                <div className="text-xs text-gray-500">Time Saved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
