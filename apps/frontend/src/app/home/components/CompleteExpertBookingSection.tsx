"use client";

import React from "react";
import {
  Search as SearchIcon,
  Zap,
  Calendar as CalendarIcon,
  FileText as FileTextIcon,
  Shield as ShieldIcon,
  Laptop,
  Grid3x3,
  MessageCircle,
} from "lucide-react";

export default function CompleteExpertBookingSection() {
  return (
    <section className="py-20 bg-[#F2F4F8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl mb-6 text-gray-900 tracking-tight">
              Complete Expert Booking Infrastructure
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Everything you need to discover, book, and manage expert trainers
              and speakers—all in one platform.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="text-gray-900 mb-1">
                    Verified Expert Network
                  </div>
                  <div className="text-sm text-gray-600">
                    All trainers and speakers are ID-verified with proven track
                    records
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="text-gray-900 mb-1">
                    Zero Coordination Chaos
                  </div>
                  <div className="text-sm text-gray-600">
                    Our platform handles 100% of scheduling, communication, and
                    logistics
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="text-gray-900 mb-1">Payment Protection</div>
                  <div className="text-sm text-gray-600">
                    Escrow system ensures both parties are protected throughout
                    the process
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:block">
            <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-200">
              <div className="w-full h-[400px] bg-gray-200 relative">
                {/* Placeholder for business meeting image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-gray-400 text-lg">
                    Business Meeting Image
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <SearchIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">Expert Discovery</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Browse 500+ verified trainers and speakers across 60+ skill
              categories.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">AI Matching</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Intelligent algorithm matches your requirements with the perfect
              expert.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">
              Automated Coordination
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Zero manual follow-ups. We handle all scheduling and
              communication.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileTextIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">Digital Contracts</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Automated contract generation with clear terms and digital
              signatures.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <ShieldIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">Escrow Payments</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Secure payment holding until session completion protects both
              parties.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Laptop className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">Tech Readiness</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pre-session AV checks, slide sharing, and technical support.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Grid3x3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">Unified Dashboard</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Centralized view of all your bookings, experts, and session
              analytics.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base mb-2 text-gray-900">
              Feedback & Reporting
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Post-session surveys, ratings, and detailed performance reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
