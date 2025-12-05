import ExpertUser from "../models/expertUser.js";
import { normalizeId, idToString } from "../../utils/db/idUtils.js";
import mongoose from "mongoose";

/**
 * Expert Service
 * Business logic for expert user management
 * Database-agnostic design for future migration
 */

/**
 * Check if database is connected
 */
const checkDBConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database is not connected. Please check your MongoDB connection string.");
  }
};

/**
 * Check if email already exists
 */
export const checkEmailExists = async (email) => {
  try {
    checkDBConnection();
    const user = await ExpertUser.findByEmail(email);
    return !!user;
  } catch (error) {
    if (error.message.includes("not connected")) {
      throw error;
    }
    throw new Error(`Failed to check email: ${error.message}`);
  }
};

/**
 * Check if phone already exists
 */
export const checkPhoneExists = async (phoneNumber) => {
  try {
    checkDBConnection();
    const normalized = phoneNumber.replace(/\D/g, "");
    const user = await ExpertUser.findByPhone(normalized);
    return !!user;
  } catch (error) {
    if (error.message.includes("not connected")) {
      throw error;
    }
    throw new Error(`Failed to check phone: ${error.message}`);
  }
};

/**
 * Create expert user (temporary - before full registration)
 */
export const createExpertUser = async (userData) => {
  try {
    checkDBConnection();
    
    // Check if email already exists
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
      throw new Error("Email already registered");
    }

    // Check if phone already exists
    const phoneExists = await checkPhoneExists(userData.phoneNumber);
    if (phoneExists) {
      throw new Error("Phone number already registered");
    }

    // Create new expert user
    const expertUser = new ExpertUser({
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      country: userData.country,
      city: userData.city,
      industry: userData.industry,
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
      registrationCompleted: false,
      password: userData.password || undefined, // Will be hashed in pre-save hook
    });

    await expertUser.save();
    return expertUser;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern?.email) {
        throw new Error("Email already registered");
      }
      if (error.keyPattern?.phoneNumber) {
        throw new Error("Phone number already registered");
      }
    }
    throw new Error(`Failed to create expert user: ${error.message}`);
  }
};

/**
 * Update expert user verification status
 */
export const updateVerificationStatus = async (identifier, type, verified) => {
  try {
    const user = type === "email"
      ? await ExpertUser.findByEmail(identifier)
      : await ExpertUser.findByPhone(identifier);

    if (!user) {
      throw new Error("User not found");
    }

    if (type === "email") {
      await user.verifyEmail();
    } else if (type === "phone") {
      await user.verifyPhone();
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to update verification status: ${error.message}`);
  }
};

/**
 * Complete expert registration with password
 */
export const completeExpertRegistration = async (email, password) => {
  try {
    const user = await ExpertUser.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.emailVerified || !user.phoneVerified) {
      throw new Error("Email and phone must be verified before completing registration");
    }

    // Set password if provided
    if (password) {
      user.password = password;
    }

    await user.completeRegistration();
    return user;
  } catch (error) {
    throw new Error(`Failed to complete registration: ${error.message}`);
  }
};

/**
 * Verify expert credentials (for login)
 */
export const verifyExpertCredentials = async (email, password) => {
  try {
    const user = await ExpertUser.findByEmailWithPassword(email.toLowerCase().trim());
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error("Password not set. Please complete registration first.");
    }

    if (!user.registrationCompleted) {
      throw new Error("Registration not completed. Please complete your registration.");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Remove password from user object before returning
    user.password = undefined;
    return user;
  } catch (error) {
    throw new Error(error.message || "Failed to verify credentials");
  }
};

/**
 * Get expert user by email
 */
export const getExpertByEmail = async (email) => {
  try {
    checkDBConnection();
    const user = await ExpertUser.findByEmail(email);
    return user;
  } catch (error) {
    if (error.message.includes("not connected")) {
      throw error;
    }
    throw new Error(`Failed to get expert user: ${error.message}`);
  }
};

/**
 * Get expert user by phone
 */
export const getExpertByPhone = async (phoneNumber) => {
  try {
    const user = await ExpertUser.findByPhone(phoneNumber);
    return user;
  } catch (error) {
    throw new Error(`Failed to get expert user: ${error.message}`);
  }
};

