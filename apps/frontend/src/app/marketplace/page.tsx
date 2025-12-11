"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  UserPlus,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConnectExpertModal from "./components/ConnectExpertModal";
import SendMessageModal from "./components/SendMessageModal";
import { useGetExpertsQuery, type Expert } from "@/store/api/marketplaceApi";

export default function MarketplacePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageExpert, setMessageExpert] = useState<Expert | null>(null);
  const voxCoinsBalance = 200;
  const connectionCost = 50;

  // Fetch experts from API
  const {
    data: expertsData,
    isLoading,
    isError,
    error,
  } = useGetExpertsQuery({
    search: searchTerm || undefined,
    limit: 50,
  });

  const experts = expertsData?.data?.experts || [];

  const handleConnect = (expert: Expert) => {
    setSelectedExpert(expert);
    setIsConnectModalOpen(true);
  };

  const handleSendMessage = (expert: Expert) => {
    setMessageExpert(expert);
    setIsMessageModalOpen(true);
  };

  const handleConnectConfirm = () => {
    // TODO: Implement connection logic
    console.log("Connecting with", selectedExpert?.name);
    setIsConnectModalOpen(false);
    // Redirect to expert profile page
    if (selectedExpert) {
      router.push(`/marketplace/${selectedExpert.id}`);
    }
    setSelectedExpert(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Expert Marketplace
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Connect with verified experts across industries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Eye className="w-5 h-5" />
                <span className="font-medium">{voxCoinsBalance} VoxCoins</span>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Buy VoxCoins
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search experts by name, role, or expertise..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white">
              <option>All Categories</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white">
              <option>Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expert Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-3 text-gray-600">Loading experts...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">
                Failed to load experts. Please try again.
              </p>
              <p className="text-sm text-gray-500">
                {error && "data" in error
                  ? (error.data as any)?.message || "Unknown error"
                  : "Network error"}
              </p>
            </div>
          </div>
        ) : experts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No experts found</p>
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No experts are currently available"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full min-h-[500px]"
              >
                {/* Expert Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold shrink-0">
                      {expert.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {expert.name}
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                        {expert.isConnected && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {expert.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating and Sessions */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-red-500">★</span>
                    <span className="text-sm font-medium text-gray-900">
                      {expert.rating} ({expert.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm">{expert.sessions} sessions</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 grow">
                  {expert.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Rate and Action - Pushed to bottom */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {expert.rate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {expert.isConnected ? (
                      <button
                        onClick={() => handleSendMessage(expert)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(expert)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect Expert Modal */}
      {selectedExpert && (
        <ConnectExpertModal
          isOpen={isConnectModalOpen}
          onClose={() => {
            setIsConnectModalOpen(false);
            setSelectedExpert(null);
          }}
          expert={selectedExpert}
          voxCoinsBalance={voxCoinsBalance}
          connectionCost={connectionCost}
          onConfirm={handleConnectConfirm}
        />
      )}

      {/* Send Message Modal */}
      {messageExpert && (
        <SendMessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setMessageExpert(null);
          }}
          expert={{
            id: messageExpert.id,
            name: messageExpert.name,
            initials: messageExpert.initials,
            title: messageExpert.title,
          }}
          onSend={(message) => {
            // TODO: Implement send message logic
            console.log("Sending message to", messageExpert.name, ":", message);
            setIsMessageModalOpen(false);
            setMessageExpert(null);
          }}
        />
      )}
    </div>
  );
}
