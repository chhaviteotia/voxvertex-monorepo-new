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
  industry?: string;
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
        if (params.industry) queryParams.append("industry", params.industry);
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
      transformResponse: (response: GetExpertByIdResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const { useGetExpertsQuery, useGetExpertByIdQuery } = marketplaceApi;

