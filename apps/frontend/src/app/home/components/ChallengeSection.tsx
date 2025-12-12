"use client";

import React from "react";
import { MessageSquare, Database, DollarSign, FileX } from "lucide-react";

export default function ChallengeSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          The Challenge
        </h2>
        <p className="text-lg text-center text-gray-600 mb-12">
          Finding and coordinating with the right trainers shouldn't be this
          complicated
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-[#F9FAFB] rounded-lg p-8 border border-gray-200 hover:border-teal-500/30 hover:shadow-lg transition-all min-h-[180px]">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Manual Coordination
            </h3>
            <p className="text-gray-600">
              Endless back-and-forth messages trying to align schedules and
              requirements
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#F9FAFB] rounded-lg p-8 border border-gray-200 hover:border-teal-500/30 hover:shadow-lg transition-all min-h-[180px]">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Verified Database
            </h3>
            <p className="text-gray-600">
              Struggling to find qualified trainers without a structured,
              verified source
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#F9FAFB] rounded-lg p-8 border border-gray-200 hover:border-teal-500/30 hover:shadow-lg transition-all min-h-[180px]">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pricing Uncertainty
            </h3>
            <p className="text-gray-600">
              Last-minute changes and unclear pricing causing budget and
              planning issues
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#F9FAFB] rounded-lg p-8 border border-gray-200 hover:border-teal-500/30 hover:shadow-lg transition-all min-h-[180px]">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <FileX className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Contract Risks
            </h3>
            <p className="text-gray-600">
              Manual contracts and payment handling leading to disputes and
              delays
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
