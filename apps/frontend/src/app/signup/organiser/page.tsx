"use client";

import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Building, Check, MailCheck, User2, Eye, EyeOff } from "lucide-react";
import {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useResendOtpMutation,
  useRegisterOrganiserMutation,
} from "@/store/api/organiserApi";
import { toast } from "react-hot-toast";

const ImageCarousel = dynamic(() => import("./components/ImageCarousel"), {
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
  phoneNumber: string;
  userType: "independent" | "organization" | "";
  companyTitle: string;
  password: string;
  confirmPassword: string;
}

const PersonalInfo = ({
  formData,
  setFormData,
  emailOtpSent,
  setEmailOtpSent,
}: {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  emailOtpSent: boolean;
  setEmailOtpSent: (sent: boolean) => void;
}) => {
  const [sendEmailOtp, { isLoading: isSendingEmailOtp }] =
    useSendEmailOtpMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingEmailOtp }] =
    useVerifyEmailOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  const handleSendOtp = async () => {
    if (!formData.email || !formData.fullName) {
      toast.error("Please enter your full name and email address");
      return;
    }

    try {
      await sendEmailOtp({
        email: formData.email,
        fullName: formData.fullName,
      }).unwrap();
      setEmailOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to send OTP"
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.emailOtp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      await verifyEmailOtp({
        email: formData.email,
        otp: formData.emailOtp,
      }).unwrap();
      setFormData({ ...formData, isEmailVerified: true });
      toast.success("Email verified successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Invalid OTP. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({
        identifier: formData.email,
        type: "email",
        fullName: formData.fullName,
      }).unwrap();
      toast.success("OTP resent to your email");
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to resend OTP"
      );
    }
  };

  return (
    <div className="bg-[#F8F6F3]">
      <h2 className="text-lg mb-2">Full Name *</h2>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        className="w-full border-none p-3 rounded-2xl mb-4 bg-white"
        placeholder="Enter your Full Name"
      />

      <h2 className="text-lg mb-2">Email Address *</h2>

      {!formData.isEmailVerified && (
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border-none p-3 rounded-2xl mb-3 bg-white"
          placeholder="Enter your Company Email Address"
        />
      )}

      {formData.isEmailVerified && (
        <div className="w-full flex items-center justify-between bg-gray-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 text-gray-700">
            <span>
              <MailCheck />
            </span>
            <span>{formData.email}</span>
          </div>
          <span className="text-green-600 text-xl">✔</span>
        </div>
      )}

      {!emailOtpSent && !formData.isEmailVerified && (
        <button
          onClick={handleSendOtp}
          disabled={isSendingEmailOtp}
          className="w-full bg-teal-500 rounded-2xl p-2 text-white disabled:opacity-50"
        >
          {isSendingEmailOtp ? "Sending..." : "Send OTP"}
        </button>
      )}

      {/* ✅ OTP SECTION */}
      {emailOtpSent && !formData.isEmailVerified && (
        <div className="mt-4">
          <input
            type="text"
            value={formData.emailOtp}
            onChange={(e) =>
              setFormData({ ...formData, emailOtp: e.target.value })
            }
            placeholder="Enter the OTP"
            className="w-full bg-white rounded-2xl p-3"
            maxLength={6}
          />

          <div className="w-full flex gap-3 mt-5">
            <button
              onClick={handleVerifyOtp}
              disabled={isVerifyingEmailOtp}
              className="flex-1 bg-teal-500 rounded-2xl p-2 text-white disabled:opacity-50"
            >
              {isVerifyingEmailOtp ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={handleResendOtp}
              disabled={isResendingOtp}
              className="flex-1 rounded-2xl bg-white p-2 border disabled:opacity-50"
            >
              {isResendingOtp ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UserType = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}) => {
  return (
    <div className="pb-5">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold">Tell Us About Yourself</h2>
        <p className="text-sm text-gray-500">
          Are you booking as an individual or on behalf of an organization?
        </p>
      </div>
      <div className="w-full flex flex-col gap-5">
        {(["independent", "organization"] as const).map((type) => (
          <div
            key={type}
            onClick={() => setFormData({ ...formData, userType: type })}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              formData.userType === type
                ? "border-teal-600 bg-teal-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  formData.userType === type
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {type === "independent" ? <User2 /> : <Building />}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {type === "independent"
                    ? "Independent Organizer"
                    : "Organization Member"}
                </h3>
                <p className="text-sm text-gray-600">
                  {type === "independent"
                    ? "I'm booking events or sessions independently"
                    : "I'm booking on behalf of a company or organization"}
                </p>
              </div>

              {formData.userType === type && (
                <Check className="text-teal-700" size={22} />
              )}
            </div>
          </div>
        ))}

        {formData.userType && (
          <div className="mt-3 p-4 space-y-1">
            <h4 className="font-medium text-gray-800">Your Designation/Role</h4>
            <input
              type="text"
              value={formData.companyTitle}
              onChange={(e) =>
                setFormData({ ...formData, companyTitle: e.target.value })
              }
              placeholder="e.g., HR Manager, Event Coordinator etc"
              className="w-full p-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Details = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}) => {
  // Only show organization details if user selected "organization"
  if (formData.userType !== "organization") {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Organization details are only required for organization members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pb-14">
      <div>
        <h2 className="text-3xl font-semibold mb-1">Organization Details</h2>
        <p className="text-gray-500">Tell us about your organization</p>
      </div>

      <div>
        <label className="block text-sm mb-2">
          Company/Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter organization name"
          className="w-full bg-white rounded-2xl p-4 border focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Company Website</label>
        <input
          type="url"
          placeholder="https://www.example.com"
          className="w-full bg-white rounded-2xl p-4 border focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
};

const PasswordStep = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Create Password</h2>
        <p className="text-gray-500 text-sm">
          Choose a strong password to secure your account
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter your password"
            className="w-full bg-white rounded-2xl p-4 pr-12 border focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 6 characters with uppercase, lowercase, and special
          character
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Confirm your password"
            className="w-full bg-white rounded-2xl p-4 pr-12 border focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {formData.password &&
          formData.confirmPassword &&
          formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
      </div>
    </div>
  );
};

// ✅ STEPS DEFINITION
const getSteps = (
  formData: FormData,
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void,
  emailOtpSent: boolean,
  setEmailOtpSent: (sent: boolean) => void
) => [
  {
    label: "Personal Info",
    subtitle: "Let's start with your basic information",
  },
  {
    label: "User Type",
    subtitle: "Tell us who you are",
  },
  {
    label: "Details",
    subtitle: "Almost done!",
  },
  {
    label: "Password",
    subtitle: "Secure your account",
  },
];

export default function OrganiserSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    emailOtp: "",
    isEmailVerified: false,
    phoneNumber: "",
    userType: "",
    companyTitle: "",
    password: "",
    confirmPassword: "",
  });

  const [registerOrganiser, { isLoading: isRegistering }] =
    useRegisterOrganiserMutation();

  // Clear form data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("organiserSignupData");
    }
  }, []);

  const steps = getSteps(formData, setFormData, emailOtpSent, setEmailOtpSent);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      // Step 1: Personal Info - must have verified email
      if (!formData.isEmailVerified) {
        toast.error("Please verify your email address first");
        return;
      }
    } else if (currentStep === steps.length - 1) {
      // Last step: Complete registration
      handleCompleteRegistration();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleCompleteRegistration = async () => {
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Please enter and confirm your password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      // Only include userType if it's a valid value (independent or organization)
      const registrationData: any = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      // Only add userType if it's a valid value
      if (
        formData.userType &&
        (formData.userType === "independent" ||
          formData.userType === "organization")
      ) {
        registrationData.userType = formData.userType;
      }

      // Only add companyTitle if it has a value
      if (formData.companyTitle && formData.companyTitle.trim()) {
        registrationData.companyTitle = formData.companyTitle.trim();
      }

      // Add activities if provided
      registrationData.activities = [];

      console.log("Registering organiser with data:", registrationData);

      const result = await registerOrganiser(registrationData).unwrap();

      toast.success(result.message || "Registration successful!");

      // Redirect to profile page based on backend redirectUrl
      console.log("Registration result:", result);
      console.log("Redirect URL from backend:", result.redirectUrl);

      if (result.redirectUrl) {
        console.log("Redirecting to:", result.redirectUrl);
        router.push(result.redirectUrl);
      } else {
        console.log("No redirectUrl provided, redirecting to /dashboard");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle RTK Query error format
      let errorMessage = "Registration failed. Please try again.";

      if (error?.data) {
        // Backend error response
        if (error.data.errors && Array.isArray(error.data.errors)) {
          errorMessage =
            error.data.errors[0] || error.data.message || errorMessage;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfo
            formData={formData}
            setFormData={setFormData}
            emailOtpSent={emailOtpSent}
            setEmailOtpSent={setEmailOtpSent}
          />
        );
      case 1:
        return <UserType formData={formData} setFormData={setFormData} />;
      case 2:
        return <Details formData={formData} setFormData={setFormData} />;
      case 3:
        return <PasswordStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8F6F3]">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-100" />
          }
        >
          <ImageCarousel />
        </Suspense>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 bg-[#F8F6F3]">
        {/* ✅ PROGRESS BAR */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* ✅ STEP LABELS */}
          <div className="grid grid-cols-4 mt-3 text-sm text-gray-500">
            {steps.map((step, index) => (
              <p
                key={index}
                className={`text-center ${
                  currentStep === index ? "text-teal-600 font-medium" : ""
                }`}
              >
                {step.label}
              </p>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-1">Welcome to VoxVertex</h1>
        <p className="text-gray-600 mb-6">{steps[currentStep].subtitle}</p>

        {/* ✅ STEP CONTENT */}
        <div className="p-6 rounded-lg min-h-[160px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-8 bg-[#F8F6F3] p-2">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-4 py-2 border-none rounded disabled:opacity-40 bg-white"
          >
            Back
          </button>

          <button
            onClick={handleNextStep}
            disabled={
              (currentStep === steps.length - 1 && isRegistering) ||
              (currentStep === 0 && !formData.isEmailVerified)
            }
            className="px-6 py-2 bg-teal-600 text-white rounded disabled:opacity-50"
          >
            {currentStep === steps.length - 1
              ? isRegistering
                ? "Registering..."
                : "Complete Registration"
              : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
