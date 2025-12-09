import { expertBaseApi } from "./expertBaseApi";

/**
 * Organiser Registration API - RTK Query endpoints for organiser registration
 * Uses the unified user API endpoints
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

export interface ResendOtpRequest {
  identifier: string;
  type: "email" | "phone";
  fullName?: string;
}

export interface RegisterOrganiserRequest {
  fullName: string;
  email: string;
  password: string;
  userType?: "independent" | "organization";
  companyTitle?: string;
  activities?: string[];
}

export interface LoginOrganiserRequest {
  email: string;
  password: string;
}

// Extend the base API with organiser-specific endpoints
export const organiserApi = expertBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send Email OTP for Organiser
    sendEmailOtpOrganiser: builder.mutation<
      { success: boolean; message: string },
      SendEmailOtpRequest
    >({
      query: (data) => ({
        url: "/user/organiser/send-email-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Verify Email OTP for Organiser
    verifyEmailOtpOrganiser: builder.mutation<
      { success: boolean; message: string },
      VerifyEmailOtpRequest
    >({
      query: (data) => ({
        url: "/user/organiser/verify-email-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Resend OTP for Organiser
    resendOtpOrganiser: builder.mutation<
      { success: boolean; message: string },
      ResendOtpRequest
    >({
      query: (data) => ({
        url: "/user/organiser/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Register Organiser
    registerOrganiser: builder.mutation<
      {
        success: boolean;
        message: string;
        user: {
          _id: string;
          fullName: string;
          email: string;
          role: string;
          registrationCompleted: boolean;
        };
        redirectUrl: string;
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      },
      RegisterOrganiserRequest
    >({
      query: (data) => {
        const body: any = {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          role: "organiser", // Required: role must be "organiser"
        };
        
        // userType in body is for independent/organization choice (not the user type from URL)
        // Only include if provided
        if (data.userType) {
          body.userType = data.userType; // "independent" or "organization"
        }
        if (data.companyTitle) {
          body.companyTitle = data.companyTitle;
        }
        if (data.activities && data.activities.length > 0) {
          body.activities = data.activities;
        }
        
        return {
          url: "/user/organiser/register",
          method: "POST",
          body,
        };
      },
    }),

    // Login Organiser (uses unified login)
    loginOrganiser: builder.mutation<
      {
        success: boolean;
        message: string;
        user: {
          _id: string;
          fullName: string;
          email: string;
          role: string;
        };
        redirectUrl: string;
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      },
      LoginOrganiserRequest
    >({
      query: (data) => ({
        url: "/user/login",
        method: "POST",
        body: data,
      }),
    }),

    // Get Current Organiser
    getCurrentOrganiser: builder.query<
      {
        success: boolean;
        user: {
          _id: string;
          fullName: string;
          email: string;
          role: string;
          phoneNumber?: string;
          userType?: string;
          companyTitle?: string;
          activities?: string[];
        };
      },
      void
    >({
      query: () => "/user/organiser/me",
      providesTags: ["Organiser"],
    }),

    // Logout Organiser
    logoutOrganiser: builder.mutation<{ success: boolean; message: string }, void>(
      {
        query: () => ({
          url: "/user/organiser/logout",
          method: "POST",
        }),
      }
    ),
  }),
});

export const {
  useSendEmailOtpOrganiserMutation,
  useVerifyEmailOtpOrganiserMutation,
  useResendOtpOrganiserMutation,
  useRegisterOrganiserMutation,
  useLoginOrganiserMutation,
  useGetCurrentOrganiserQuery,
  useLogoutOrganiserMutation,
} = organiserApi;

// Export with shorter names for convenience
export const useSendEmailOtpMutation = useSendEmailOtpOrganiserMutation;
export const useVerifyEmailOtpMutation = useVerifyEmailOtpOrganiserMutation;
export const useResendOtpMutation = useResendOtpOrganiserMutation;

