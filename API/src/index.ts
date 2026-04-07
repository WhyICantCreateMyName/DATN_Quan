import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import membershipRoutes from './routes/membership.route.js';
import bookingRoutes from './routes/booking.route.js';
import posRoutes from './routes/pos.route.js';
import paymentRoutes from './routes/payment.route.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow ngrok and expo
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Gym API is running...');
});

import statsRoutes from './routes/stats.route.js';
import checkinRoutes from './routes/checkin.route.js';
import trainerRoutes from './routes/trainer.route.js';
import metricsRoutes from './routes/metrics.route.js';
import memberRoutes from './routes/member.route.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/member', memberRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
