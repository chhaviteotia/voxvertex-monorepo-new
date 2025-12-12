"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function ResourcesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl mb-2 text-gray-900 tracking-tight">
              Resources & Insights
            </h2>
            <p className="text-lg text-gray-600">
              Learn best practices and industry trends
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Resource 1 */}
          <article className="bg-[#F9FAFB] rounded-lg border border-gray-200 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all group cursor-pointer">
            {/* Image */}
            <div className="h-48 overflow-hidden bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-gray-400 text-sm">
                  Office Workspace Modern
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  L&D Best Practices
                </span>
                <span>•</span>
                <span>8 min read</span>
              </div>

              <h3 className="text-lg mb-3 text-gray-900 leading-tight">
                How to Choose the Right Trainer for Corporate L&D
              </h3>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                A comprehensive guide to evaluating trainers, matching expertise
                to needs, and ensuring ROI.
              </p>

              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:gap-3 transition-all">
                Read Article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>

          {/* Resource 2 */}
          <article className="bg-[#F9FAFB] rounded-lg border border-gray-200 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all group cursor-pointer">
            {/* Image */}
            <div className="h-48 overflow-hidden bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-gray-400 text-sm">
                  Conference Event Audience
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  Industry Insights
                </span>
                <span>•</span>
                <span>6 min read</span>
              </div>

              <h3 className="text-lg mb-3 text-gray-900 leading-tight">
                Why AI is Transforming the Events Industry
              </h3>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Discover how AI-powered matching and automation are
                revolutionizing speaker booking.
              </p>

              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:gap-3 transition-all">
                Read Article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>

          {/* Resource 3 */}
          <article className="bg-[#F9FAFB] rounded-lg border border-gray-200 overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all group cursor-pointer">
            {/* Image */}
            <div className="h-48 overflow-hidden bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-gray-400 text-sm">
                  Business Handshake Professional
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  Platform Strategy
                </span>
                <span>•</span>
                <span>7 min read</span>
              </div>

              <h3 className="text-lg mb-3 text-gray-900 leading-tight">
                Expert Booking Infrastructure: The New Standard
              </h3>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Why organizations are moving to structured, platform-based
                expert booking.
              </p>

              <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:gap-3 transition-all">
                Read Article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
