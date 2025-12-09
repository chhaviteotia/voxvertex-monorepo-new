import mongoose from "mongoose";

/**
 * Generic OTP Model - Shared across all user types
 * Stores OTPs for email and phone verification during registration
 * Supports: expert (speaker/trainer), organiser, participant
 */

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.phoneNumber;
      },
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return !this.email;
      },
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    userType: {
      type: String,
      enum: ["expert", "organiser", "participant"],
      required: true,
      default: "expert",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5, // Maximum verification attempts
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
otpSchema.index({ email: 1, type: 1, userType: 1, verified: 1 });
otpSchema.index({ phoneNumber: 1, type: 1, userType: 1, verified: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userType: 1 });

// Static method to find valid OTP
otpSchema.statics.findValidOtp = function (identifier, type, otp, userType = 'expert') {
  return this.findOne({
    [type === "email" ? "email" : "phoneNumber"]: identifier,
    type,
    otp,
    userType,
    verified: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });
};

// Instance method to mark as verified
otpSchema.methods.markAsVerified = function () {
  this.verified = true;
  return this.save();
};

// Instance method to increment attempts
otpSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;


