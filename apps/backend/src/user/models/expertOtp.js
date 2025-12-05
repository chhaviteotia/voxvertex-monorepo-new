import mongoose from "mongoose";
import { normalizeId } from "../../utils/db/idUtils.js";

/**
 * Expert OTP Model
 * Stores OTPs for email and phone verification during expert registration
 * Database-agnostic design for future migration
 */

const expertOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.phoneNumber;
      },
      lowercase: true,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: function () {
        return !this.email;
      },
      trim: true,
      index: true,
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
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
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

// Index for faster lookups
expertOtpSchema.index({ email: 1, type: 1, verified: 1 });
expertOtpSchema.index({ phoneNumber: 1, type: 1, verified: 1 });
expertOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to find valid OTP
expertOtpSchema.statics.findValidOtp = function (identifier, type, otp) {
  return this.findOne({
    [type === "email" ? "email" : "phoneNumber"]: identifier,
    type,
    otp,
    verified: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });
};

// Instance method to mark as verified
expertOtpSchema.methods.markAsVerified = function () {
  this.verified = true;
  return this.save();
};

// Instance method to increment attempts
expertOtpSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

const ExpertOtp = mongoose.model("ExpertOtp", expertOtpSchema);

export default ExpertOtp;

