// ============================================================================
// EXPERT BASE API - RTK Query Configuration for Expert Registration
// ============================================================================
// Separate from existing auth to avoid conflicts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query for expert APIs (no reauth logic that touches existing auth)
const expertBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  credentials: 'include', // Include cookies for authentication
  timeout: 10000, // 10 second timeout
  prepareHeaders: (headers) => {
    // Expert APIs use expertAccessToken, expertRefreshToken cookies
    // These are set automatically by the backend
    return headers;
  },
});

// Base query with simple error handling (no existing auth logout)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expertBaseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  try {
    const result = await expertBaseQuery(args, api, extraOptions);
    
    // Handle 401 errors for expert APIs (don't touch existing auth)
    if (result?.error && result.error.status === 401) {
      console.log('Expert authentication failed - session may have expired');
      // Don't dispatch existing auth/logout - expert auth is separate
      // The frontend can handle this by redirecting to login if needed
    }

    return result;
  } catch (error) {
    console.error('Expert Base API error:', error);
    throw error;
  }
};

// Create the expert base API (completely separate from existing baseApi)
export const expertBaseApi = createApi({
  reducerPath: 'expertApi',
  baseQuery: expertBaseQueryWithErrorHandling,
  tagTypes: [
    'ExpertUser',
    'ExpertOtp',
  ],
  endpoints: () => ({}),
});

