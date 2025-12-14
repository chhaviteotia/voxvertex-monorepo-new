import mongoose from "mongoose";

/**
 * Availability Model
 * Stores speaker availability for specific dates with event types, modes, and time slots
 */

const availabilitySchema = new mongoose.Schema(
  {
    // Reference to the speaker/user
    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Date for this availability (stored as YYYY-MM-DD string for easy querying)
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    
    // Event types with pricing
    eventTypes: [
      {
        category: {
          type: String,
          required: true,
          trim: true,
        },
        events: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
            currency: {
              type: String,
              default: "INR",
              trim: true,
            },
          },
        ],
      },
    ],
    
    // Preferred delivery modes (Online, Offline, Hybrid)
    modes: [
      {
        type: String,
        enum: ["Online", "Offline", "Hybrid"],
        trim: true,
      },
    ],
    
    // Time slots available on this date
    timeSlots: [
      {
        slot: {
          type: String,
          required: true,
          trim: true,
        },
        startTime: {
          type: String,
          required: true,
          trim: true,
        },
        endTime: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    
    // Additional notes or preferences
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
availabilitySchema.index({ speaker: 1, date: 1 }, { unique: true });
availabilitySchema.index({ date: 1 });

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;

