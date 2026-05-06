import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// GET /metrics/history/self - Lấy lịch sử của chính PT
router.get('/history/self', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.jwt || (authHeader ? authHeader.split(' ')[1] : null);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const pt = await prisma.trainerProfile.findUnique({ where: { userId: decoded.id } });
    if (!pt) return res.status(404).json({ error: 'Trainer profile not found' });

    const metrics = await prisma.bodyMetric.findMany({
      where: { trainerId: pt.id, memberId: null },
      orderBy: { recordedAt: 'asc' }
    });
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: 'Error fetching self metrics' });
  }
});

// GET /metrics/:memberId - Lấy lịch sử Inbody của học viên
router.get('/:memberId', async (req: Request, res: Response) => {
  try {
    const memberId = Number(req.params.memberId);
    if (isNaN(memberId)) {
       return res.status(400).json({ error: 'Invalid member ID' });
    }

    const metrics = await prisma.bodyMetric.findMany({
      where: { memberId },
      orderBy: { recordedAt: 'asc' }
    });
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

// POST /metrics - Ghi nhận Chỉ số mới (Cho học viên hoặc chính PT)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, weight, height, bodyFat, muscleMass } = req.body;
    
    if (!weight || !height) {
       return res.status(400).json({ error: 'Weight and Height are required' });
    }

    // Xác định TrainerId từ Token
    let trainerId = null;
    const authHeader = req.headers.authorization;
    const token = req.cookies?.jwt || (authHeader ? authHeader.split(' ')[1] : null);
    
    if (token) {
       try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          const pt = await prisma.trainerProfile.findUnique({ where: { userId: decoded.id } });
          if (pt) trainerId = pt.id;
       } catch (e) {}
    }

    const heightInMeters = Number(height) / 100;
    const computedBmi = Number(weight) / (heightInMeters * heightInMeters);

    const data: any = {
      trainerId,
      weight: Number(weight),
      height: Number(height),
      bmi: computedBmi,
      bodyFat: Number(bodyFat || 0),
      muscleMass: Number(muscleMass || 0)
    };

    // Nếu có memberId thì lưu cho member, nếu không (hoặc = 0) thì là tự đo cho PT
    if (memberId && Number(memberId) !== 0) {
      data.memberId = Number(memberId);
    } else {
      // Trường hợp PT tự đo cho mình
      if (!trainerId) return res.status(401).json({ error: 'Trainer identity required for self-tracking' });
      data.memberId = null;
    }

    const metric = await prisma.bodyMetric.create({ data });
    res.json(metric);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
