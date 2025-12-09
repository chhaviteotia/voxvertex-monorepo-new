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

interface Expert {
  id: string;
  name: string;
  initials: string;
  title: string;
  rating: number;
  reviews: number;
  sessions: number;
  description: string;
  tags: string[];
  rate: string;
  availability: "Available" | "Limited" | "Busy";
  isConnected?: boolean;
}

const mockExperts: Expert[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    initials: "PS",
    title: "Mindfulness Trainer & Wellness Expert",
    rating: 5,
    reviews: 215,
    sessions: 680,
    description:
      "Clinical psychologist and certified mindfulness instructor. Pioneering corporate wellness programs for global organizations.",
    tags: ["Mindfulness", "Stress Management", "Corporate Wellness"],
    rate: "$200/hr",
    availability: "Available",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    initials: "SJ",
    title: "Leadership Coach & Mentor",
    rating: 4.9,
    reviews: 127,
    sessions: 450,
    description:
      "15+ years of experience coaching Fortune 500 executives and high-growth startups. Specializing in transformational leadership and organizational culture.",
    tags: ["Leadership", "Team Building", "Executive Coaching"],
    rate: "$250/hr",
    availability: "Available",
    isConnected: true,
  },
  {
    id: "3",
    name: "Elena Volkov",
    initials: "EV",
    title: "Product Management Expert",
    rating: 4.9,
    reviews: 156,
    sessions: 420,
    description:
      "Led product teams at Google and startups. Passionate about building products that users love and businesses need.",
    tags: ["Product Strategy", "Agile", "User Experience"],
    rate: "$280/hr",
    availability: "Limited",
  },
  {
    id: "4",
    name: "Michael Chen",
    initials: "MC",
    title: "Tech Speaker & Innovation Consultant",
    rating: 4.8,
    reviews: 98,
    sessions: 320,
    description:
      "Technology evangelist and innovation strategist. Helping companies navigate digital transformation and emerging technologies.",
    tags: ["Technology", "Innovation", "Digital Transformation"],
    rate: "$220/hr",
    availability: "Available",
  },
  {
    id: "5",
    name: "James Rodriguez",
    initials: "JR",
    title: "Sales Trainer & Business Strategist",
    rating: 4.7,
    reviews: 89,
    sessions: 250,
    description:
      "Sales performance expert with proven track record of increasing revenue. Specializes in B2B sales strategies and team development.",
    tags: ["Sales Training", "Business Strategy", "Revenue Growth"],
    rate: "$180/hr",
    availability: "Available",
  },
  {
    id: "6",
    name: "David Kim",
    initials: "DK",
    title: "Marketing Strategist & Growth Hacker",
    rating: 4.6,
    reviews: 73,
    sessions: 190,
    description:
      "Growth marketing expert helping startups and enterprises scale through data-driven marketing strategies and innovative campaigns.",
    tags: ["Marketing", "Growth Hacking", "Digital Marketing"],
    rate: "$200/hr",
    availability: "Available",
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageExpert, setMessageExpert] = useState<Expert | null>(null);
  const voxCoinsBalance = 200;
  const connectionCost = 50;

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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-gray-100 text-gray-700";
      case "Limited":
        return "bg-yellow-50 text-yellow-700";
      case "Busy":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {mockExperts.map((expert) => (
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
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(
                      expert.availability
                    )}`}
                  >
                    {expert.availability}
                  </span>
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
