import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Twilio Configuration
let twilioClient = null;
let twilioAvailable = false;

// Initialize Twilio client if credentials are available
// Works in both development and production modes
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    twilioAvailable = true;
    const envMode = process.env.NODE_ENV || 'development';
    console.log(`✅ Twilio is configured and ready to send SMS (${envMode} mode).`);
  } catch (error) {
    console.error('❌ Twilio configuration error:', error.message);
    twilioAvailable = false;
  }
} else {
  console.warn('⚠️ Twilio credentials not found. SMS sending will be disabled.');
  console.warn('   Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env to enable SMS.');
  console.warn('   SMS will work in both development and production modes when configured.');
  twilioAvailable = false;
}

// Twilio phone number (from environment variable)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || null;

export { twilioClient, twilioAvailable, twilioPhoneNumber };
export default twilioClient;

