"use client";

import React, { useState, Suspense } from "react";
import { ArrowLeft, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useLoginExpertMutation } from "@/store/api/expertApi";
import { useAppDispatch } from "@/store/hooks";
import { fetchCurrentUser } from "@/store/slices/authSlice";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginExpert, { isLoading: isLoggingIn }] = useLoginExpertMutation();

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!isFormValid || isLoggingIn) return;

    setLocalError("");

    try {
      const result = await loginExpert({
        email: email.trim(),
        password: password.trim(),
      }).unwrap();

      toast.success("Login successful!");

      // Fetch current user to update auth state
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (error) {
        console.error("Failed to fetch user after login:", error);
        // Continue anyway - cookies are set
      }

      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200));

      // Redirect based on response - backend provides redirectUrl
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else if (result.user?.role) {
        // Fallback based on role
        switch (result.user.role) {
          case "speaker":
            router.push("/profile/speaker");
            break;
          case "trainer":
            router.push("/profile/trainer");
            break;
          case "organiser":
            router.push("/profile/organiser");
            break;
          case "participant":
            router.push("/profile/participant");
            break;
          default:
            router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Login failed. Please check your credentials and try again.";
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid && !isLoggingIn) {
      handleLogin();
    }
  };

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

      {/* Right Column - Login Form */}
      <div className="flex w-full flex-col bg-[#fffbf5] lg:w-1/2 lg:pl-8">
        <div className="flex h-full flex-col">
          {/* Header Section */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-6 pt-8">
            <div className="w-full max-w-md">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Welcome Back
              </h2>
              <p className="mb-8 text-gray-600">Login to your expert account</p>

              {localError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">{localError}</p>
                </div>
              )}

              <div className="space-y-5" onKeyPress={handleKeyPress}>
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
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (localError) setLocalError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      required
                    />
                  </div>
                  {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <p className="text-xs text-red-600 mt-1">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (localError) setLocalError("");
                      }}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs text-gray-600 hover:text-gray-800 underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={!isFormValid || isLoggingIn}
                  className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Logging in...
                    </div>
                  ) : (
                    "Log in"
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-xs text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup/trainer"
                      className="text-orange-600 hover:text-orange-800 font-medium underline transition-colors"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
