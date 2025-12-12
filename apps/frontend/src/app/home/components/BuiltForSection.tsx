"use client";

import React from "react";
import { Building2, Rocket, TrendingUp, Users } from "lucide-react";

export default function BuiltForSection() {
  return (
    <section className="py-20 bg-[#F2F4F8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="hidden lg:block">
            <div className="rounded-lg overflow-hidden shadow-2xl border border-gray-200">
              <div className="w-full h-[500px] bg-gray-200 relative">
                {/* Placeholder for professional speaker keynote image */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-gray-400 text-lg">
                    Professional Speaker Keynote
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl mb-4 text-gray-900 tracking-tight">
              Built For
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Organizations that value quality, efficiency, and reliability
            </p>

            <div className="space-y-4">
              {/* Corporates */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base mb-1 text-gray-900">Corporates</h3>
                  <p className="text-sm text-gray-600">
                    L&D teams running training programs, leadership workshops,
                    and skill development
                  </p>
                </div>
              </div>

              {/* Startups */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base mb-1 text-gray-900">Startups</h3>
                  <p className="text-sm text-gray-600">
                    Fast-growing companies needing expert guidance for team
                    development
                  </p>
                </div>
              </div>

              {/* Accelerators */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base mb-1 text-gray-900">Accelerators</h3>
                  <p className="text-sm text-gray-600">
                    Programs seeking mentors, coaches, and speakers for cohort
                    training
                  </p>
                </div>
              </div>

              {/* HR Teams */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base mb-1 text-gray-900">HR Teams</h3>
                  <p className="text-sm text-gray-600">
                    HR departments running onboarding and training programs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
