"use client";

import { useState } from "react";
import { Check, Building2, Crown } from "lucide-react";

export default function SubscriptionSelection({ onBack, onComplete }) {
  const [selectedTier, setSelectedTier] = useState("");

  const tiers = [
    {
      id: "starter",
      name: "Starter",
      icon: Building2,
      priceLabel: "Free",
      description: "Perfect for small teams testing the platform",
      borderColor: "border-gray-200",
      buttonColor: "border-[#2e7c6f] text-[#2e7c6f]",
      buttonSelected: "bg-[#2e7c6f] text-white",
      features: [
        "Book up to 2 experts per month",
        "Basic expert search and filters",
        "Standard booking management",
        "Email support",
        "Session history tracking",
        "Basic analytics",
      ],
      limitations: [
        "Limited to 2 bookings/month",
        "No priority support",
        "Limited search filters",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      icon: Crown,
      priceLabel: "₹999 /mo",
      description: "For growing teams with regular training needs",
      badge: "Most Popular",
      borderColor: "border-orange-300",
      buttonColor:
        "bg-gradient-to-r from-[#0f766e] to-[#0284c7] text-white rounded-full",
      buttonSelected: "bg-[#0f766e] text-white",
      features: [
        "Unlimited expert bookings",
        "AI-powered expert matching",
        "Advanced search and filters",
        "Priority booking access",
        "Dedicated account manager",
        "Advanced analytics & reporting",
        "Contract management",
        "Payment automation",
        "Multi-user access",
        "Calendar integrations",
        "Priority support",
      ],
      limitations: [],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      {/* Header */}
      <div className="pt-8 px-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-black mb-6"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-semibold text-center">Choose Your Plan</h1>
        <p className="text-center text-gray-500 mt-2">
          Select the plan that best fits your organization's needs
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-8 py-12">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isSelected = selectedTier === tier.id;

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl p-10 border shadow-md transition-all ${
                isSelected ? "shadow-lg border-[#2e7c6f]" : tier.borderColor
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm shadow">
                    {tier.badge}
                  </div>
                </div>
              )}

              {/* Icon + Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>

                <h3 className="text-xl font-semibold">{tier.name}</h3>
              </div>

              {/* Description */}
              <p className="text-gray-500 mb-6">{tier.description}</p>

              {/* Price */}
              <p className="text-4xl font-semibold mb-6">{tier.priceLabel}</p>

              {/* Button */}
              <button
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full py-3 border rounded-xl font-semibold transition ${
                  isSelected ? tier.buttonSelected : tier.buttonColor
                }`}
              >
                {isSelected ? "Selected" : "Select Plan"}
              </button>

              {/* Features */}
              <div className="mt-8">
                <p className="text-gray-700 font-semibold mb-3">
                  What's included:
                </p>

                <ul className="space-y-2">
                  {tier.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-600"
                    >
                      <Check className="w-5 h-5 text-[#2e7c6f]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              {tier.limitations.length > 0 && (
                <hr className="my-6 border-gray-200" />
              )}

              {/* Limitations */}
              {tier.limitations.length > 0 && (
                <div className="mt-6">
                  <p className="text-gray-700 font-semibold mb-3">
                    Limitations:
                  </p>

                  <ul className="space-y-2">
                    {tier.limitations.map((l, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-gray-500"
                      >
                        <span className="text-gray-400">•</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="text-center pb-16">
        <p className="text-gray-600">Need help choosing the right plan?</p>
        <button className="mt-2 text-[#2e7c6f] underline hover:no-underline">
          Contact our sales team
        </button>
      </div>

      {/* Continue Button */}
      {selectedTier && (
        <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-8">
          <button
            onClick={() => onComplete(selectedTier)}
            className="w-full bg-[#2e7c6f] text-white py-4 rounded-xl text-lg shadow hover:bg-[#25685c]"
          >
            Continue with{" "}
            {selectedTier === "starter" ? "Starter" : "Professional"}
          </button>
        </div>
      )}
    </div>
  );
}
