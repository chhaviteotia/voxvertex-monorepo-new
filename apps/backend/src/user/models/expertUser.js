import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { normalizeId, idToString } from "../../utils/db/idUtils.js";

/**
 * Expert User Model
 * Stores expert users (speakers/trainers) registered through join-expert flow
 * Database-agnostic design for future migration
 */

const expertUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["speaker", "trainer"],
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
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
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
expertUserSchema.index({ email: 1 });
expertUserSchema.index({ phoneNumber: 1 });
expertUserSchema.index({ role: 1 });
expertUserSchema.index({ country: 1, city: 1 });
expertUserSchema.index({ industry: 1 });

// Pre-save hook to normalize data and hash password
expertUserSchema.pre("save", async function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.replace(/\D/g, ""); // Remove non-digits
  }
  
  // Hash password if it's modified and exists
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Static method to find by email
expertUserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to find by phone
expertUserSchema.statics.findByPhone = function (phoneNumber) {
  const normalized = phoneNumber.replace(/\D/g, "");
  return this.findOne({ phoneNumber: normalized });
};

// Instance method to mark email as verified
expertUserSchema.methods.verifyEmail = function () {
  this.emailVerified = true;
  return this.save();
};

// Instance method to mark phone as verified
expertUserSchema.methods.verifyPhone = function () {
  this.phoneVerified = true;
  return this.save();
};

// Instance method to complete registration
expertUserSchema.methods.completeRegistration = function () {
  this.registrationCompleted = true;
  this.emailVerified = true;
  this.phoneVerified = true;
  return this.save();
};

// Instance method to compare password
expertUserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email with password
expertUserSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).select("+password");
};

const ExpertUser = mongoose.model("ExpertUser", expertUserSchema);

export default ExpertUser;

