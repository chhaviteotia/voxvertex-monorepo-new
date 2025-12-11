import User from "../../user/models/user.js";
import Profile from "../../profile/models/profile.js";
import mongoose from "mongoose";

/**
 * Validate if a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Get all experts (speakers and trainers) for marketplace
 * @param {Object} filters - Optional filters (search, role, industry, country, etc.)
 * @returns {Promise<Array>} Array of expert users with their profiles
 */
export const getAllExperts = async (filters = {}) => {
  try {
    const {
      search,
      role, // 'speaker' or 'trainer' or undefined for both
      industry,
      country,
      city,
      limit = 50,
      skip = 0,
    } = filters;

    // Build query for experts (speakers and trainers)
    const query = {
      role: { $in: ["speaker", "trainer"] },
      registrationCompleted: true, // Only show registered experts
      isActive: true, // Only show active experts
    };

    // Filter by role if specified
    if (role && (role === "speaker" || role === "trainer")) {
      query.role = role;
    }

    // Filter by industry if specified
    if (industry) {
      query.industry = { $regex: industry, $options: "i" };
    }

    // Filter by country if specified
    if (country) {
      query.country = { $regex: country, $options: "i" };
    }

    // Filter by city if specified
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    // Search filter (searches in fullName, email, industry, city, country)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch users with populated profiles
    const users = await User.find(query)
      .populate("profile", "professionalTitle bio profileImageUrl trainingCategories industriesServed")
      .select("-password") // Exclude password
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Transform users to marketplace format
    const experts = users.map((user) => {
      const profile = user.profile || {};
      
      // Get initials from fullName
      const getInitials = (name) => {
        if (!name) return "EX";
        const parts = name.trim().split(" ");
        return parts
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      };

      // Get tags from training categories or industries served
      const tags = [];
      if (profile.trainingCategories && profile.trainingCategories.length > 0) {
        profile.trainingCategories.slice(0, 3).forEach((cat) => {
          if (cat.title) tags.push(cat.title);
        });
      }
      if (tags.length < 3 && profile.industriesServed && profile.industriesServed.length > 0) {
        profile.industriesServed.slice(0, 3 - tags.length).forEach((ind) => {
          if (ind.name) tags.push(ind.name);
        });
      }
      // Fallback to industry from user if no tags
      if (tags.length === 0 && user.industry) {
        tags.push(user.industry);
      }

      return {
        id: user._id.toString(),
        name: user.fullName || "Expert",
        initials: getInitials(user.fullName),
        title: profile.professionalTitle || user.role || "Expert",
        rating: 4.5, // Default rating (can be calculated from reviews if available)
        reviews: 0, // Default reviews (can be fetched from reviews collection if available)
        sessions: 0, // Default sessions (can be calculated from bookings if available)
        description: profile.bio || `Experienced ${user.role} specializing in ${user.industry || "various fields"}.`,
        tags: tags.length > 0 ? tags : ["Expert"],
        rate: "$200/hr", // Default rate (can be fetched from training calendar if available)
        availability: "Available", // Default availability (can be calculated from calendar if available)
        role: user.role,
        country: user.country || "",
        city: user.city || "",
        industry: user.industry || "",
        profileImageUrl: profile.profileImageUrl || null,
      };
    });

    return experts;
  } catch (error) {
    throw new Error(`Failed to fetch experts: ${error.message}`);
  }
};

/**
 * Get a single expert by ID
 * @param {String} expertId - Expert user ID
 * @returns {Promise<Object>} Expert user with profile
 */
export const getExpertById = async (expertId) => {
  try {
    if (!expertId) {
      throw new Error("Expert ID is required");
    }

    // Validate ObjectId format
    if (!isValidObjectId(expertId)) {
      return null;
    }

    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(expertId),
      role: { $in: ["speaker", "trainer"] },
      registrationCompleted: true,
      isActive: true,
    })
      .populate("profile", "professionalTitle bio profileImageUrl trainingCategories industriesServed experience education certifications")
      .select("-password")
      .lean();

    if (!user) {
      return null;
    }

    const profile = user.profile || {};
    
    // Get initials from fullName
    const getInitials = (name) => {
      if (!name) return "EX";
      const parts = name.trim().split(" ");
      return parts
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Get tags from training categories or industries served
    const tags = [];
    if (profile.trainingCategories && profile.trainingCategories.length > 0) {
      profile.trainingCategories.slice(0, 3).forEach((cat) => {
        if (cat.title) tags.push(cat.title);
      });
    }
    if (tags.length < 3 && profile.industriesServed && profile.industriesServed.length > 0) {
      profile.industriesServed.slice(0, 3 - tags.length).forEach((ind) => {
        if (ind.name) tags.push(ind.name);
      });
    }
    // Fallback to industry from user if no tags
    if (tags.length === 0 && user.industry) {
      tags.push(user.industry);
    }

    // Transform experience list
    const experienceList = (profile.experience || []).map((exp) => ({
      role: exp.title || "",
      company: exp.company || "",
      duration: `${exp.startDate || ""}${exp.endDate ? `-${exp.endDate}` : ""}`,
      description: exp.description || "",
    }));

    // Transform education list
    const educationList = (profile.education || []).map((edu) => ({
      degree: edu.degree || "",
      institution: edu.institution || "",
      year: edu.year || "",
    }));

    // Transform certifications
    const certifications = (profile.certifications || []).map((cert) => ({
      name: cert.title || "",
      issuer: cert.issuer || "",
      year: cert.issued || "",
    }));

    return {
      id: user._id.toString(),
      name: user.fullName || "Expert",
      initials: getInitials(user.fullName),
      title: profile.professionalTitle || user.role || "Expert",
      rating: 4.5, // Default rating (can be calculated from reviews if available)
      reviews: 0, // Default reviews (can be fetched from reviews collection if available)
      sessions: 0, // Default sessions (can be calculated from bookings if available)
      description: profile.bio || `Experienced ${user.role} specializing in ${user.industry || "various fields"}.`,
      tags: tags.length > 0 ? tags : ["Expert"],
      rate: "$200/hr", // Default rate (can be fetched from training calendar if available)
      availability: "Available", // Default availability (can be calculated from calendar if available)
      role: user.role,
      country: user.country || "",
      city: user.city || "",
      industry: user.industry || "",
      profileImageUrl: profile.profileImageUrl || null,
      location: `${user.city || ""}${user.city && user.country ? ", " : ""}${user.country || ""}`.trim() || "Not specified",
      responseTime: "Responds within 2 hours",
      languages: (profile.languages || []).map((lang) => lang.name).filter(Boolean),
      experience: profile.yearsOfExperience ? `${profile.yearsOfExperience}+ years experience` : "15+ years experience",
      experienceList,
      educationList,
      certifications,
      reviewsList: [], // Can be populated from reviews collection if available
    };
  } catch (error) {
    throw new Error(`Failed to fetch expert: ${error.message}`);
  }
};

/**
 * Get expert count for pagination
 */
export const getExpertCount = async (filters = {}) => {
  try {
    const { search, role, industry, country, city } = filters;

    const query = {
      role: { $in: ["speaker", "trainer"] },
      registrationCompleted: true,
      isActive: true,
    };

    if (role && (role === "speaker" || role === "trainer")) {
      query.role = role;
    }

    if (industry) {
      query.industry = { $regex: industry, $options: "i" };
    }

    if (country) {
      query.country = { $regex: country, $options: "i" };
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    return await User.countDocuments(query);
  } catch (error) {
    throw new Error(`Failed to count experts: ${error.message}`);
  }
};

