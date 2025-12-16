"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Box from "./components/box";

const Page = () => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 lg:space-y-10">

        {/* Header */}
        <div>
          <p className="text-3xl font-semibold text-gray-900">
            AI Tech Readiness Assessment
          </p>
          <p className="text-gray-600 mt-2">
            Evaluate and improve your technology readiness for AI-powered training delivery
          </p>
        </div>

        {/* Overall Tech Readiness */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#f5fbf9] to-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-[80%]">
              <p className="text-lg font-semibold text-gray-900">
                Overall Tech Readiness
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Based on equipment, tools, and digital skills
              </p>

              <div className="h-3 w-full bg-[#e5f2ee] rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-[#4A9B8E] rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#4A9B8E] text-white text-xl font-semibold shadow-lg">
              78%
            </div>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Box
  title="Video Setup"
  subtitle="Camera, lighting, audio"
  percentage="75%"
  barWidth="w-[75%]"
  barColor="bg-[#4A9B8E]" // dynamically change the bar color
  iconBg="bg-green-600"
/>
<Box
  title="AI Tools Proficiency"
  subtitle="ChatGPT, AI assistants"
  percentage="75%"
  barWidth="w-[75%]"
  barColor="bg-[#4A9B8E]" // dynamically change the bar color
  iconBg="bg-yellow-500"
/>
<Box
  title="Digital Content"
  subtitle="Presentation tools, LMS"
  percentage="75%"
  barWidth="w-[75%]"
  barColor="bg-[#4A9B8E]" // dynamically change the bar color
  iconBg="bg-purple-200"
/>
<Box
  title="Tech Troubleshooting"
  subtitle="Problem solving skills"
  percentage="75%"
  barWidth="w-[75%]"
  barColor="bg-[#4A9B8E]" // dynamically change the bar color
  iconBg="bg-red-500"
/>


        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <p className="text-xl font-semibold text-gray-900">
            Recommendations to Improve
          </p>

          <div className="rounded-2xl border border-[#bfe3dc] bg-gradient-to-r from-[#f5fbf9] to-white p-6">
            <p className="font-semibold text-gray-900">
              Complete AI Tools Training
            </p>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Learn how to leverage AI assistants for session preparation and content creation
            </p>
            <button className="bg-[#4A9B8E] text-white px-5 py-2 rounded-xl">
              Start Training
            </button>
          </div>

          <div className="rounded-2xl border border-[#d8cfee] bg-white p-6">
            <p className="font-semibold text-gray-900">
              Upgrade Video Equipment
            </p>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Invest in better lighting and microphone for professional quality sessions
            </p>
            <button className="border border-gray-300 px-5 py-2 rounded-xl text-gray-700">
              View Guide
            </button>
          </div>
        </div>
    </div>
  );
};

export default function TechReadinessPage() {
  return (
    <ProtectedRoute redirectTo="/login">
      <Page />
    </ProtectedRoute>
  );
}
