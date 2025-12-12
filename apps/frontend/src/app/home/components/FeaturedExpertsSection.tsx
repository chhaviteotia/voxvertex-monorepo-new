"use client";

import React from "react";
import {
  TrendingUp,
  Star,
  Users,
  DollarSign,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function FeaturedExpertsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span className="text-sm text-secondary">Top Rated Experts</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Experts & Trainers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with industry-leading experts, speakers, and trainers
            verified by our platform. Start building meaningful professional
            relationships today.
          </p>
        </div>

        {/* Top Rated Experts */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-secondary fill-current" />
              Top Rated Experts
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Expert 1 - Dr. Priya Sharma */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer">
              <div className="text-center mb-4">
                <div className="h-16 w-16 bg-primary text-white flex items-center justify-center rounded-full mx-auto mb-3">
                  <span className="text-xl font-semibold">PS</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-semibold">
                    Dr. Priya Sharma
                  </h4>
                  <CheckCircle2 className="h-4 w-4 text-primary fill-current" />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Mindfulness Trainer & Wellness Expert
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-secondary fill-current" />
                  <span className="text-gray-900 font-medium">5.0</span>
                  <span className="text-sm text-gray-600">(215)</span>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  Mindfulness
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  Stress Management
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span>680</span>
                </div>
                <div className="flex items-center gap-1 text-gray-900">
                  <DollarSign className="h-3 w-3" />
                  <span>$200/hr</span>
                </div>
              </div>
            </div>

            {/* Expert 2 - Sarah Johnson */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer">
              <div className="text-center mb-4">
                <div className="h-16 w-16 bg-primary text-white flex items-center justify-center rounded-full mx-auto mb-3">
                  <span className="text-xl font-semibold">SJ</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-semibold">Sarah Johnson</h4>
                  <CheckCircle2 className="h-4 w-4 text-primary fill-current" />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Leadership Coach & Mentor
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-secondary fill-current" />
                  <span className="text-gray-900 font-medium">4.9</span>
                  <span className="text-sm text-gray-600">(127)</span>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  Leadership
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  Team Building
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span>450</span>
                </div>
                <div className="flex items-center gap-1 text-gray-900">
                  <DollarSign className="h-3 w-3" />
                  <span>$250/hr</span>
                </div>
              </div>
            </div>

            {/* Expert 3 - Elena Volkov */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer">
              <div className="text-center mb-4">
                <div className="h-16 w-16 bg-primary text-white flex items-center justify-center rounded-full mx-auto mb-3">
                  <span className="text-xl font-semibold">EV</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h4 className="text-gray-900 font-semibold">Elena Volkov</h4>
                  <CheckCircle2 className="h-4 w-4 text-primary fill-current" />
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Product Management Expert
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-secondary fill-current" />
                  <span className="text-gray-900 font-medium">4.9</span>
                  <span className="text-sm text-gray-600">(156)</span>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  Product Strategy
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                  Agile
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span>420</span>
                </div>
                <div className="flex items-center gap-1 text-gray-900">
                  <DollarSign className="h-3 w-3" />
                  <span>$280/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured This Week */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary fill-current" />
              Featured This Week
            </h3>
          </div>

          {/* Continuous Scroll Container */}
          <div className="relative overflow-hidden">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Scrolling Content */}
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
              {/* Dr. Priya Sharma */}
              <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer shrink-0 w-[600px]">
                <div className="flex gap-4">
                  <div className="h-20 w-20 bg-primary text-white flex items-center justify-center rounded-full shrink-0">
                    <span className="text-2xl font-semibold">PS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900 font-semibold">
                            Dr. Priya Sharma
                          </h4>
                          <CheckCircle2 className="h-4 w-4 text-primary fill-current" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Mindfulness Trainer & Wellness Expert
                        </p>
                      </div>
                      <span className="bg-secondary/20 text-secondary border border-secondary/30 px-2 py-1 rounded-full text-xs font-medium shrink-0">
                        Featured
                      </span>
                    </div>

                    {/* Rating & Location */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-secondary fill-current" />
                        <span className="text-gray-900 font-medium">5.0</span>
                        <span className="text-gray-600">(215)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>London, UK</span>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        Mindfulness
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        Stress Management
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        Corporate Wellness
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>680 sessions</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-900">
                        <DollarSign className="h-4 w-4" />
                        <span>$200/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Michael Chen */}
              <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer shrink-0 w-[600px]">
                <div className="flex gap-4">
                  <div className="h-20 w-20 bg-primary text-white flex items-center justify-center rounded-full shrink-0">
                    <span className="text-2xl font-semibold">MC</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900 font-semibold">
                            Michael Chen
                          </h4>
                          <CheckCircle2 className="h-4 w-4 text-primary fill-current" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Tech Speaker & Innovation Consultant
                        </p>
                      </div>
                      <span className="bg-secondary/20 text-secondary border border-secondary/30 px-2 py-1 rounded-full text-xs font-medium shrink-0">
                        Featured
                      </span>
                    </div>

                    {/* Rating & Location */}
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-secondary fill-current" />
                        <span className="text-gray-900 font-medium">4.8</span>
                        <span className="text-gray-600">(98)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>Singapore</span>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        AI/ML
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        Innovation
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                        Digital Transformation
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>320 sessions</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-900">
                        <DollarSign className="h-4 w-4" />
                        <span>$300/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 shadow-lg transition-all group"
          >
            Explore All Experts
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-600 mt-3">
            Browse through 500+ verified experts across all industries
          </p>
        </div>
      </div>
    </section>
  );
}
