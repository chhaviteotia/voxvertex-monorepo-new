"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth, useGetCurrentUserQuery } from "@/store/hooks";
import PostsPage from "./components/PostsPage";

export default function PostsPageRoute() {
  const { data: currentUserData } = useGetCurrentUserQuery();
  const user = currentUserData?.user;

  return (
    <ProtectedRoute redirectTo="/login">
      <PostsPage user={user || undefined} />
    </ProtectedRoute>
  );
}
