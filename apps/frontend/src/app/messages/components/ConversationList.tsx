"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "@/utils/timeUtils";
import {
  useGetConversationsQuery,
  useGetUnreadCountQuery,
  type Conversation,
} from "@/store/api/messagesApi";

interface ConversationListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "trainers" | "speakers" | "orgs"
  >("all");

  // Fetch conversations from API
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useGetConversationsQuery({
    filter: activeFilter,
    search: searchTerm || undefined,
    limit: 50,
  });

  // Fetch unread count
  const { data: unreadData } = useGetUnreadCountQuery();

  // Extract conversations from transformed response (no need for .data since transformResponse handles it)
  const conversations = conversationsData?.conversations || [];
  const totalUnread = unreadData?.data?.count || 0;

  // Log for debugging
  useEffect(() => {
    if (conversationsError) {
      console.error("Conversations error:", conversationsError);
    }
    if (conversationsData) {
      console.log("Conversations data:", conversationsData);
    }
  }, [conversationsError, conversationsData]);

  // Filter conversations client-side for search (backend also filters, but we do it here for instant feedback)
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;

    const searchLower = searchTerm.toLowerCase();
    return conversations.filter((conv) => {
      return (
        conv.name.toLowerCase().includes(searchLower) ||
        conv.role.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower)
      );
    });
  }, [conversations, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          {totalUnread > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
              {totalUnread} New
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "trainers", "speakers", "orgs"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === filter
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversationsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading conversations...</div>
          </div>
        ) : conversationsError ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="text-red-500 font-medium mb-2">
              Failed to load conversations
            </div>
            <div className="text-xs text-gray-500 text-center">
              {(conversationsError as any)?.data?.message ||
                (conversationsError as any)?.message ||
                "Please try refreshing the page"}
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">No conversations found</div>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isSelected =
              selectedConversation === conversation.conversationId;
            return (
              <button
                key={conversation.conversationId}
                onClick={() =>
                  onSelectConversation(conversation.conversationId)
                }
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  isSelected ? "bg-teal-50 border-l-4 border-l-teal-600" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {conversation.name}
                    </span>
                    {conversation.verified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    {conversation.unread && conversation.unread > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    {conversation.role}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 truncate">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {formatRelativeTime(conversation.timestamp)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
