import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './user/routes/userRoutes.js';
import profileRoutes from './profile/routes/profileRoutes.js';
import connectDB from './configs/dbConnect.js';
import { connectCloudinary } from './configs/cloudinary.config.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased limit for file uploads
app.use(cookieParser());

// Serve static files from uploads directory (must be before routes)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
  maxAge: '1d', // Cache images for 1 day
}));

// Connect to database
connectDB();

// Connect to Cloudinary (optional - server will work without it)
connectCloudinary();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Unified user routes (supports expert, organiser, participant)
// Routes: /api/user/:userType/*
app.use('/api/user', userRoutes);

// Profile routes (supports expert, organiser, participant)
// Routes: /api/profile/:userType/*
app.use('/api/profile', profileRoutes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

