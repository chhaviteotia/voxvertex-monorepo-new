import { twilioClient, twilioAvailable, twilioPhoneNumber } from '../configs/twilio.config.js';

/**
 * SMS Service
 * Handles sending SMS via Twilio
 */

/**
 * Send SMS using Twilio
 * @param {string} to - Recipient phone number (E.164 format: +1234567890)
 * @param {string} message - SMS message body
 * @returns {Promise<Object>} Twilio message object
 */
export const sendSMS = async (to, message) => {
  try {
    // Check if Twilio is available
    if (!twilioAvailable || !twilioClient) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }

    // Check if Twilio phone number is configured
    if (!twilioPhoneNumber) {
      throw new Error('Twilio phone number not configured. Please set TWILIO_PHONE_NUMBER in .env');
    }

    // Validate phone number format (should be E.164 format)
    if (!to.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +1234567890)');
    }

    // Send SMS via Twilio
    const messageResult = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log(`✅ SMS sent successfully to ${to}. Message SID: ${messageResult.sid}`);
    return messageResult;
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    throw error;
  }
};

/**
 * Send phone OTP via SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otp - OTP code to send
 * @param {string} appName - Application name (default: VoxVertex)
 * @returns {Promise<Object>} Twilio message object
 */
export const sendPhoneOtpSMS = async (phoneNumber, otp, appName = 'VoxVertex') => {
  try {
    // Format phone number to E.164 format if needed
    let formattedPhone = phoneNumber;
    
    // If phone number doesn't start with +, try to format it
    if (!formattedPhone.startsWith('+')) {
      // Remove all non-digit characters
      const digitsOnly = formattedPhone.replace(/\D/g, '');
      
      // If it starts with 0, remove it (common in some countries)
      const cleaned = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly;
      
      // Assume Indian number format (+91) if 10 digits, otherwise use default country code
      if (cleaned.length === 10) {
        formattedPhone = `+91${cleaned}`; // Default to India (+91)
      } else if (cleaned.length > 10) {
        formattedPhone = `+${cleaned}`;
      } else {
        // If less than 10 digits, use default country code from env or +91
        const defaultCountryCode = process.env.DEFAULT_PHONE_COUNTRY_CODE || '+91';
        formattedPhone = `${defaultCountryCode}${cleaned}`;
      }
    }

    // Create SMS message
    const message = `Your ${appName} verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;

    // Send SMS
    const result = await sendSMS(formattedPhone, message);
    return result;
  } catch (error) {
    console.error('Error sending phone OTP SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

