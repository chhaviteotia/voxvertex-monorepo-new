import mongoose from "mongoose";

/**
 * Profile Model
 * Stores all profile-related information for users
 * Separated from User model for better organization and scalability
 */

const profileSchema = new mongoose.Schema(
  {
    // Reference to the user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    
    // User name fields (synced from User model for easy access)
    fullName: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    
    // Basic profile information
    professionalTitle: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    timeZone: {
      type: String,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    
    // Contact information
    website: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    
    // Work experience array
    experience: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        company: {
          type: String,
          required: true,
          trim: true,
        },
        startDate: {
          type: String,
          required: true,
          trim: true,
        },
        endDate: {
          type: String,
          trim: true,
        },
        location: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    
    // Education array
    education: [
      {
        degree: {
          type: String,
          required: true,
          trim: true,
        },
        institution: {
          type: String,
          required: true,
          trim: true,
        },
        fieldOfStudy: {
          type: String,
          required: true,
          trim: true,
        },
        location: {
          type: String,
          trim: true,
        },
        year: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    
    // Certifications array
    certifications: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        issuer: {
          type: String,
          required: true,
          trim: true,
        },
        issued: {
          type: String,
          required: true,
          trim: true,
        },
        validUntil: {
          type: String,
          trim: true,
        },
        idNumber: {
          type: String,
          trim: true,
        },
        lifetime: {
          type: Boolean,
          default: false,
        },
      },
    ],
    
    // Training categories array
    trainingCategories: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          required: true,
          trim: true,
        },
        experience: {
          type: String,
          required: true,
          trim: true,
        },
        subtopics: [
          {
            type: String,
            trim: true,
          },
        ],
        samplePrograms: {
          type: String,
          trim: true,
        },
        success: {
          type: String,
          trim: true,
        },
      },
    ],
    
    // Languages array
    languages: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        proficiency: {
          type: String,
          required: true,
          trim: true,
        },
        canDeliver: {
          type: Boolean,
          default: false,
        },
      },
    ],
    
    // Industries served array
    industriesServed: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    
    // Client types served array
    clientTypesServed: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    
    // Work preferences
    workPreferences: {
      workArrangements: [
        {
          type: String,
          trim: true,
        },
      ],
      sessionDurations: [
        {
          type: String,
          trim: true,
        },
      ],
      geographicPreference: [
        {
          type: String,
          trim: true,
        },
      ],
      travelWillingness: [
        {
          type: String,
          trim: true,
        },
      ],
      travelDetails: {
        type: String,
        trim: true,
      },
    },
    
    // Skills assessment
    skillsAssessment: [
      {
        category: {
          type: String,
          required: true,
          trim: true,
        },
        skills: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            rating: {
              type: Number,
              min: 0,
              max: 5,
              default: 0,
            },
            evidence: {
              type: String,
              trim: true,
            },
            tools: {
              type: String,
              trim: true,
            },
            additionalFields: {
              type: Map,
              of: String,
            },
          },
        ],
      },
    ],
    
    // Training calendar
    trainingCalendar: [
      {
        date: {
          type: Date,
          required: true,
        },
        price: {
          type: String,
          required: true,
          trim: true,
        },
        priceType: {
          type: String,
          required: true,
          trim: true,
        },
        mode: {
          type: String,
          required: true,
          trim: true,
        },
        categories: [
          {
            type: String,
            trim: true,
          },
        ],
        availability: {
          type: String,
          trim: true,
        },
      },
    ],
    
    // Awards and certifications array (separate from certifications for profile display)
    awards: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        issuer: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],
    
    // Featured videos array
    featuredVideos: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        platform: {
          type: String,
          required: true,
          trim: true,
        },
        videoUrl: {
          type: String,
          required: true,
          trim: true,
        },
        thumbnail: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        duration: {
          type: String,
          trim: true,
        },
        tags: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],
    
    // Reviews array (stored in profile for quick access)
    reviews: [
      {
        reviewerName: {
          type: String,
          trim: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        remarks: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
        reviewType: {
          type: String,
          enum: ['event', 'collaboration', 'general'],
          default: 'general',
        },
      },
    ],
    
    // Ratings summary (calculated from reviews)
    ratings: {
      overall: {
        average: {
          type: Number,
          default: 0,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
profileSchema.index({ user: 1 });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;


