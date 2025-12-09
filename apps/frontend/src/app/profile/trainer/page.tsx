"use client";

import React from "react";
import TrainerProfileContent from "./components/TrainerProfileContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

/**
 * Trainer Profile Page
 * Displays comprehensive trainer profile with all sections
 * Protected route - only accessible to authenticated users
 */
export default function TrainerProfilePage() {
  return (
    <ProtectedRoute redirectTo="/login" requiredRole="trainer">
      <TrainerProfileContent />
    </ProtectedRoute>
  );
}
