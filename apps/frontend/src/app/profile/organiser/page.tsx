"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

/**
 * Organiser Profile Page
 * Placeholder page - can be built out later with organiser-specific sections
 */
export default function OrganiserProfilePage() {
  return (
    <ProtectedRoute requiredRole="organiser">
      <div className="min-h-screen bg-[#fffbf5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Organiser Profile
            </h1>
            <p className="text-gray-600">
              Welcome to your organiser profile page. This page will be built
              out with organiser-specific features soon.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
