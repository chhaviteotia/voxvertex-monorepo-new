"use client";

import React, { useState, Suspense } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Check,
  Briefcase,
  MapPin,
  FileText,
  ChevronDown,
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
  useRegisterExpertMutation,
} from "@/store/api/expertApi";
import { toast } from "react-hot-toast";

// Dynamic import for ImageCarousel
const ImageCarousel = dynamic(
  () => import("../signup/components/ImageCarousel"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function JoinExpertPage() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal Info, 2: Contact, 3: Role, 4: Location

  // Step 1: Personal Info states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Step 2: Contact states
  const [contactNumber, setContactNumber] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 3: Role states
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Step 4: Location & Industry states
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  // RTK Query hooks
  const router = useRouter();
  const [sendEmailOtp, { isLoading: isSendingEmailOtp }] =
    useSendEmailOtpMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingEmailOtp }] =
    useVerifyEmailOtpMutation();
  const [sendPhoneOtp, { isLoading: isSendingPhoneOtp }] =
    useSendPhoneOtpMutation();
  const [verifyPhoneOtp, { isLoading: isVerifyingPhoneOtp }] =
    useVerifyPhoneOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const [registerExpert, { isLoading: isRegistering }] =
    useRegisterExpertMutation();

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

  const handleSendOtp = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter full name and email");
      return;
    }

    try {
      console.log("Sending OTP request:", {
        email: email.trim(),
        fullName: fullName.trim(),
      });
      const result = await sendEmailOtp({
        email: email.trim(),
        fullName: fullName.trim(),
      }).unwrap();
      console.log("Email OTP sent successfully:", result);
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (error: any) {
      console.error("Send OTP error details:", {
        error,
        data: error?.data,
        status: error?.status,
        message: error?.message,
        fullError: JSON.stringify(error, null, 2),
      });

      // Extract error message from RTK Query error format
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Failed to send OTP. Please check your email and try again.";

      toast.error(errorMessage);

      // If email already exists, show helpful message
      if (
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("email already")
      ) {
        toast.error(
          "This email is already registered. Please use a different email or login.",
          {
            duration: 5000,
          }
        );
      }
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!contactNumber.trim() || contactNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const result = await sendPhoneOtp({
        phoneNumber: contactNumber.replace(/\D/g, ""),
      }).unwrap();
      setPhoneOtpSent(true);
      toast.success("OTP sent to your phone");
      // In development, show OTP in console
      if (result.otp && process.env.NODE_ENV === "development") {
        console.log("Phone OTP:", result.otp);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyEmail = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      await verifyEmailOtp({
        email: email.trim(),
        otp: otp,
      }).unwrap();
      setEmailVerified(true);
      toast.success("Email verified successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      await verifyPhoneOtp({
        phoneNumber: contactNumber.replace(/\D/g, ""),
        otp: phoneOtp,
      }).unwrap();
      setPhoneVerified(true);
      toast.success("Phone verified successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleResendEmailOtp = async () => {
    try {
      await resendOtp({
        identifier: email.trim(),
        type: "email",
        fullName: fullName.trim(),
      }).unwrap();
      setOtp("");
      toast.success("OTP resent to your email");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  const handleResendPhoneOtp = async () => {
    try {
      const result = await resendOtp({
        identifier: contactNumber.replace(/\D/g, ""),
        type: "phone",
      }).unwrap();
      setPhoneOtp("");
      toast.success("OTP resent to your phone");
      if (result.otp && process.env.NODE_ENV === "development") {
        console.log("Phone OTP:", result.otp);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  const handleNextStep = async () => {
    // Validate before moving to next step
    if (currentStep === 1) {
      if (!emailVerified) {
        toast.error("Please verify your email before proceeding");
        return;
      }
    } else if (currentStep === 2) {
      if (!phoneVerified) {
        toast.error("Please verify your phone before proceeding");
        return;
      }
    } else if (currentStep === 3) {
      if (!selectedRole) {
        toast.error("Please select a role before proceeding");
        return;
      }
    } else if (currentStep === 4) {
      // Complete registration
      await handleCompleteRegistration();
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCompleteRegistration = async () => {
    // Validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !contactNumber.trim() ||
      !selectedRole ||
      !country ||
      !city ||
      !industry ||
      !password
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      toast.error(
        "Password must contain at least 1 uppercase, 1 lowercase, and 1 special character"
      );
      return;
    }

    try {
      const result = await registerExpert({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: contactNumber.replace(/\D/g, ""),
        role: selectedRole as "speaker" | "trainer",
        country: country,
        city: city.trim(),
        industry: industry,
        password: password,
      }).unwrap();

      toast.success("Registration completed successfully!");

      // Redirect based on role
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        router.push("/profile/speaker");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters - return just digits (matching image: "9876543210")
    const phoneNumber = value.replace(/\D/g, "");
    return phoneNumber;
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) {
        setShowCountryDropdown(false);
        setShowIndustryDropdown(false);
      }
    };

    if (showCountryDropdown || showIndustryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCountryDropdown, showIndustryDropdown]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Column - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
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

      {/* Right Column - Registration Form */}
      <div className="flex w-full flex-col bg-[#fffbf5] lg:w-1/2 lg:pl-8">
        <div className="flex h-full flex-col">
          {/* Header Section */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-12">
              {currentStep === 1 ? (
                <Link
                  href="/"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of 4
              </span>
            </div>

            {/* Line below arrow and above progress bar */}
            <div className="mb-6 border-b border-gray-200"></div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="h-1 w-full rounded-full bg-gray-200">
                <div
                  className="h-1 rounded-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Navigation Steps - Spacing matches progress bar segments */}
            <div className="flex w-full">
              <span
                className={`text-sm font-medium ${
                  currentStep >= 1 ? "text-teal-600" : "text-gray-400"
                }`}
                style={{ width: "25%" }}
              >
                Personal Info
              </span>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 2 ? "text-teal-600" : "text-gray-400"
                }`}
                style={{ width: "25%", textAlign: "center" }}
              >
                Contact
              </span>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 3 ? "text-teal-600" : "text-gray-400"
                }`}
                style={{ width: "25%", textAlign: "center" }}
              >
                Role
              </span>
              <span
                className={`text-sm font-medium ${
                  currentStep >= 4 ? "text-teal-600" : "text-gray-400"
                }`}
                style={{ width: "25%", textAlign: "right" }}
              >
                Location
              </span>
            </div>
          </div>

          {/* Form Content - Aligned with progress bar, positioned just below it */}
          <div className="flex-1 px-6 pt-6">
            <div className="w-full">
              {currentStep === 1 && (
                <>
                  <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Welcome to Voxvertex
                  </h2>
                  <p className="mb-8 text-gray-600">
                    Let's start with your basic information
                  </p>

                  {/* Form Fields */}
                  <div className="space-y-5">
                    {/* Full Name Field */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    </div>

                    {/* OTP Input - Show after Send OTP is clicked */}
                    {otpSent && (
                      <div>
                        <label
                          htmlFor="otp"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="text"
                          id="otp"
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setOtp(value);
                          }}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={
                          !fullName.trim() || !email.trim() || isSendingEmailOtp
                        }
                        className="w-full rounded-lg bg-[#f5f5dc] px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-[#e8e8d0] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingEmailOtp ? "Sending..." : "Send OTP"}
                      </button>
                    ) : emailVerified ? (
                      <div className="flex items-center gap-2 text-teal-600">
                        <Check className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Email verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleVerifyEmail}
                          disabled={otp.length !== 6 || isVerifyingEmailOtp}
                          className="flex-1 rounded-lg bg-teal-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingEmailOtp
                            ? "Verifying..."
                            : "Verify Email"}
                        </button>
                        <button
                          type="button"
                          onClick={handleResendEmailOtp}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Resend
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                  <p className="mb-8 text-gray-600">
                    Verify your phone number to continue.
                  </p>

                  {/* Form Fields */}
                  <div className="space-y-5">
                    {/* Contact Number Field */}
                    <div>
                      <label
                        htmlFor="contactNumber"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Contact Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          id="contactNumber"
                          value={contactNumber}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setContactNumber(formatted);
                          }}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 ${
                            phoneVerified ? "pr-10" : "pr-4"
                          } text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                          disabled={phoneVerified}
                        />
                        {phoneVerified && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                              <Check className="h-4 w-4 text-gray-700" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone OTP Input - Show after Send OTP is clicked */}
                    {phoneOtpSent && (
                      <div>
                        <label
                          htmlFor="phoneOtp"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Enter 6-digit OTP
                        </label>
                        <input
                          type="text"
                          id="phoneOtp"
                          value={phoneOtp}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setPhoneOtp(value);
                          }}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!phoneOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={
                          !contactNumber.trim() ||
                          contactNumber.length < 10 ||
                          isSendingPhoneOtp
                        }
                        className="w-full rounded-lg bg-[#f5f5dc] px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-[#e8e8d0] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingPhoneOtp ? "Sending..." : "Send OTP"}
                      </button>
                    ) : phoneVerified ? (
                      <div className="flex items-center gap-2 text-teal-600">
                        <Check className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Phone verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleVerifyPhone}
                          disabled={
                            phoneOtp.length !== 6 || isVerifyingPhoneOtp
                          }
                          className="flex-1 rounded-lg bg-teal-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingPhoneOtp
                            ? "Verifying..."
                            : "Verify Phone"}
                        </button>
                        <button
                          type="button"
                          onClick={handleResendPhoneOtp}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Resend
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Your Professional Role
                  </h2>
                  <p className="mb-8 text-gray-600">
                    Select your primary role on our platform.
                  </p>

                  {/* Role Selection Cards */}
                  <div className="space-y-4">
                    {/* Speaker Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("speaker")}
                      className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                        selectedRole === "speaker"
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                            selectedRole === "speaker"
                              ? "bg-teal-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <Briefcase
                            className={`h-6 w-6 ${
                              selectedRole === "speaker"
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-semibold text-gray-900">
                            Speaker
                          </h3>
                          <p className="text-sm text-gray-600">
                            Deliver keynotes and presentations at events.
                          </p>
                        </div>
                        {selectedRole === "speaker" && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Trainer Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("trainer")}
                      className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                        selectedRole === "trainer"
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                            selectedRole === "trainer"
                              ? "bg-teal-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <Briefcase
                            className={`h-6 w-6 ${
                              selectedRole === "trainer"
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-semibold text-gray-900">
                            Trainer
                          </h3>
                          <p className="text-sm text-gray-600">
                            Conduct training sessions and workshops.
                          </p>
                        </div>
                        {selectedRole === "trainer" && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Location & Industry
                  </h2>
                  <p className="mb-8 text-gray-600">
                    Help us connect you with the right opportunities
                  </p>

                  {/* Form Fields */}
                  <div className="space-y-5">
                    {/* Country Field */}
                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Country *
                      </label>
                      <div className="relative" data-dropdown>
                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCountryDropdown(!showCountryDropdown);
                            setShowIndustryDropdown(false);
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 pr-10 text-left text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                          <span
                            className={
                              country ? "text-gray-900" : "text-gray-400"
                            }
                          >
                            {country || "Select your country"}
                          </span>
                        </button>
                        <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        {showCountryDropdown && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                            <ul className="max-h-60 overflow-auto py-1">
                              {countries.map((countryOption) => (
                                <li key={countryOption}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        countryOption !== "Select your country"
                                      ) {
                                        setCountry(countryOption);
                                      }
                                      setShowCountryDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-teal-50 ${
                                      country === countryOption
                                        ? "bg-teal-50 text-teal-600"
                                        : "text-gray-900"
                                    } ${
                                      countryOption === "Select your country"
                                        ? "text-gray-400"
                                        : ""
                                    }`}
                                  >
                                    {countryOption}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* City Field */}
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        City *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter your city"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    </div>

                    {/* Industry Field */}
                    <div>
                      <label
                        htmlFor="industry"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Industry *
                      </label>
                      <div className="relative" data-dropdown>
                        <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowIndustryDropdown(!showIndustryDropdown);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 pr-10 text-left text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                          <span
                            className={
                              industry ? "text-gray-900" : "text-gray-400"
                            }
                          >
                            {industry || "Select your primary industry"}
                          </span>
                        </button>
                        <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        {showIndustryDropdown && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                            <ul className="max-h-60 overflow-auto py-1">
                              {industries.map((industryOption) => (
                                <li key={industryOption}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        industryOption !==
                                        "Select your primary industry"
                                      ) {
                                        setIndustry(industryOption);
                                      }
                                      setShowIndustryDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-teal-50 ${
                                      industry === industryOption
                                        ? "bg-teal-50 text-teal-600"
                                        : "text-gray-900"
                                    } ${
                                      industryOption ===
                                      "Select your primary industry"
                                        ? "text-gray-400"
                                        : ""
                                    }`}
                                  >
                                    {industryOption}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Password *
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must contain uppercase, lowercase, and special character
                      </p>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackStep}
                className="rounded-lg border-2 border-orange-600 bg-white px-6 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isRegistering}
                className="rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering
                  ? "Registering..."
                  : currentStep === 4
                  ? "Complete & Continue"
                  : "Next Step"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
