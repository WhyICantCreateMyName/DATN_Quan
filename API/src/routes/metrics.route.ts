import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// GET /metrics/:memberId - Lấy lịch sử Inbody
router.get('/:memberId', async (req: Request, res: Response) => {
  try {
    const memberId = Number(req.params.memberId);
    const metrics = await prisma.bodyMetric.findMany({
      where: { memberId },
      orderBy: { recordedAt: 'asc' }
    });
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

// POST /metrics - Ghi nhận Chỉ số mới
router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, weight, height, bodyFat, muscleMass } = req.body;
    
    // Tính BMI: Cân nặng (kg) / [Chiều cao (m)]^2
    const heightInMeters = Number(height) / 100;
    const computedBmi = Number(weight) / (heightInMeters * heightInMeters);

    let trainerId = null;
    const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (token) {
       try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          const pt = await prisma.trainerProfile.findUnique({ where: { userId: decoded.id } });
          if (pt) trainerId = pt.id;
       } catch (e) {}
    }

    const metric = await prisma.bodyMetric.create({
      data: {
        memberId: Number(memberId),
        trainerId,
        weight: Number(weight),
        height: Number(height),
        bmi: computedBmi,
        bodyFat: Number(bodyFat),
        muscleMass: Number(muscleMass)
      }
    });
    res.json(metric);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
