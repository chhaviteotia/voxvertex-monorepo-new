"use client";

import React from "react";
import PostsPage from "./components/PostsPage";
import { useExpertAuth } from "@/store/hooks/expertAuth";

export default function PostsPageRoute() {
  const { user } = useExpertAuth();

  // Handle case where user might not be loaded yet or API fails
  // PostsPage will handle undefined user gracefully
  return <PostsPage user={user || undefined} />;
}
