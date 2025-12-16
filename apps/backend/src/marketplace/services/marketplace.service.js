import User from "../../user/models/user.js";
import Profile from "../../profile/models/profile.js";
import Availability from "../../availability/models/availability.js";
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
      roles, // Array of roles ['speaker', 'trainer']
      role, // Single role (for backward compatibility)
      industries, // Array of industries
      industry, // Single industry (for backward compatibility)
      expertise, // Array of expertise areas
      sessionTypes, // Array of session types
      sessionFormats, // Array of session formats ['Online', 'Offline', 'Hybrid']
      sessionDurations, // Array of session durations
      audienceTypes, // Array of audience types
      languages, // Array of languages
      availability, // Array of availability options
      ratings, // Array of rating filters (e.g., ['4.0+ Stars', '5.0 Star'])
      experienceLevels, // Array of experience level ranges
      verificationStatus, // Array of verification statuses ['Platform Verified', 'Credentials Verified']
      priceMin, // Minimum price
      priceMax, // Maximum price
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

    // Filter by role(s) if specified
    const roleFilter = roles || (role ? [role] : []);
    if (roleFilter.length > 0) {
      const validRoles = roleFilter.filter((r) => r === "speaker" || r === "trainer");
      if (validRoles.length > 0) {
        query.role = validRoles.length === 1 ? validRoles[0] : { $in: validRoles };
      }
    }

    // Filter by industry/industries if specified
    const industryFilter = industries || (industry ? [industry] : []);
    if (industryFilter.length > 0) {
      query.industry = { $in: industryFilter.map((ind) => new RegExp(ind, "i")) };
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

    // Fetch users with populated profiles (including trainingCalendar for trainers)
    const users = await User.find(query)
      .populate("profile", "professionalTitle bio profileImageUrl trainingCategories industriesServed trainingCalendar areaOfExpertise languages certifications clientTypesServed workPreferences yearsOfExperience")
      .select("-password") // Exclude password
      .limit(parseInt(limit) * 2) // Fetch more to account for filtering
      .skip(parseInt(skip))
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Transform users to marketplace format (with async price calculation and filtering)
    const expertsWithData = await Promise.all(
      users.map(async (user) => {
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

        // Calculate price based on role
        let rate = "Price on request";
        let priceValue = null;
        let currency = "INR";

        if (user.role === "trainer" && profile.trainingCalendar && profile.trainingCalendar.length > 0) {
          // For trainers: Get prices from trainingCalendar
          const prices = profile.trainingCalendar
            .filter((cal) => cal.price && cal.price.trim())
            .map((cal) => {
              // Extract numeric value from price string (e.g., "₹5000", "5000", "$200/hr")
              const priceStr = cal.price.replace(/[^\d.]/g, "");
              return parseFloat(priceStr) || 0;
            })
            .filter((p) => p > 0);

          if (prices.length > 0) {
            // Use minimum price or average price
            priceValue = Math.min(...prices);
            // Try to detect currency from first price entry
            const firstPrice = profile.trainingCalendar.find((cal) => cal.price && cal.price.trim());
            if (firstPrice) {
              if (firstPrice.price.includes("$")) currency = "USD";
              else if (firstPrice.price.includes("€")) currency = "EUR";
              else if (firstPrice.price.includes("£")) currency = "GBP";
              else currency = "INR";
            }
            const priceType = firstPrice?.priceType || "session";
            rate = `${currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}${priceValue.toLocaleString()}/${priceType === "hour" || priceType === "hr" ? "hr" : "session"}`;
          }
        } else if (user.role === "speaker") {
          // For speakers: Get prices from availability
          try {
            const availabilities = await Availability.find({
              speaker: user._id,
            })
              .select("eventTypes")
              .lean();

            const prices = [];
            availabilities.forEach((avail) => {
              if (avail.eventTypes && Array.isArray(avail.eventTypes)) {
                avail.eventTypes.forEach((category) => {
                  if (category.events && Array.isArray(category.events)) {
                    category.events.forEach((event) => {
                      if (event.price && event.price > 0) {
                        prices.push({
                          price: event.price,
                          currency: event.currency || "INR",
                        });
                      }
                    });
                  }
                });
              }
            });

            if (prices.length > 0) {
              // Use minimum price
              const minPrice = prices.reduce((min, p) => (p.price < min.price ? p : min), prices[0]);
              priceValue = minPrice.price;
              currency = minPrice.currency;
              const currencySymbol =
                currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
              rate = `${currencySymbol}${priceValue.toLocaleString()}/event`;
            }
          } catch (error) {
            // If error fetching availability, keep default rate
            console.error(`Error fetching availability for speaker ${user._id}:`, error.message);
          }
        }

        // Calculate years of experience
        const yearsOfExperience = profile.yearsOfExperience || 0;

        // Check if has certifications (for Credentials Verified)
        const hasCertifications = profile.certifications && profile.certifications.length > 0;

        // Check platform verified (registrationCompleted is already in query)
        const platformVerified = user.registrationCompleted === true;

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
          rate: rate,
          priceValue: priceValue, // Store numeric price for filtering
          availability: "Available", // Default availability (can be calculated from calendar if available)
          role: user.role,
          country: user.country || "",
          city: user.city || "",
          industry: user.industry || "",
          profileImageUrl: profile.profileImageUrl || null,
          // Additional data for filtering
          profile: {
            areaOfExpertise: profile.areaOfExpertise || [],
            trainingCategories: profile.trainingCategories || [],
            industriesServed: profile.industriesServed || [],
            languages: profile.languages || [],
            clientTypesServed: profile.clientTypesServed || [],
            workPreferences: profile.workPreferences || {},
            trainingCalendar: profile.trainingCalendar || [],
            yearsOfExperience,
            hasCertifications,
            platformVerified,
          },
        };
      })
    );

    // Apply additional filters
    let filteredExperts = expertsWithData;

    // Filter by expertise
    if (expertise && expertise.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const expertAreas = [
          ...(expert.profile.areaOfExpertise || []),
          ...(expert.profile.trainingCategories?.map((cat) => cat.title) || []),
        ];
        return expertise.some((exp) =>
          expertAreas.some((area) => area?.toLowerCase().includes(exp.toLowerCase()))
        );
      });
    }

    // Filter by session types (from trainingCategories or workPreferences)
    if (sessionTypes && sessionTypes.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const categories = expert.profile.trainingCategories?.map((cat) => cat.title) || [];
        return sessionTypes.some((type) =>
          categories.some((cat) => cat?.toLowerCase().includes(type.toLowerCase()))
        );
      });
    }

    // Filter by session formats (from workPreferences or trainingCalendar)
    if (sessionFormats && sessionFormats.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const modes = expert.profile.workPreferences?.workArrangements || [];
        const calendarModes = expert.profile.trainingCalendar?.map((cal) => cal.mode) || [];
        const allModes = [...modes, ...calendarModes];
        return sessionFormats.some((format) =>
          allModes.some((mode) => mode?.toLowerCase() === format.toLowerCase())
        );
      });
    }

    // Filter by session durations (from workPreferences)
    if (sessionDurations && sessionDurations.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const durations = expert.profile.workPreferences?.sessionDurations || [];
        return sessionDurations.some((duration) =>
          durations.some((d) => d?.toLowerCase().includes(duration.toLowerCase()))
        );
      });
    }

    // Filter by audience types (from clientTypesServed)
    if (audienceTypes && audienceTypes.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const clientTypes = expert.profile.clientTypesServed?.map((ct) => ct.name) || [];
        return audienceTypes.some((type) =>
          clientTypes.some((ct) => ct?.toLowerCase().includes(type.toLowerCase()))
        );
      });
    }

    // Filter by languages
    if (languages && languages.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const expertLanguages = expert.profile.languages?.map((lang) => lang.name) || [];
        return languages.some((lang) =>
          expertLanguages.some((el) => el?.toLowerCase() === lang.toLowerCase())
        );
      });
    }

    // Filter by availability (check Availability collection for speakers)
    if (availability && availability.length > 0) {
      const now = new Date();
      const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      filteredExperts = await Promise.all(
        filteredExperts.map(async (expert) => {
          if (expert.role === "speaker") {
            try {
              const today = now.toISOString().split("T")[0];
              const thisWeekStr = thisWeek.toISOString().split("T")[0];
              const thisMonthStr = thisMonth.toISOString().split("T")[0];

              let dateQuery = {};
              if (availability.includes("Available This Week")) {
                dateQuery = { $gte: today, $lte: thisWeekStr };
              } else if (availability.includes("Available This Month")) {
                dateQuery = { $gte: today, $lte: thisMonthStr };
              }

              const availabilities = await Availability.find({
                speaker: new mongoose.Types.ObjectId(expert.id),
                date: dateQuery,
              }).lean();

              if (availabilities.length === 0) return null;
            } catch (error) {
              return null;
            }
          }
          return expert;
        })
      );
      filteredExperts = filteredExperts.filter((expert) => expert !== null);
    }

    // Filter by ratings
    if (ratings && ratings.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const expertRating = expert.rating || 0;
        return ratings.some((ratingFilter) => {
          if (ratingFilter === "5.0 Star and above") return expertRating >= 5.0;
          if (ratingFilter === "4.0 Star") return expertRating >= 4.0 && expertRating < 4.5;
          if (ratingFilter === "3.0 Star") return expertRating >= 3.0 && expertRating < 4.0;
          if (ratingFilter === "2.0 Star") return expertRating >= 2.0 && expertRating < 3.0;
          if (ratingFilter === "1.0 Star") return expertRating >= 1.0 && expertRating < 2.0;
          return false;
        });
      });
    }

    // Filter by experience levels
    if (experienceLevels && experienceLevels.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        const years = expert.profile.yearsOfExperience || 0;
        return experienceLevels.some((level) => {
          if (level === "0-2 years") return years >= 0 && years < 2;
          if (level === "2-5 years") return years >= 2 && years < 5;
          if (level === "5-8 years") return years >= 5 && years < 8;
          if (level === "8-10 years") return years >= 8 && years < 10;
          if (level === "10-15 years") return years >= 10 && years < 15;
          if (level === "15-20 years") return years >= 15 && years < 20;
          if (level === "20+ years") return years >= 20;
          return false;
        });
      });
    }

    // Filter by verification status
    if (verificationStatus && verificationStatus.length > 0) {
      filteredExperts = filteredExperts.filter((expert) => {
        return verificationStatus.some((status) => {
          if (status === "Platform Verified") return expert.profile.platformVerified === true;
          if (status === "Credentials Verified") return expert.profile.hasCertifications === true;
          return false;
        });
      });
    }

    // Filter by price range
    if (priceMin || priceMax) {
      filteredExperts = filteredExperts.filter((expert) => {
        const price = expert.priceValue;
        if (!price) return false;
        if (priceMin && price < parseFloat(priceMin)) return false;
        if (priceMax && price > parseFloat(priceMax)) return false;
        return true;
      });
    }

    // Remove profile data before returning (clean up)
    const experts = filteredExperts.slice(0, parseInt(limit)).map((expert) => {
      const { profile, priceValue, ...cleanExpert } = expert;
      return cleanExpert;
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
      .populate("profile", "professionalTitle bio profileImageUrl trainingCategories industriesServed experience education certifications trainingCalendar")
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

    // Calculate price based on role
    let rate = "Price on request";
    let priceValue = null;
    let currency = "INR";

    if (user.role === "trainer" && profile.trainingCalendar && profile.trainingCalendar.length > 0) {
      // For trainers: Get prices from trainingCalendar
      const prices = profile.trainingCalendar
        .filter((cal) => cal.price && cal.price.trim())
        .map((cal) => {
          // Extract numeric value from price string (e.g., "₹5000", "5000", "$200/hr")
          const priceStr = cal.price.replace(/[^\d.]/g, "");
          return parseFloat(priceStr) || 0;
        })
        .filter((p) => p > 0);

      if (prices.length > 0) {
        // Use minimum price
        priceValue = Math.min(...prices);
        // Try to detect currency from first price entry
        const firstPrice = profile.trainingCalendar.find((cal) => cal.price && cal.price.trim());
        if (firstPrice) {
          if (firstPrice.price.includes("$")) currency = "USD";
          else if (firstPrice.price.includes("€")) currency = "EUR";
          else if (firstPrice.price.includes("£")) currency = "GBP";
          else currency = "INR";
        }
        const priceType = firstPrice?.priceType || "session";
        rate = `${currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹"}${priceValue.toLocaleString()}/${priceType === "hour" || priceType === "hr" ? "hr" : "session"}`;
      }
    } else if (user.role === "speaker") {
      // For speakers: Get prices from availability
      try {
        const availabilities = await Availability.find({
          speaker: user._id,
        })
          .select("eventTypes")
          .lean();

        const prices = [];
        availabilities.forEach((avail) => {
          if (avail.eventTypes && Array.isArray(avail.eventTypes)) {
            avail.eventTypes.forEach((category) => {
              if (category.events && Array.isArray(category.events)) {
                category.events.forEach((event) => {
                  if (event.price && event.price > 0) {
                    prices.push({
                      price: event.price,
                      currency: event.currency || "INR",
                    });
                  }
                });
              }
            });
          }
        });

        if (prices.length > 0) {
          // Use minimum price
          const minPrice = prices.reduce((min, p) => (p.price < min.price ? p : min), prices[0]);
          priceValue = minPrice.price;
          currency = minPrice.currency;
          const currencySymbol =
            currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
          rate = `${currencySymbol}${priceValue.toLocaleString()}/event`;
        }
      } catch (error) {
        // If error fetching availability, keep default rate
        console.error(`Error fetching availability for speaker ${user._id}:`, error.message);
      }
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
      rate: rate,
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

