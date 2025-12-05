import { expertBaseApi } from "./expertBaseApi";

/**
 * Expert Registration API - RTK Query endpoints for expert (speaker/trainer) registration
 * Completely separate from existing auth system
 */

// Request/Response Types
export interface SendEmailOtpRequest {
  email: string;
  fullName?: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface SendPhoneOtpRequest {
  phoneNumber: string;
}

export interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface ResendOtpRequest {
  identifier: string;
  type: "email" | "phone";
  fullName?: string;
}

export interface RegisterExpertRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "speaker" | "trainer";
  country: string;
  city: string;
  industry: string;
  password: string;
}

export interface LoginExpertRequest {
  email: string;
  password: string;
}

export interface ExpertUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "speaker" | "trainer";
  country: string;
  city: string;
  industry: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  registrationCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpertAuthResponse {
  success: boolean;
  message: string;
  user: ExpertUser;
  redirectUrl: string;
  tokens: {
    accessToken: string;
  };
}

export interface ExpertOtpResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development mode
}

export interface ExpertCheckResponse {
  success: boolean;
  available: boolean;
  message: string;
}

export interface ExpertStatusResponse {
  success: boolean;
  isAuthenticated: boolean;
  user?: ExpertUser;
  message?: string;
}

export const expertApi = expertBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send Email OTP
    sendEmailOtp: builder.mutation<ExpertOtpResponse, SendEmailOtpRequest>({
      query: (body) => ({
        url: "/user/expert/send-email-otp",
        method: "POST",
        body,
      }),
    }),

    // Verify Email OTP
    verifyEmailOtp: builder.mutation<ExpertOtpResponse, VerifyEmailOtpRequest>({
      query: (body) => ({
        url: "/user/expert/verify-email-otp",
        method: "POST",
        body,
      }),
    }),

    // Send Phone OTP
    sendPhoneOtp: builder.mutation<ExpertOtpResponse, SendPhoneOtpRequest>({
      query: (body) => ({
        url: "/user/expert/send-phone-otp",
        method: "POST",
        body,
      }),
    }),

    // Verify Phone OTP
    verifyPhoneOtp: builder.mutation<ExpertOtpResponse, VerifyPhoneOtpRequest>({
      query: (body) => ({
        url: "/user/expert/verify-phone-otp",
        method: "POST",
        body,
      }),
    }),

    // Resend OTP
    resendOtp: builder.mutation<ExpertOtpResponse, ResendOtpRequest>({
      query: (body) => ({
        url: "/user/expert/resend-otp",
        method: "POST",
        body,
      }),
    }),

    // Register Expert (Complete Registration)
    registerExpert: builder.mutation<ExpertAuthResponse, RegisterExpertRequest>({
      query: (body) => ({
        url: "/user/expert/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExpertUser"],
    }),

    // Login Expert
    loginExpert: builder.mutation<ExpertAuthResponse, LoginExpertRequest>({
      query: (body) => ({
        url: "/user/expert/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExpertUser"],
    }),

    // Get Current Expert User
    getCurrentExpert: builder.query<{ success: boolean; user: ExpertUser }, void>({
      query: () => "/user/expert/me",
      providesTags: ["ExpertUser"],
    }),

    // Logout Expert
    logoutExpert: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/user/expert/logout",
        method: "POST",
      }),
      invalidatesTags: ["ExpertUser"],
    }),

    // Refresh Token
    refreshExpertToken: builder.mutation<
      { success: boolean; message: string; tokens: { accessToken: string } },
      void
    >({
      query: () => ({
        url: "/user/expert/refresh-token",
        method: "POST",
      }),
    }),

    // Check Authentication Status
    checkExpertAuthStatus: builder.query<ExpertStatusResponse, void>({
      query: () => "/user/expert/status",
      providesTags: ["ExpertUser"],
    }),

    // Check Email Availability
    checkEmailAvailability: builder.query<ExpertCheckResponse, string>({
      query: (email) => `/user/expert/check-email/${encodeURIComponent(email)}`,
    }),

    // Check Phone Availability
    checkPhoneAvailability: builder.query<ExpertCheckResponse, string>({
      query: (phoneNumber) => `/user/expert/check-phone/${encodeURIComponent(phoneNumber)}`,
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in functional components
export const {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
  useResendOtpMutation,
  useRegisterExpertMutation,
  useLoginExpertMutation,
  useGetCurrentExpertQuery,
  useLogoutExpertMutation,
  useRefreshExpertTokenMutation,
  useCheckExpertAuthStatusQuery,
  useCheckEmailAvailabilityQuery,
  useCheckPhoneAvailabilityQuery,
} = expertApi;

