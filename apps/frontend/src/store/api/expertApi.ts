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
  email?: string; // Required for expert registration - user should exist from email verification
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
  subscriptionPlan?: "starter" | "growth" | "elite";
}

export interface LoginExpertRequest {
  email: string;
  password: string;
}

export interface Experience {
  _id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface Education {
  _id?: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  location: string;
  year: string;
}

export interface Certification {
  _id?: string;
  title: string;
  issuer: string;
  issued: string;
  validUntil?: string | null;
  idNumber?: string | null;
  lifetime: boolean;
}

export interface TrainingCategory {
  _id?: string;
  title: string;
  level: string;
  experience: string;
  subtopics: string[];
  samplePrograms: string;
  success: string;
}

export interface Language {
  _id?: string;
  name: string;
  proficiency: string;
  canDeliver: boolean;
}

export interface Industry {
  _id?: string;
  name: string;
}

export interface ClientType {
  _id?: string;
  name: string;
}

export interface WorkPreferences {
  workArrangements: string[];
  sessionDurations: string[];
  geographicPreference: string[];
  travelWillingness: string[];
  travelDetails: string;
}

export interface Skill {
  _id?: string;
  name: string;
  rating: number;
  evidence?: string;
  tools?: string;
  additionalFields?: { [key: string]: string };
}

export interface SkillCategory {
  _id?: string;
  category: string;
  skills: Skill[];
}

export type SkillsAssessment = SkillCategory[];

export interface TrainingCalendarItem {
  _id?: string;
  date: string; // ISO date string
  price: string;
  priceType: string;
  mode: string;
  categories: string[];
  availability?: string | null;
}

export type TrainingCalendar = TrainingCalendarItem[];

export interface ExpertUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "speaker" | "trainer";
  country?: string;
  city?: string;
  industry?: string;
  professionalTitle?: string;
  yearsOfExperience?: number;
  timeZone?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  trainingCategories?: TrainingCategory[];
  languages?: Language[];
  industriesServed?: Industry[];
  clientTypesServed?: ClientType[];
  workPreferences?: WorkPreferences;
  skillsAssessment?: SkillsAssessment;
  trainingCalendar?: TrainingCalendar;
  emailVerified: boolean;
  phoneVerified: boolean;
  registrationCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  professionalTitle?: string;
  yearsOfExperience?: number;
  timeZone?: string;
  currentLocation?: string; // Format: "City, Country"
  city?: string;
  country?: string;
  industry?: string;
  bio?: string; // About/Bio text
  website?: string; // Website URL
  linkedin?: string; // LinkedIn profile
  twitter?: string; // Twitter handle
  experience?: Experience[]; // Work experience array
  education?: Education[]; // Education array
  certifications?: Certification[]; // Certifications array
  trainingCategories?: TrainingCategory[]; // Training categories array
  languages?: Language[]; // Languages array
  industriesServed?: Industry[]; // Industries served array
  clientTypesServed?: ClientType[]; // Client types served array
  workPreferences?: WorkPreferences; // Work preferences object
  skillsAssessment?: SkillsAssessment; // Skills assessment array
  trainingCalendar?: TrainingCalendar; // Training calendar array
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: ExpertUser;
  data?: ExpertUser;
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

    // Unified Login (determines user type from role)
    loginExpert: builder.mutation<ExpertAuthResponse, LoginExpertRequest>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExpertUser"],
    }),

    // Get Current Expert User
    getCurrentExpert: builder.query<{ success: boolean; user: ExpertUser }, void>({
      query: () => "/user/expert/me",
      providesTags: ["ExpertUser"],
      transformResponse: (response: any) => {
        // Backend returns { success: true, user: {...} }
        // RTK Query expects the same structure
        console.log("🔍 getCurrentExpert response:", response);
        return response;
      },
    }),

    // Update Profile
    updateProfile: builder.mutation<ProfileResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: "/profile/expert",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ExpertUser"],
      transformResponse: (response: any) => {
        // Backend returns { success: true, message: "...", user: {...} }
        console.log("🔍 updateProfile response:", response);
        return response;
      },
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
  useUpdateProfileMutation,
  useLogoutExpertMutation,
  useRefreshExpertTokenMutation,
  useCheckExpertAuthStatusQuery,
  useCheckEmailAvailabilityQuery,
  useCheckPhoneAvailabilityQuery,
} = expertApi;

