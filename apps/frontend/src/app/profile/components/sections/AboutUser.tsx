"use client";

import { useState, useEffect, Suspense, memo, useMemo, useRef } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, selectProfileData, resetProfile } from "@/store/slices/profileSlice";
import dynamic from "next/dynamic";
import HeaderSection from "./aboutUser/HeaderSection";
import InfoCard from "../../components/common/InfoCard";
import ContactCard from "../../components/common/ContactCard";

// Custom inline SVG as a React component
const EventIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 14 14"
    className={className}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
    >
      <path d="M9.5 3.5h4v4"></path>
      <path d="M13.5 3.5L7.85 9.15a.5.5 0 0 1-.7 0l-2.3-2.3a.5.5 0 0 0-.7 0L.5 10.5"></path>
    </g>
  </svg>
);

/**
 * AboutUser Component - Improved with TypeScript and better structure
 * Displays user profile overview with stats and contact information
 */
const AboutUser = memo(() => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery();
  
  // Get profile data and status from profile slice
  const profileData = useAppSelector(selectProfileData);
  const profileStatus = useAppSelector((state) => state.profile.status);
  const profileError = useAppSelector((state) => state.profile.error);
  
  console.log("🔵 AboutUser - Profile state:", {
    hasProfileData: !!profileData,
    profileStatus,
    profileError,
    profileDataName: profileData?.fullName || profileData?.firstName,
  });

  // Default fallback data
  const defaultData = {
    name: "User",
    role: "Member",
    description:
      "Welcome to your profile! Update your information to get started.",
    profilePic: null,
    domains: [],
    stats: [
      { icon: EventIcon, value: "0", label: "Total Bookings" },
      { icon: EventIcon, value: "$ 0", label: "Revenue" },
      { icon: EventIcon, value: "0", label: "Total Videos" },
      { icon: EventIcon, value: "0", label: "Available Slots" },
    ],
    contacts: [
      { icon: FiPhone, label: "Contact Number", value: "Not provided" },
      { icon: FiMail, label: "Email Address", value: "Not provided" },
      { icon: FiMapPin, label: "Location", value: "Not provided" },
    ],
  };

  const [userData, setUserData] = useState(defaultData);

  // Track last processed user ID to prevent unnecessary re-processing
  const lastProcessedUserIdRef = useRef<string | null>(null);

  // Get current user ID from auth state
  const currentUserId = auth.user?._id || auth.user?.id || currentUserData?.user?._id || currentUserData?.user?.id;

  // Reset profile data if user changes
  useEffect(() => {
    if (currentUserId && lastProcessedUserIdRef.current && lastProcessedUserIdRef.current !== currentUserId) {
      console.log("🔄 AboutUser - User changed, resetting profile data");
      dispatch(resetProfile());
      lastProcessedUserIdRef.current = null;
    }
  }, [currentUserId, dispatch]);

  // Fetch profile data on mount if not already loaded, or if user changed
  useEffect(() => {
    // Check if profile data belongs to current user
    const profileUserId = profileData?._id || profileData?.id;
    const shouldFetch = 
      (profileStatus === "idle" || profileStatus === "failed") ||
      (currentUserId && profileUserId && profileUserId !== currentUserId);
    
    if (shouldFetch) {
      console.log("🔵 AboutUser - Fetching profile data for user:", currentUserId);
      dispatch(fetchProfile());
    }
  }, [dispatch, profileStatus, currentUserId, profileData?._id]);

  useEffect(() => {
    // Prioritize profile data (from profile slice) over auth user data
    // Profile data has complete information from role-specific endpoints
    const profileUserId = profileData?._id || profileData?.id;
    
    // CRITICAL: If profile data belongs to a different user, don't use it
    if (profileData && currentUserId && profileUserId && profileUserId !== currentUserId) {
      console.error("❌ AboutUser - Profile data belongs to different user! Clearing...");
      dispatch(resetProfile());
      setIsLoading(true);
      return;
    }
    
    const user = profileData || currentUserData?.user || auth.user;
    const userId = user?._id || user?.id || null;

    console.log("🔵 AboutUser - Processing user data:", {
      hasProfileData: !!profileData,
      hasCurrentUserData: !!currentUserData?.user,
      hasAuthUser: !!auth.user,
      userId,
      currentUserId,
      profileUserId,
      profileStatus,
    });

    // If profile is still loading, wait for it (don't show default data yet)
    if (profileStatus === "loading" && !profileData) {
      console.log("🔵 AboutUser - Profile still loading, waiting...");
      setIsLoading(true);
      return;
    }

    // If no user ID after loading is complete, use default data
    if (!userId) {
      console.log("🔵 AboutUser - No user ID found, using default data");
      // Only set default if we're not still loading
      if (profileStatus !== "loading") {
        setUserData(defaultData);
        setIsLoading(false);
      }
      return;
    }

    // Skip if this is the same user we just processed AND we already have profile data
    // But always update if profile data is now available (even if same user)
    if (lastProcessedUserIdRef.current === userId && lastProcessedUserIdRef.current !== null) {
      // If we have profile data now, continue to update (profile might have changed)
      if (profileData) {
        // Continue to process and update
      } else {
        // Same user, no profile data yet - skip processing
        setIsLoading(false);
        return;
      }
    }

    // Extract domains/expertise from user data
    const domains =
      (user as any).areaOfExpertise ||
      ((user as any).roleSpecificData?.activities || []).slice(0, 5) ||
      defaultData.domains;

    // Prepare user data - prioritize firstName + lastName, then fullName, then default
    // Check profile data first, then auth user data
    let userName = defaultData.name;
    const firstName = (user as any).firstName || "";
    const lastName = (user as any).lastName || "";
    const fullName = (user as any).fullName || "";

    // Debug: Log user data
    console.log("🔍 AboutUser - User data:", {
      firstName,
      lastName,
      fullName,
      user: user,
      profileData: profileData,
    });

    if (firstName && lastName) {
      userName = `${firstName} ${lastName}`.trim();
    } else if (fullName) {
      userName = fullName;
    }

    console.log("🔍 AboutUser - Final userName:", userName);

    const dynamicUserData = {
      name: userName,
      role:
        (user as any).professionalTitle ||
        ((user as any).role === "speaker"
          ? "Professional Speaker"
          : (user as any).role === "organizer" ||
            (user as any).role === "organiser"
          ? "Event Organiser"
          : (user as any).role) ||
        defaultData.role,
      description: (user as any).bio || defaultData.description,
      profilePic: (user as any).profileImageUrl || defaultData.profilePic,
      domains: domains,
      stats: defaultData.stats, // Stats will be calculated from API later
      contacts: [
        {
          icon: FiPhone,
          label: "Contact Number",
          value:
            (user as any).mobileNo || (user as any).phone || "Not provided",
        },
        {
          icon: FiMail,
          label: "Email Address",
          value: (user as any).email || "Not provided",
        },
        {
          icon: FiMapPin,
          label: "Location",
          value: (user as any).location || "Not provided",
        },
      ],
    };

    // Update state and mark this user as processed
    setUserData(dynamicUserData);
    lastProcessedUserIdRef.current = userId;
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, profileStatus, currentUserData?.user?._id, auth.user?._id, currentUserId]);

  // Show loading state if we're loading profile or user data
  const isActuallyLoading = 
    (isLoading || isUserLoading || profileStatus === "loading") && 
    !profileData && 
    !currentUserData?.user && 
    !auth.user;
  
  if (isActuallyLoading) {
    return (
      <div className="w-full h-auto bg-[#FFFDFB] shadow-md rounded-lg p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-auto bg-[#FFFDFB] shadow-md rounded-lg rounded-tl-none rounded-bl-none">
      <Suspense
        fallback={
          <div className="h-48 bg-[#FF6B35] animate-pulse rounded-t-lg"></div>
        }
      >
        <HeaderSection
          name={userData.name}
          role={userData.role}
          description={userData.description}
          domains={userData.domains}
          profilePic={userData.profilePic}
        />
      </Suspense>

      {/* Info Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-3 sm:p-4 md:p-5 lg:p-6">
        {userData.stats.map((stat, idx) => (
          <Suspense
            key={idx}
            fallback={
              <div className="h-24 bg-[#FFF1EB] animate-pulse rounded-xl"></div>
            }
          >
            <InfoCard {...stat} />
          </Suspense>
        ))}
      </div>

      {/* Contact Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-3 sm:px-4 md:px-5 lg:px-6 pb-4 sm:pb-5 md:pb-6">
        {userData.contacts.map((contact, idx) => (
          <Suspense
            key={idx}
            fallback={
              <div className="h-16 bg-[#FFF1EB] animate-pulse rounded-xl"></div>
            }
          >
            <ContactCard {...contact} />
          </Suspense>
        ))}
      </div>
    </div>
  );
});

AboutUser.displayName = "AboutUser";

export default AboutUser;
