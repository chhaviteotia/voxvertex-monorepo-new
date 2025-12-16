import { baseApi } from "./baseApi";

/**
 * Marketplace API - RTK Query endpoints for marketplace
 */

export interface Expert {
  id: string;
  name: string;
  initials: string;
  title: string;
  rating: number;
  reviews: number;
  sessions: number;
  description: string;
  tags: string[];
  rate: string;
  availability: "Available" | "Limited" | "Busy";
  role: "speaker" | "trainer";
  country: string;
  city: string;
  industry: string;
  profileImageUrl: string | null;
  isConnected?: boolean; // Optional - can be set on frontend based on user's connections
}

export interface GetExpertsResponse {
  success: boolean;
  data: {
    experts: Expert[];
    total: number;
    limit: number;
    skip: number;
  };
  message: string;
}

export interface GetExpertsParams {
  search?: string;
  role?: "speaker" | "trainer";
  roles?: string[];
  industry?: string;
  industries?: string[];
  expertise?: string[];
  sessionTypes?: string[];
  sessionFormats?: string[];
  sessionDurations?: string[];
  audienceTypes?: string[];
  languages?: string[];
  availability?: string[];
  ratings?: string[];
  experienceLevels?: string[];
  verificationStatus?: string[];
  priceMin?: number;
  priceMax?: number;
  country?: string;
  city?: string;
  limit?: number;
  skip?: number;
}

export interface GetExpertByIdResponse {
  success: boolean;
  data: {
    expert: Expert & {
      location?: string;
      responseTime?: string;
      languages?: string[];
      experience?: string;
      experienceList?: Array<{
        role: string;
        company: string;
        duration: string;
        description: string;
      }>;
      educationList?: Array<{
        degree: string;
        institution: string;
        year: string;
      }>;
      certifications?: Array<{
        name: string;
        issuer: string;
        year: string;
      }>;
      reviewsList?: Array<{
        reviewerName: string;
        reviewerInitials: string;
        reviewerTitle: string;
        rating: number;
        review: string;
      }>;
    };
  };
  message: string;
}

export const marketplaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExperts: builder.query<GetExpertsResponse, GetExpertsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.role) queryParams.append("role", params.role);
        if (params.roles && params.roles.length > 0) {
          params.roles.forEach((r) => queryParams.append("roles", r));
        }
        if (params.industry) queryParams.append("industry", params.industry);
        if (params.industries && params.industries.length > 0) {
          params.industries.forEach((i) => queryParams.append("industries", i));
        }
        if (params.expertise && params.expertise.length > 0) {
          params.expertise.forEach((e) => queryParams.append("expertise", e));
        }
        if (params.sessionTypes && params.sessionTypes.length > 0) {
          params.sessionTypes.forEach((st) => queryParams.append("sessionTypes", st));
        }
        if (params.sessionFormats && params.sessionFormats.length > 0) {
          params.sessionFormats.forEach((sf) => queryParams.append("sessionFormats", sf));
        }
        if (params.sessionDurations && params.sessionDurations.length > 0) {
          params.sessionDurations.forEach((sd) => queryParams.append("sessionDurations", sd));
        }
        if (params.audienceTypes && params.audienceTypes.length > 0) {
          params.audienceTypes.forEach((at) => queryParams.append("audienceTypes", at));
        }
        if (params.languages && params.languages.length > 0) {
          params.languages.forEach((l) => queryParams.append("languages", l));
        }
        if (params.availability && params.availability.length > 0) {
          params.availability.forEach((a) => queryParams.append("availability", a));
        }
        if (params.ratings && params.ratings.length > 0) {
          params.ratings.forEach((r) => queryParams.append("ratings", r));
        }
        if (params.experienceLevels && params.experienceLevels.length > 0) {
          params.experienceLevels.forEach((el) => queryParams.append("experienceLevels", el));
        }
        if (params.verificationStatus && params.verificationStatus.length > 0) {
          params.verificationStatus.forEach((vs) => queryParams.append("verificationStatus", vs));
        }
        if (params.priceMin !== undefined) queryParams.append("priceMin", params.priceMin.toString());
        if (params.priceMax !== undefined) queryParams.append("priceMax", params.priceMax.toString());
        if (params.country) queryParams.append("country", params.country);
        if (params.city) queryParams.append("city", params.city);
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.skip) queryParams.append("skip", params.skip.toString());

        return {
          url: `/marketplace/experts?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: GetExpertsResponse) => response,
    }),
    getExpertById: builder.query<GetExpertByIdResponse, string>({
      query: (id) => ({
        url: `/marketplace/experts/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // Backend returns { success: true, data: { expert: {...} }, message: "..." }
        // Ensure we return the correct structure
        if (response.success && response.data) {
          return response;
        }
        // If response doesn't have expected structure, return as is
        return response;
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetExpertsQuery, useGetExpertByIdQuery } = marketplaceApi;

