"use client";

import React from "react";
import { FileText, Zap, Calendar, Video, Star } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#F7F5F2] to-[#F2F4F8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-lg text-center text-gray-600 mb-12">
          A structured, reliable workflow from start to finish
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary mb-2">STEP 1</div>
                <h3 className="text-lg mb-2 text-gray-900">
                  Submit Requirement Brief
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tell us your training topic, audience size, budget, and
                  preferred dates.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary mb-2">STEP 2</div>
                <h3 className="text-lg mb-2 text-gray-900">
                  AI Suggests Matched Experts
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our AI analyzes 500+ verified experts and suggests the best
                  matches instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary mb-2">STEP 3</div>
                <h3 className="text-lg mb-2 text-gray-900">
                  Voxvertex Coordinates Everything
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We handle availability checks, content customization, and all
                  communication.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary mb-2">STEP 4</div>
                <h3 className="text-lg mb-2 text-gray-900">
                  Get Contract + Escrow Payment
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Digital contract signed, payment held in escrow for security.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-md">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary mb-2">STEP 5</div>
                <h3 className="text-lg mb-2 text-gray-900">
                  Tech Checks & Session Delivery
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Pre-session AV checks, slide sharing, and smooth delivery
                  coordination.
                </p>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white shadow-md">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary mb-2">STEP 6</div>
                <h3 className="text-lg mb-2 text-gray-900">
                  Post-Session Feedback & Reports
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Collect feedback, release payment, and get session analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
