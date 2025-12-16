"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MessagesPage from "./components/MessagesPage";

export default function MessagesPageRoute() {
  return (
    <ProtectedRoute redirectTo="/login">
      <MessagesPage />
    </ProtectedRoute>
  );
}
