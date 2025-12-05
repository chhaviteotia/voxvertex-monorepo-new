import ExpertOtp from "../models/expertOtp.js";
import redis from "../../configs/redis.config.js";
import { redisAvailable } from "../../configs/redis.config.js";
import { sendEmailVerification } from "../../services/email.service.js";
import { sendPhoneOtpSMS } from "../../services/sms.service.js";
import { twilioAvailable } from "../../configs/twilio.config.js";

/**
 * OTP Service for Expert Registration
 * Handles OTP generation, storage, and verification
 * Uses Redis for caching with MongoDB fallback
 */

/**
 * Generate a 6-digit OTP
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in Redis or MongoDB
 */
export const storeOtp = async (identifier, type, otp, expiresInMinutes = 10) => {
  // Normalize identifier: lowercase for email, remove non-digits for phone
  const normalizedIdentifier = type === "email" 
    ? identifier.toLowerCase().trim() 
    : identifier.replace(/\D/g, "");
  
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  const key = `expert:otp:${type}:${normalizedIdentifier}`;

  try {
    // Try Redis first
    if (redisAvailable && redis) {
      const otpData = {
        otp,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
      };
      await redis.setex(key, expiresInMinutes * 60, JSON.stringify(otpData));
      return { stored: true, method: "redis" };
    }
  } catch (error) {
    console.warn("Redis storage failed, falling back to MongoDB:", error.message);
  }

  // Fallback to MongoDB
  try {
    // Invalidate previous OTPs for this identifier and type
    await ExpertOtp.updateMany(
      {
        [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
        type,
        verified: false,
      },
      { verified: true } // Mark as verified to invalidate
    );

    // Create new OTP
    const otpData = {
      [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
      type,
      otp,
      expiresAt,
      verified: false,
      attempts: 0,
    };

    await ExpertOtp.create(otpData);
    return { stored: true, method: "mongodb" };
  } catch (error) {
    console.error("MongoDB OTP storage failed:", error);
    throw new Error("Failed to store OTP");
  }
};

/**
 * Verify OTP from Redis or MongoDB
 */
export const verifyOtp = async (identifier, type, otp) => {
  // Normalize identifier: lowercase for email, remove non-digits for phone
  const normalizedIdentifier = type === "email" 
    ? identifier.toLowerCase().trim() 
    : identifier.replace(/\D/g, "");
  
  const key = `expert:otp:${type}:${normalizedIdentifier}`;

  try {
    // Try Redis first
    if (redisAvailable && redis) {
      const data = await redis.get(key);
      if (data) {
        const otpData = JSON.parse(data);
        if (otpData.otp === otp && new Date(otpData.expiresAt) > new Date()) {
          if (otpData.attempts >= 5) {
            throw new Error("Maximum verification attempts exceeded");
          }
          // Mark as verified by deleting from Redis
          await redis.del(key);
          return { verified: true, method: "redis" };
        } else if (otpData.otp !== otp) {
          // Increment attempts
          otpData.attempts += 1;
          await redis.setex(key, Math.floor((new Date(otpData.expiresAt) - new Date()) / 1000), JSON.stringify(otpData));
          throw new Error("Invalid OTP");
        } else {
          throw new Error("OTP has expired");
        }
      }
    }
  } catch (error) {
    if (error.message.includes("Invalid OTP") || error.message.includes("expired") || error.message.includes("Maximum")) {
      throw error;
    }
    console.warn("Redis verification failed, falling back to MongoDB:", error.message);
  }

  // Fallback to MongoDB
  try {
    const otpRecord = await ExpertOtp.findValidOtp(normalizedIdentifier, type, otp);
    if (!otpRecord) {
      // Try to find the record to increment attempts
      const existingRecord = await ExpertOtp.findOne({
        [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
        type,
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (existingRecord) {
        await existingRecord.incrementAttempts();
        throw new Error("Invalid OTP");
      }
      throw new Error("OTP not found or expired");
    }

    await otpRecord.markAsVerified();
    return { verified: true, method: "mongodb" };
  } catch (error) {
    throw error;
  }
};

/**
 * Send email OTP
 */
export const sendEmailOtp = async (email, fullName) => {
  try {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOtp();
    console.log(`Generated OTP for ${normalizedEmail}: ${otp}`);
    
    await storeOtp(normalizedEmail, "email", otp, 10); // 10 minutes expiry
    console.log(`OTP stored successfully for ${normalizedEmail}`);

    // Send email (use original email for sending, normalized for storage)
    console.log(`Attempting to send email to ${normalizedEmail}...`);
    await sendEmailVerification(
      normalizedEmail,
      "Verify Your Email - VoxVertex Expert Registration",
      {
        otp,
        username: fullName || "User",
        appName: "VoxVertex",
      }
    );
    console.log(`Email sent successfully to ${normalizedEmail}`);

    return { success: true, message: "OTP sent to email" };
  } catch (error) {
    console.error("Error sending email OTP:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      email: normalizedEmail,
    });
    throw new Error(`Failed to send email OTP: ${error.message}`);
  }
};

/**
 * Send phone OTP via SMS (Twilio) with console fallback
 */
export const sendPhoneOtp = async (phoneNumber) => {
  try {
    // Normalize phone number (remove non-digits)
    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    const otp = generateOtp();
    await storeOtp(normalizedPhone, "phone", otp, 10); // 10 minutes expiry

    // Try to send SMS via Twilio if available (works in both development and production)
    let smsSent = false;
    if (twilioAvailable) {
      try {
        await sendPhoneOtpSMS(phoneNumber, otp, "VoxVertex");
        smsSent = true;
        const envMode = process.env.NODE_ENV || 'development';
        console.log(`✅ SMS sent successfully to ${phoneNumber} via Twilio (${envMode} mode)`);
      } catch (smsError) {
        console.warn(`⚠️ Twilio SMS failed for ${phoneNumber}, falling back to console logging:`, smsError.message);
        smsSent = false;
      }
    }

    // Always log OTP to console (for development/testing and debugging)
    console.log(`📱 Phone OTP for ${normalizedPhone}: ${otp}${smsSent ? ' (Also sent via SMS)' : ' (SMS not sent - check Twilio config)'}`);

    return { 
      success: true, 
      message: smsSent ? "OTP sent to phone via SMS" : "OTP generated (SMS not configured - check console for OTP)",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
      smsSent: smsSent
    };
  } catch (error) {
    console.error("Error sending phone OTP:", error);
    throw new Error("Failed to send phone OTP");
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (identifier, type, fullName = null) => {
  if (type === "email") {
    return await sendEmailOtp(identifier, fullName);
  } else if (type === "phone") {
    return await sendPhoneOtp(identifier);
  } else {
    throw new Error("Invalid OTP type");
  }
};

