"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, Heart, Paperclip, Send, Download } from "lucide-react";
import MessageInput from "./MessageInput";
import {
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useGetConversationByIdQuery,
  type Message,
} from "@/store/api/messagesApi";
import { useExpertAuth } from "@/store/hooks/expertAuth";

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useExpertAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation details
  const { data: conversationData } =
    useGetConversationByIdQuery(conversationId);

  // Fetch messages
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetConversationMessagesQuery({
    conversationId,
    params: { limit: 100 },
  });

  // Mutations
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Extract messages from transformed response (no need for .data since transformResponse handles it)
  const rawMessages = messagesData?.messages || [];
  const conversation = conversationData?.data?.conversation;

  // Get other participant info
  const otherParticipant = conversation?.participants?.find(
    (p) => p._id.toString() !== user?._id?.toString()
  );

  // Transform messages to ensure correct sender identification
  const messages = rawMessages.map((msg: any) => {
    // Check if message is from current user
    // Backend should set sender correctly, but we double-check here
    let isUserMessage = msg.sender === "user";

    // If backend didn't set it correctly, check by comparing sender name with current user
    if (!isUserMessage && user?.fullName && msg.senderName) {
      const currentUserName = user.fullName.trim().toLowerCase();
      const senderName = msg.senderName.trim().toLowerCase();
      isUserMessage = currentUserName === senderName;
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Message sender check:", {
        messageId: msg.id,
        backendSender: msg.sender,
        senderName: msg.senderName,
        currentUserName: user?.fullName,
        isUserMessage,
      });
    }

    return {
      ...msg,
      sender: isUserMessage ? "user" : "other",
    };
  });

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAsRead(conversationId);
    }
  }, [conversationId, messages.length, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    } catch {
      return "Just now";
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return;

    try {
      await sendMessage({
        conversationId,
        data: { content: content.trim() },
      }).unwrap();
      // Refetch messages to get the latest
      refetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (!conversation || !otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Conversation not found
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
              {otherParticipant.fullName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {otherParticipant.fullName || "Unknown"}
                </span>
                {otherParticipant.verified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {otherParticipant.professionalTitle ||
                  otherParticipant.role ||
                  ""}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#fffbf5]">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {messages.map((message) => {
                const isUser = message.sender === "user";
                const senderInitials =
                  message.senderName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U";
                const userInitials =
                  user?.fullName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U";

                return (
                  <div
                    key={message.id}
                    className={`flex w-full gap-2 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar - Left side for other messages */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                        {senderInitials}
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] ${
                        isUser ? "items-end" : "items-start"
                      } flex flex-col`}
                    >
                      {/* Sender name with avatar for other messages */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 font-medium">
                            {message.senderName}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>

                        {/* Attachments */}
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                    isUser
                                      ? "bg-white/20"
                                      : "bg-white border border-gray-300"
                                  }`}
                                >
                                  <Paperclip
                                    className={`w-4 h-4 ${
                                      isUser ? "text-white" : "text-gray-600"
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-xs font-medium truncate ${
                                        isUser ? "text-white" : "text-gray-900"
                                      }`}
                                    >
                                      {attachment.name}
                                    </p>
                                    <p
                                      className={`text-xs ${
                                        isUser
                                          ? "text-white/80"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {attachment.type} • {attachment.size}
                                    </p>
                                  </div>
                                  <button
                                    className={`p-1 rounded ${
                                      isUser
                                        ? "hover:bg-white/20"
                                        : "hover:bg-gray-100"
                                    }`}
                                  >
                                    <Download
                                      className={`w-4 h-4 ${
                                        isUser ? "text-white" : "text-gray-600"
                                      }`}
                                    />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div
                        className={`flex items-center gap-2 mt-1 ${
                          isUser ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {isUser && (
                          <>
                            {message.read ? (
                              <CheckCircle2 className="w-3 h-3 text-blue-500" />
                            ) : (
                              <div className="w-3 h-3 border border-gray-400 rounded-full" />
                            )}
                            {message.reactions &&
                              message.reactions.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                  <span className="text-xs text-gray-500">
                                    {message.reactions[0].count}
                                  </span>
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Avatar - Right side for user messages */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                        {userInitials}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
