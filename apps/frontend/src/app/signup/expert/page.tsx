"use client";

import React, { useState, Suspense, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Check,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
  useResendOtpMutation,
} from "@/store/api/expertApi";
import { toast } from "react-hot-toast";

const ImageCarousel = dynamic(() => import("../components/ImageCarousel"), {
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
  ssr: false,
});

interface FormData {
  fullName: string;
  email: string;
  emailOtp: string;
  isEmailVerified: boolean;
  phone: string;
  phoneOtp: string;
  isPhoneVerified: boolean;
  role: "speaker" | "trainer" | "";
  country: string;
  city: string;
  industry: string;
}

const countries = [
  "Select your country",
  "United States",
  "United Kingdom",
  "India",
  "Canada",
  "Australia",
  "Singapore",
  "UAE",
  "Germany",
  "France",
  "Netherlands",
  "Ireland",
  "Switzerland",
  "Other",
];

const industries = [
  "Select your primary industry",
  "Technology & IT",
  "Leadership & Management",
  "Sales & Marketing",
  "Human Resources",
  "Finance & Accounting",
  "Healthcare",
  "Education & Training",
  "Manufacturing",
  "Consulting",
  "Entrepreneurship",
  "Personal Development",
  "Communications",
  "Other",
];

export default function ExpertSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Initialize form data - always start fresh
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    emailOtp: "",
    isEmailVerified: false,
    phone: "",
    phoneOtp: "",
    isPhoneVerified: false,
    role: "",
    country: "",
    city: "",
    industry: "",
  });

  // Clear localStorage on component mount (page load/reload)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear any existing signup data on page load
      localStorage.removeItem("expertSignupData");
      // Also reset OTP sent states
      setEmailOtpSent(false);
      setPhoneOtpSent(false);
    }
  }, []);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const industryDropdownRef = useRef<HTMLDivElement>(null);

  // API hooks
  const [sendEmailOtp, { isLoading: isSendingEmailOtp }] =
    useSendEmailOtpMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingEmailOtp }] =
    useVerifyEmailOtpMutation();
  const [sendPhoneOtp, { isLoading: isSendingPhoneOtp }] =
    useSendPhoneOtpMutation();
  const [verifyPhoneOtp, { isLoading: isVerifyingPhoneOtp }] =
    useVerifyPhoneOtpMutation();
  const [resendOtp] = useResendOtpMutation();

  // Save form data to localStorage whenever it changes (for navigation between steps)
  // But clear it on page reload (handled in the mount effect above)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only save if we have meaningful data (not just empty form)
      if (formData.fullName || formData.email || formData.phone) {
        localStorage.setItem("expertSignupData", JSON.stringify(formData));
      }
    }
  }, [formData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
      if (
        industryDropdownRef.current &&
        !industryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowIndustryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const steps = [
    {
      label: "Personal Info",
      subtitle: "Let's start with your basic information",
    },
    { label: "Contact", subtitle: "Verify your phone number to continue" },
    { label: "Role", subtitle: "Select your primary role on our platform" },
    {
      label: "Location",
      subtitle: "Help us connect you with the right opportunities",
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/");
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const result = await sendEmailOtp({
        email: formData.email,
        fullName: formData.fullName || undefined,
      }).unwrap();

      toast.success(result.message || "OTP sent to your email");
      setEmailOtpSent(true);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to send OTP"
      );
    }
  };

  const handleVerifyEmail = async () => {
    if (formData.emailOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      const result = await verifyEmailOtp({
        email: formData.email,
        otp: formData.emailOtp,
      }).unwrap();

      toast.success(result.message || "Email verified successfully");
      setFormData({ ...formData, isEmailVerified: true });
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Invalid OTP");
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!formData.phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const result = await sendPhoneOtp({
        phoneNumber: formData.phone,
        fullName: formData.fullName || undefined,
      }).unwrap();

      toast.success(result.message || "OTP sent to your phone");
      setPhoneOtpSent(true);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to send OTP"
      );
    }
  };

  const handleVerifyPhone = async () => {
    if (formData.phoneOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      const result = await verifyPhoneOtp({
        phoneNumber: formData.phone,
        otp: formData.phoneOtp,
        email: formData.email, // Include email - user should exist from email verification
      }).unwrap();

      toast.success(result.message || "Phone verified successfully");
      setFormData({ ...formData, isPhoneVerified: true });
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Invalid OTP");
    }
  };

  const handleResendOtp = async (type: "email" | "phone") => {
    try {
      const identifier = type === "email" ? formData.email : formData.phone;
      const result = await resendOtp({
        identifier,
        type,
        fullName: formData.fullName || undefined,
      }).unwrap();

      toast.success(result.message || `OTP resent to ${type}`);

      if (type === "email") {
        setEmailOtpSent(true);
        setFormData({ ...formData, emailOtp: "", isEmailVerified: false });
      } else {
        setPhoneOtpSent(true);
        setFormData({ ...formData, phoneOtp: "", isPhoneVerified: false });
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to resend OTP"
      );
    }
  };

  const canProceedStep1 =
    formData.fullName.trim() !== "" && formData.isEmailVerified;
  const canProceedStep2 = formData.isPhoneVerified;
  const canProceedStep3 = formData.role !== "";
  const canProceedStep4 =
    formData.country !== "" &&
    formData.city.trim() !== "" &&
    formData.industry !== "";

  const canProceed = [
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
    canProceedStep4,
  ][currentStep];

  const handleSubmit = () => {
    // Store form data and navigate to subscription page
    if (typeof window !== "undefined") {
      localStorage.setItem("expertSignupData", JSON.stringify(formData));
    }
    router.push("/subscription/expert");
  };

  // Clear form data when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Optional: Clear on unmount if you want fresh form on every visit
      // Uncomment if you want to clear on navigation away too
      // if (typeof window !== "undefined") {
      //   localStorage.removeItem("expertSignupData");
      // }
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Column - Image Carousel */}
      <div className="hidden lg:flex lg:w-[60%] relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          }
        >
          <ImageCarousel />
        </Suspense>
      </div>

      {/* Right Column - Signup Form */}
      <div className="flex w-full flex-col bg-[#fffbf5] lg:w-[40%] lg:pl-8 lg:pr-8">
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex-1 ${index < steps.length - 1 ? "mr-2" : ""}`}
                >
                  <div className="relative">
                    <div
                      className={`h-1 rounded-full ${
                        index <= currentStep ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                    {index === currentStep && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      index === currentStep
                        ? "text-green-600 font-medium"
                        : index < currentStep
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-6 pb-6">
            <div className="w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentStep === 0 && "Welcome to Voxvertex"}
                {currentStep === 1 && "Contact Information"}
                {currentStep === 2 && "Your Professional Role"}
                {currentStep === 3 && "Location & Industry"}
              </h1>
              <p className="text-gray-600 mb-8">
                {steps[currentStep].subtitle}
              </p>

              {/* Step 1: Personal Info */}
              {currentStep === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        disabled={formData.isEmailVerified}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
                      />
                    </div>
                    {formData.isEmailVerified && (
                      <div className="mt-2 flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Email verified</span>
                      </div>
                    )}
                  </div>

                  {!emailOtpSent && !formData.isEmailVerified && (
                    <button
                      onClick={handleSendEmailOtp}
                      disabled={
                        isSendingEmailOtp ||
                        !formData.email ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                      }
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingEmailOtp ? "Sending..." : "Send OTP"}
                    </button>
                  )}

                  {emailOtpSent && !formData.isEmailVerified && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="text"
                          value={formData.emailOtp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emailOtp: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            })
                          }
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center text-2xl tracking-widest"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerifyEmail}
                          disabled={
                            isVerifyingEmailOtp ||
                            formData.emailOtp.length !== 6
                          }
                          className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingEmailOtp
                            ? "Verifying..."
                            : "Verify Email"}
                        </button>
                        <button
                          onClick={() => handleResendOtp("email")}
                          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="+1 (555) 000-0000"
                        disabled={formData.isPhoneVerified}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100"
                      />
                    </div>
                    {formData.isPhoneVerified && (
                      <div className="mt-2 flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Phone verified</span>
                      </div>
                    )}
                  </div>

                  {!phoneOtpSent && !formData.isPhoneVerified && (
                    <button
                      onClick={handleSendPhoneOtp}
                      disabled={
                        isSendingPhoneOtp || formData.phone.trim() === ""
                      }
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingPhoneOtp ? "Sending..." : "Send OTP"}
                    </button>
                  )}

                  {phoneOtpSent && !formData.isPhoneVerified && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="text"
                          value={formData.phoneOtp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phoneOtp: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            })
                          }
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center text-2xl tracking-widest"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerifyPhone}
                          disabled={
                            isVerifyingPhoneOtp ||
                            formData.phoneOtp.length !== 6
                          }
                          className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingPhoneOtp
                            ? "Verifying..."
                            : "Verify Phone"}
                        </button>
                        <button
                          onClick={() => handleResendOtp("phone")}
                          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Professional Role */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div
                    onClick={() =>
                      setFormData({ ...formData, role: "speaker" })
                    }
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === "speaker"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Speaker
                          </h3>
                          <p className="text-sm text-gray-600">
                            Deliver keynotes and presentations at events
                          </p>
                        </div>
                      </div>
                      {formData.role === "speaker" && (
                        <Check className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setFormData({ ...formData, role: "trainer" })
                    }
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === "trainer"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Trainer
                          </h3>
                          <p className="text-sm text-gray-600">
                            Conduct training sessions and workshops
                          </p>
                        </div>
                      </div>
                      {formData.role === "trainer" && (
                        <Check className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Location & Industry */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="relative" ref={countryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCountryDropdown(!showCountryDropdown);
                          setShowIndustryDropdown(false);
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                          formData.country
                            ? "border-green-300 text-gray-900"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {formData.country || "Select your country"}
                      </button>
                      {showCountryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {countries.map((country, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  country:
                                    country === "Select your country"
                                      ? ""
                                      : country,
                                });
                                setShowCountryDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                index === 0 ? "text-gray-400" : "text-gray-900"
                              } ${
                                formData.country === country
                                  ? "bg-blue-50 text-blue-600"
                                  : ""
                              }`}
                            >
                              {country}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Enter your city"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="relative" ref={industryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowIndustryDropdown(!showIndustryDropdown);
                          setShowCountryDropdown(false);
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                          formData.industry
                            ? "border-green-300 text-gray-900"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {formData.industry || "Select your primary industry"}
                      </button>
                      {showIndustryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          <div className="px-4 py-2 bg-blue-500 text-white font-medium sticky top-0">
                            Select your primary industry
                          </div>
                          {industries.map((industry, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  industry:
                                    industry === "Select your primary industry"
                                      ? ""
                                      : industry,
                                });
                                setShowIndustryDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                index === 0 ? "text-gray-400" : "text-gray-900"
                              } ${
                                formData.industry === industry
                                  ? "bg-blue-50 text-blue-600"
                                  : ""
                              }`}
                            >
                              {industry}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="w-full flex justify-between">
              <button
                onClick={handleBackStep}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Plan Selection
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  disabled={!canProceed}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
