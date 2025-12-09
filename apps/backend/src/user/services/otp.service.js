import ExpertOtp from "../models/expertOtp.js";
import redis from "../../configs/redis.config.js";
import { redisAvailable, isRedisReady } from "../../configs/redis.config.js";
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
 * Store OTP in Redis (PRIMARY - traditional approach) with MongoDB backup
 * Redis is the primary storage for OTPs (fast, TTL support, designed for ephemeral data)
 * MongoDB is optional backup/audit log
 */
export const storeOtp = async (identifier, type, otp, expiresInMinutes = 10) => {
  // Normalize identifier: lowercase for email, remove non-digits for phone
  const normalizedIdentifier = type === "email" 
    ? identifier.toLowerCase().trim() 
    : identifier.replace(/\D/g, "");
  
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  const key = `expert:otp:${type}:${normalizedIdentifier}`;
  const otpString = String(otp); // Ensure OTP is string

  // Step 1: Store in Redis FIRST (PRIMARY - traditional approach)
  const redisReady = await isRedisReady();
  if (redisReady && redis) {
    try {
      const otpData = {
        otp: otpString,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
      };
      
      // Use Redis SETEX for automatic expiration (traditional OTP storage)
      await redis.setex(key, expiresInMinutes * 60, JSON.stringify(otpData));
      console.log(`✅ OTP stored in Redis (PRIMARY) for ${normalizedIdentifier} (${type}): ${otpString}`);
      
      // Step 2: Also store in MongoDB as backup/audit (non-blocking)
      storeInMongoDB(normalizedIdentifier, type, otpString, expiresAt).catch(err => {
        console.warn("⚠️ MongoDB backup storage failed (non-critical):", err.message);
      });
      
      return { stored: true, method: "redis" };
    } catch (error) {
      console.error("❌ Redis OTP storage failed:", error.message);
      // Fall through to MongoDB fallback
    }
  } else {
    console.warn("⚠️ Redis not available, falling back to MongoDB");
  }

  // Step 3: Fallback to MongoDB if Redis failed or unavailable
  try {
    await storeInMongoDB(normalizedIdentifier, type, otpString, expiresAt);
    console.log(`✅ OTP stored in MongoDB (FALLBACK) for ${normalizedIdentifier} (${type}): ${otpString}`);
    return { stored: true, method: "mongodb" };
  } catch (error) {
    console.error("❌ MongoDB OTP storage failed:", error.message);
    throw new Error(`Failed to store OTP: ${error.message}`);
  }
};

/**
 * Helper function to store OTP in MongoDB (for backup/audit)
 */
const storeInMongoDB = async (normalizedIdentifier, type, otpString, expiresAt) => {
  // Invalidate previous OTPs for this identifier and type
  await ExpertOtp.updateMany(
    {
      [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
      type,
      verified: false,
    },
    { verified: true } // Mark as verified to invalidate
  );

  // Create new OTP in MongoDB
  const otpData = {
    [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
    type,
    otp: otpString,
    expiresAt,
    verified: false,
    attempts: 0,
  };

  await ExpertOtp.create(otpData);
};

/**
 * Verify OTP from Redis (PRIMARY) or MongoDB (FALLBACK)
 * Redis is primary - traditional approach for OTP verification
 */
export const verifyOtp = async (identifier, type, otp) => {
  // Normalize identifier: lowercase for email, remove non-digits for phone
  const normalizedIdentifier = type === "email" 
    ? identifier.toLowerCase().trim() 
    : identifier.replace(/\D/g, "");
  
  // Ensure OTP is a string for consistent comparison
  const otpString = String(otp).trim();
  const key = `expert:otp:${type}:${normalizedIdentifier}`;

  console.log(`🔐 Verifying OTP for ${normalizedIdentifier} (${type}), OTP: ${otpString}`);

  // Step 1: Check Redis FIRST (PRIMARY - traditional approach)
  const redisReady = await isRedisReady();
  if (redisReady && redis) {
    try {
      const data = await redis.get(key);
      if (data) {
        const otpData = JSON.parse(data);
        const storedOtp = String(otpData.otp).trim();
        
        console.log(`📦 Found OTP in Redis: stored=${storedOtp}, provided=${otpString}, match=${storedOtp === otpString}`);
        
        if (storedOtp === otpString && new Date(otpData.expiresAt) > new Date()) {
          if (otpData.attempts >= 5) {
            throw new Error("Maximum verification attempts exceeded");
          }
          
          // Valid OTP - delete from Redis and optionally mark in MongoDB
          await redis.del(key);
          
          // Optionally mark in MongoDB if it exists (non-blocking)
          try {
            await ExpertOtp.updateMany(
              {
                [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
                type,
                otp: otpString,
                verified: false,
              },
              { verified: true }
            );
          } catch (mongoError) {
            // Non-critical - OTP already verified in Redis
            console.warn("MongoDB update failed (non-critical):", mongoError.message);
          }
          
          console.log(`✅ OTP verified successfully via Redis for ${normalizedIdentifier}`);
          return { verified: true, method: "redis" };
        } else if (storedOtp !== otpString) {
          // Invalid OTP - increment attempts
          otpData.attempts += 1;
          const ttl = Math.floor((new Date(otpData.expiresAt) - new Date()) / 1000);
          if (ttl > 0) {
            await redis.setex(key, ttl, JSON.stringify(otpData));
          }
          
          // Also increment in MongoDB (non-blocking)
          try {
            const existingRecord = await ExpertOtp.findOne({
              [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
              type,
              verified: false,
              expiresAt: { $gt: new Date() },
            });
            if (existingRecord) {
              await existingRecord.incrementAttempts();
            }
          } catch (mongoError) {
            console.warn("Failed to increment attempts in MongoDB:", mongoError.message);
          }
          
          throw new Error("Invalid OTP");
        } else {
          throw new Error("OTP has expired");
        }
      }
    } catch (error) {
      if (error.message.includes("Invalid OTP") || error.message.includes("expired") || error.message.includes("Maximum")) {
        throw error;
      }
      console.warn("⚠️ Redis verification failed, checking MongoDB:", error.message);
    }
  }

  // Step 2: Fallback to MongoDB if Redis failed or unavailable
  try {
    console.log(`🔍 Checking MongoDB (FALLBACK) for OTP: ${normalizedIdentifier} (${type}), OTP: ${otpString}`);
    
    const otpRecord = await ExpertOtp.findValidOtp(normalizedIdentifier, type, otpString);
    if (!otpRecord) {
      // Try to find the record to increment attempts or provide better error
      const existingRecord = await ExpertOtp.findOne({
        [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
        type,
        verified: false,
        expiresAt: { $gt: new Date() },
      });

      if (existingRecord) {
        console.log(`❌ OTP mismatch: stored=${existingRecord.otp}, provided=${otpString}`);
        await existingRecord.incrementAttempts();
        throw new Error("Invalid OTP");
      }
      
      // Check if there's an expired record
      const expiredRecord = await ExpertOtp.findOne({
        [type === "email" ? "email" : "phoneNumber"]: normalizedIdentifier,
        type,
        verified: false,
      });
      
      if (expiredRecord) {
        console.log(`❌ OTP found but expired: expiresAt=${expiredRecord.expiresAt}, now=${new Date()}`);
        throw new Error("OTP has expired");
      }
      
      console.log(`❌ No OTP found for ${normalizedIdentifier} (${type})`);
      throw new Error("OTP not found. Please request a new OTP.");
    }

    // Valid OTP found in MongoDB - mark as verified
    await otpRecord.markAsVerified();
    
    // Also delete from Redis if it exists
    if (redis && redisReady) {
      try {
        await redis.del(key);
      } catch (redisError) {
        console.warn("Failed to delete from Redis after MongoDB verification:", redisError.message);
      }
    }
    
    console.log(`✅ OTP verified successfully via MongoDB (FALLBACK) for ${normalizedIdentifier}`);
    return { verified: true, method: "mongodb" };
  } catch (error) {
    console.error(`❌ OTP verification failed:`, error.message);
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

