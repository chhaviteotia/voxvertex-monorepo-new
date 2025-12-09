"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, UserPlus, Check, Clock } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  initials: string;
  title: string;
  rating: number;
  reviews: number;
}

interface ConnectExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: Expert;
  voxCoinsBalance: number;
  connectionCost: number;
  onConfirm: () => void;
}

export default function ConnectExpertModal({
  isOpen,
  onClose,
  expert,
  voxCoinsBalance,
  connectionCost,
  onConfirm,
}: ConnectExpertModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const canAfford = voxCoinsBalance >= connectionCost;

  const handleConfirm = () => {
    onConfirm();
    // Redirect to expert profile page
    router.push(`/marketplace/${expert.id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 relative z-[101]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect with Expert
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Connect with {expert.name} to unlock messaging and booking features
          </p>

          {/* Expert Card - Light beige/gray background */}
          <div className="bg-[#f5f5f0] rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold shrink-0">
                {expert.initials}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{expert.name}</h3>
                <p className="text-sm text-gray-600">{expert.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-red-500">★</span>
                  <span className="text-sm text-gray-700">
                    {expert.rating} ({expert.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost and Balance - Orange/red background */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Connection Cost:
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-red-600">
                  {connectionCost}
                </span>
                <span className="text-sm text-gray-600">VoxCoins</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Your Balance:
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-gray-900">
                  {voxCoinsBalance}
                </span>
                <span className="text-sm text-gray-600">VoxCoins</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              After connecting, you will be able to:
            </h4>
            <ul className="space-y-2">
              {[
                "Send direct messages",
                "Book sessions and consultations",
                "View full availability calendar",
                "Access contact information",
                "View portfolio and testimonials",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canAfford}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                canAfford
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Connect for {connectionCost} VoxCoins
            </button>
          </div>

          {!canAfford && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Insufficient balance. Please buy more VoxCoins.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
