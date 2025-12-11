"use client";

import React, { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  return (
    <div className="h-full bg-[#fffbf5] flex flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Conversation List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
          <ConversationList
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </div>

        {/* Right Panel - Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <ChatWindow conversationId={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#fffbf5]">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
