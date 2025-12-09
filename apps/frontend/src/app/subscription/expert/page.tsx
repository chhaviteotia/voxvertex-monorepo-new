"use client";

import { useState, useEffect } from "react";
import { Check, User, Zap, Rocket, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterExpertMutation } from "@/store/api/expertApi";
import { toast } from "react-hot-toast";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  role: "speaker" | "trainer" | "";
  country: string;
  city: string;
  industry: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export default function ExpertSubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const [registerExpert, { isLoading: isRegistering }] =
    useRegisterExpertMutation();

  // Load form data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("expertSignupData");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setFormData({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "",
            country: data.country || "",
            city: data.city || "",
            industry: data.industry || "",
            isEmailVerified: data.isEmailVerified || false,
            isPhoneVerified: data.isPhoneVerified || false,
          });
        } catch (error) {
          console.error("Error loading form data:", error);
          router.push("/signup/expert");
        }
      } else {
        router.push("/signup/expert");
      }
    }
  }, [router]);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: User,
      commission: "10% commission",
      description: "Get started and build your reputation",
      price: "Free",
      priceLabel: "Free",
      buttonStyle: "border-teal-500 text-teal-600 bg-white hover:bg-teal-50",
      features: [
        "Accept up to 5 bookings per month",
        "Basic profile visibility",
        "Standard booking tools",
        "Email notifications",
        "Basic calendar management",
        "Client reviews & ratings",
      ],
      limitations: [
        "10% platform commission",
        "Limited to 5 bookings/month",
        "Standard profile placement",
      ],
    },
    {
      id: "growth",
      name: "Growth",
      icon: Zap,
      commission: "8% commission",
      description: "Scale your expert business",
      price: "₹999",
      priceLabel: "₹999 /mo",
      badge: "Best Value",
      buttonStyle: "border-teal-500 text-teal-600 bg-white hover:bg-teal-50",
      features: [
        "Accept up to 20 bookings per month",
        "Enhanced profile visibility",
        "Priority in search results",
        "Advanced analytics",
        "Marketing tools & resources",
        "Calendar sync (Google, Apple)",
        "Automated invoicing",
        "Priority support",
        "Featured expert badge",
      ],
      limitations: ["8% platform commission"],
    },
    {
      id: "elite",
      name: "Elite",
      icon: Rocket,
      commission: "5% commission",
      description: "For top-tier experts seeking maximum reach",
      price: "₹2,999",
      priceLabel: "₹2,999 /mo",
      badge: "Premium",
      buttonStyle: "border-teal-500 text-teal-600 bg-white hover:bg-teal-50",
      features: [
        "Unlimited bookings",
        "Premium profile placement",
        "Top priority in all searches",
        "Dedicated success manager",
        "Custom branding options",
        "White-label capabilities",
        "Advanced marketing automation",
        "Premium analytics suite",
        "VIP support (24/7)",
        "Exclusive networking events",
        "API access",
      ],
      limitations: ["5% platform commission"],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);

    // For free plan, show password step
    if (planId === "starter") {
      setShowPasswordStep(true);
    } else {
      // For paid plans, redirect to payment (TODO: implement payment flow)
      toast.info(
        "Payment integration coming soon. For now, please select the Free plan."
      );
    }
  };

  const handleRegister = async () => {
    if (!formData) {
      toast.error("Form data not found. Please start over.");
      router.push("/signup/expert");
      return;
    }

    // Validate password
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.isEmailVerified || !formData.isPhoneVerified) {
      toast.error("Please verify your email and phone number first");
      router.push("/signup/expert");
      return;
    }

    try {
      const result = await registerExpert({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        role: formData.role as "speaker" | "trainer",
        country: formData.country,
        city: formData.city,
        industry: formData.industry,
        password,
        subscriptionPlan: selectedPlan,
      }).unwrap();

      toast.success(result.message || "Registration successful!");

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("expertSignupData");
      }

      // Redirect based on response
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else if (result.user?.role === "speaker") {
        router.push("/profile/speaker");
      } else if (result.user?.role === "trainer") {
        router.push("/profile/trainer");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      {/* Header */}
      <div className="pt-8 px-8">
        <Link
          href="/signup/expert"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-center text-gray-600">
          Select the plan that helps you grow your expert business
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl p-8 border-2 shadow-lg transition-all ${
                isSelected
                  ? "border-teal-500 shadow-xl"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Icon + Title + Commission */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                  </div>
                </div>
                <p className="text-orange-600 font-semibold text-sm mb-1">
                  {plan.commission}
                </p>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price === "Free" ? (
                  <p className="text-4xl font-bold text-gray-900">Free</p>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 text-lg">/mo</span>
                  </div>
                )}
              </div>

              {/* Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors border-2 ${
                  isSelected
                    ? "bg-teal-500 text-white border-teal-500 hover:bg-teal-600"
                    : plan.buttonStyle
                }`}
              >
                {isSelected ? "Selected" : "Select Plan"}
              </button>

              {/* Features */}
              <div className="mt-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700 text-sm"
                    >
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              {plan.limitations.length > 0 && (
                <hr className="my-6 border-gray-200" />
              )}

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="mt-6">
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-gray-500 text-sm"
                      >
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Password Step Modal for Free Plan */}
      {showPasswordStep && selectedPlan === "starter" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Password
            </h2>
            <p className="text-gray-600 mb-6">
              Choose a strong password to secure your account
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters with uppercase, lowercase, and
                  special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordStep(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
                className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
