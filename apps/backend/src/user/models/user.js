import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Unified User Model
 * Handles all user types: speaker, trainer, organiser, participant
 * Fields are role-specific (some required only for certain roles)
 */

const userSchema = new mongoose.Schema(
  {
    // Common fields for all user types
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["speaker", "trainer", "organiser", "participant"],
      required: true,
    },
    
    // Verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationCompleted: {
      type: Boolean,
      default: false,
    },
    
    // Fields for Expert (speaker/trainer)
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["starter", "growth", "elite"],
      default: "starter",
    },
    subscriptionStatus: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    // Reference to Profile model (separated for better organization)
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      index: true,
    },
    
    // Fields for Organiser
    userType: {
      type: String,
      enum: ["independent", "organization"],
      trim: true,
    },
    companyTitle: {
      type: String,
      trim: true,
    },
    activities: {
      type: [String],
      default: [],
    },
    
    // Fields for Participant
    // (Can add participant-specific fields here if needed)
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
userSchema.index({ email: 1 });
// Sparse index on phoneNumber - allows multiple null values
userSchema.index({ phoneNumber: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ country: 1, city: 1 });
userSchema.index({ industry: 1 });

// Pre-save hook to normalize data and hash password
userSchema.pre("save", async function (next) {
  // Normalize email
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Normalize phone number
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.replace(/\D/g, ""); // Remove non-digits
  }
  
  // fullName is the primary field - no need to generate from firstName/lastName
  
  // Hash password if it's modified and exists
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to find by phone
userSchema.statics.findByPhone = function (phoneNumber) {
  const normalized = phoneNumber.replace(/\D/g, "");
  return this.findOne({ phoneNumber: normalized });
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).select("+password");
};

// Instance method to mark email as verified
userSchema.methods.verifyEmail = function () {
  this.emailVerified = true;
  return this.save();
};

// Instance method to mark phone as verified
userSchema.methods.verifyPhone = function () {
  this.phoneVerified = true;
  return this.save();
};

// Instance method to complete registration
userSchema.methods.completeRegistration = function () {
  this.registrationCompleted = true;
  this.emailVerified = true;
  if (this.phoneNumber) {
    this.phoneVerified = true;
  }
  return this.save();
};

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;

