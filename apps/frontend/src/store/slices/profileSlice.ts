import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import {
  getProfile,
  getSpeakerProfile,
  getOrganiserProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addAward,
  updateAward,
  deleteAward,
  addVideo,
  updateVideo,
  deleteVideo,
  updateSkills,
  updateBio,
  updateSpeakerBio,
  updateOrganiserBio,
  type ExperienceData,
  type EducationData,
  type AwardData,
  type VideoData,
  type SkillData,
  type ProfileResponse,
} from "@/services/profileService";

// Helper to get current pathname (for route-based role detection)
const getCurrentPathname = (): string => {
  if (typeof window !== "undefined") {
    return window.location.pathname;
  }
  return "";
};

/**
 * Profile State Interface
 */
interface ProfileState {
  data: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetched: number | null;
}

const initialState: ProfileState = {
  data: null,
  status: "idle",
  error: null,
  lastFetched: null,
};

/**
 * Async Thunks for Profile Operations
 */

/**
 * Fetch profile - Automatically uses role-specific endpoint based on user role
 * Uses: /api/profile/speaker for speakers, /api/profile/organiser for organisers, /api/profile/me for others
 */
export const fetchProfile = createAsyncThunk<
  ProfileResponse,
  void,
  { rejectValue: string; state: RootState }
>("profile/fetchProfile", async (_, { rejectWithValue, getState }) => {
  try {
    // Get user from auth state
    const authUser = getState().auth.user;
    const userRole = authUser?.role;
    const userId = authUser?._id || authUser?.id;
    
    // Get current profile data
    const currentProfileData = getState().profile.data;
    const currentProfileUserId = currentProfileData?._id || currentProfileData?.id;
    
    // If profile data exists but belongs to a different user, we should clear it first
    // This check is handled by the component, but we log it here for debugging
    if (userId && currentProfileUserId && currentProfileUserId !== userId) {
      console.log("⚠️ Profile data belongs to different user, will be replaced");
    }
    
    console.log("🔵 fetchProfile - Fetching profile for user:", userId, "role:", userRole);
    
    // Use role-specific endpoints
    let response: ProfileResponse;
    if (userRole === "speaker") {
      response = await getSpeakerProfile();
    } else if (userRole === "organiser" || userRole === "organizer") {
      response = await getOrganiserProfile();
    } else {
      // Fallback to legacy endpoint for other roles or if role is unknown
      response = await getProfile();
    }
    
    // Verify the response belongs to the current user
    const responseUserId = response?.data?._id || response?.data?.id;
    if (userId && responseUserId && responseUserId !== userId) {
      console.error("❌ Profile response belongs to different user!");
      throw new Error("Profile data mismatch - received data for different user");
    }
    
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch profile. Please try again.";
    return rejectWithValue(message);
  }
});

// Add work experience
export const addWorkExperience = createAsyncThunk<
  ProfileResponse,
  ExperienceData,
  { rejectValue: string }
>("profile/addWorkExperience", async (data, { rejectWithValue }) => {
  try {
    const response = await addExperience(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add work experience. Please try again.";
    return rejectWithValue(message);
  }
});

// Update work experience
export const updateWorkExperience = createAsyncThunk<
  ProfileResponse,
  { experienceId: string; data: Partial<ExperienceData> },
  { rejectValue: string }
>(
  "profile/updateWorkExperience",
  async ({ experienceId, data }, { rejectWithValue }) => {
    try {
      const response = await updateExperience(experienceId, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update work experience. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Delete work experience
export const removeWorkExperience = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeWorkExperience", async (experienceId, { rejectWithValue }) => {
  try {
    const response = await deleteExperience(experienceId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete work experience. Please try again.";
    return rejectWithValue(message);
  }
});

// Add education
export const addEducationEntry = createAsyncThunk<
  ProfileResponse,
  EducationData,
  { rejectValue: string }
>("profile/addEducation", async (data, { rejectWithValue }) => {
  try {
    const response = await addEducation(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add education. Please try again.";
    return rejectWithValue(message);
  }
});

// Update education
export const updateEducationEntry = createAsyncThunk<
  ProfileResponse,
  { educationId: string; data: Partial<EducationData> },
  { rejectValue: string }
>(
  "profile/updateEducation",
  async ({ educationId, data }, { rejectWithValue }) => {
    try {
      const response = await updateEducation(educationId, data);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update education. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Delete education
export const removeEducationEntry = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeEducation", async (educationId, { rejectWithValue }) => {
  try {
    const response = await deleteEducation(educationId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete education. Please try again.";
    return rejectWithValue(message);
  }
});

// Add award
export const addAwardEntry = createAsyncThunk<
  ProfileResponse,
  AwardData,
  { rejectValue: string }
>("profile/addAward", async (data, { rejectWithValue }) => {
  try {
    const response = await addAward(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add award. Please try again.";
    return rejectWithValue(message);
  }
});

// Update award
export const updateAwardEntry = createAsyncThunk<
  ProfileResponse,
  { awardId: string; data: Partial<AwardData> },
  { rejectValue: string }
>("profile/updateAward", async ({ awardId, data }, { rejectWithValue }) => {
  try {
    const response = await updateAward(awardId, data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update award. Please try again.";
    return rejectWithValue(message);
  }
});

// Delete award
export const removeAwardEntry = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeAward", async (awardId, { rejectWithValue }) => {
  try {
    const response = await deleteAward(awardId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete award. Please try again.";
    return rejectWithValue(message);
  }
});

// Add video
export const addVideoEntry = createAsyncThunk<
  ProfileResponse,
  VideoData,
  { rejectValue: string }
>("profile/addVideo", async (data, { rejectWithValue }) => {
  try {
    const response = await addVideo(data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add video. Please try again.";
    return rejectWithValue(message);
  }
});

// Update video
export const updateVideoEntry = createAsyncThunk<
  ProfileResponse,
  { videoId: string; data: Partial<VideoData> },
  { rejectValue: string }
>("profile/updateVideo", async ({ videoId, data }, { rejectWithValue }) => {
  try {
    const response = await updateVideo(videoId, data);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update video. Please try again.";
    return rejectWithValue(message);
  }
});

// Delete video
export const removeVideoEntry = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>("profile/removeVideo", async (videoId, { rejectWithValue }) => {
  try {
    const response = await deleteVideo(videoId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete video. Please try again.";
    return rejectWithValue(message);
  }
});

// Update skills
export const updateProfileSkills = createAsyncThunk<
  ProfileResponse,
  SkillData[],
  { rejectValue: string }
>("profile/updateSkills", async (skills, { rejectWithValue }) => {
  try {
    const response = await updateSkills(skills);
    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update skills. Please try again.";
    return rejectWithValue(message);
  }
});

/**
 * Update bio - Automatically uses role-specific endpoint based on user role
 * Uses: /api/profile/speaker/bio for speakers, /api/profile/organiser/bio for organisers
 */
export const updateProfileBio = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string; state: RootState }
>("profile/updateBio", async (bio, { rejectWithValue, getState }) => {
  try {
    // Get user role from multiple sources (auth state, profile data, current route)
    const authUser = getState().auth.user;
    const profileData = getState().profile.data;
    const currentPath = getCurrentPathname();
    
    // Try to get role from multiple sources
    let userRole = 
      authUser?.role || 
      (authUser as any)?.userRole ||
      profileData?.role ||
      profileData?.user?.role;
    
    // Priority: Check current route first (most reliable for profile pages)
    // This ensures we use the correct endpoint based on which profile page the user is on
    if (currentPath) {
      if (currentPath.includes("/profile/organiser")) {
        userRole = "organiser";
        console.log("📍 Detected organiser from route path");
      } else if (currentPath.includes("/profile/speaker")) {
        userRole = "speaker";
        console.log("📍 Detected speaker from route path");
      } else if (currentPath.includes("/profile/trainer")) {
        userRole = "trainer";
        console.log("📍 Detected trainer from route path");
      }
    }
    
    // If role not found from route, try to infer from auth/profile data
    if (!userRole) {
      if (authUser?.role) {
        userRole = authUser.role;
        console.log("📍 Detected role from auth user:", userRole);
      } else if (profileData?.role) {
        userRole = profileData.role;
        console.log("📍 Detected role from profile data:", userRole);
      }
    }
    
    // Normalize role (handle both spellings and case)
    const normalizedRole = userRole?.toLowerCase()?.trim();
    
    console.log("🔍 updateProfileBio - Final user role:", userRole, "Normalized:", normalizedRole);
    console.log("🔍 Current path:", currentPath);
    console.log("🔍 Auth user:", authUser);
    console.log("🔍 Profile data:", profileData);
    
    // Use role-specific endpoints
    let response: ProfileResponse;
    if (normalizedRole === "speaker") {
      console.log("📝 Using speaker bio endpoint");
      response = await updateSpeakerBio(bio);
    } else if (normalizedRole === "organiser" || normalizedRole === "organizer") {
      console.log("📝 Using organiser bio endpoint");
      response = await updateOrganiserBio(bio);
    } else {
      // Fallback to legacy endpoint - but log warning
      console.warn("⚠️ Role not detected, using legacy endpoint. Role was:", userRole);
      console.warn("⚠️ Trying legacy endpoint /api/profile/bio");
      // If we're on organiser page but role not detected, still try organiser endpoint
      if (currentPath?.includes("/profile/organiser")) {
        console.log("⚠️ On organiser page but role not detected, trying organiser endpoint anyway");
        try {
          response = await updateOrganiserBio(bio);
        } catch (error) {
          console.warn("⚠️ Organiser endpoint failed, falling back to legacy");
          response = await updateBio(bio);
        }
      } else {
        response = await updateBio(bio);
      }
    }
    
    return response;
  } catch (error) {
    console.error("❌ updateProfileBio error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update bio. Please try again.";
    return rejectWithValue(message);
  }
});

/**
 * Profile Slice
 */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    resetProfile(state) {
      state.data = null;
      state.status = "idle";
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch profile";
      })
      // Add work experience
      .addCase(addWorkExperience.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addWorkExperience.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addWorkExperience.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add work experience";
      })
      // Update work experience
      .addCase(updateWorkExperience.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateWorkExperience.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateWorkExperience.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update work experience";
      })
      // Remove work experience
      .addCase(removeWorkExperience.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeWorkExperience.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeWorkExperience.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove work experience";
      })
      // Add education
      .addCase(addEducationEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addEducationEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addEducationEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add education";
      })
      // Update education
      .addCase(updateEducationEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateEducationEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateEducationEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update education";
      })
      // Remove education
      .addCase(removeEducationEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeEducationEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeEducationEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove education";
      })
      // Add award
      .addCase(addAwardEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addAwardEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addAwardEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add award";
      })
      // Update award
      .addCase(updateAwardEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAwardEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateAwardEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update award";
      })
      // Remove award
      .addCase(removeAwardEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeAwardEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeAwardEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove award";
      })
      // Add video
      .addCase(addVideoEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addVideoEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(addVideoEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add video";
      })
      // Update video
      .addCase(updateVideoEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateVideoEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateVideoEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update video";
      })
      // Remove video
      .addCase(removeVideoEntry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeVideoEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(removeVideoEntry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to remove video";
      })
      // Update skills
      .addCase(updateProfileSkills.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfileSkills.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfileSkills.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update skills";
      })
      // Update bio
      .addCase(updateProfileBio.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfileBio.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(updateProfileBio.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update bio";
      });
  },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile;
export const selectProfileData = (state: { profile: ProfileState }) =>
  state.profile.data;
export const selectProfileStatus = (state: { profile: ProfileState }) =>
  state.profile.status;
export const selectProfileError = (state: { profile: ProfileState }) =>
  state.profile.error;

export default profileSlice.reducer;

