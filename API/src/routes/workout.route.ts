import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// GET /workout/me - Lấy lịch sử giáo án của chính mình
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const member = await prisma.memberProfile.findUnique({ where: { userId: decoded.id } });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const logs = await prisma.workoutLog.findMany({
      where: { memberId: member.id },
      include: { 
        exercises: true,
        trainer: { include: { user: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Error fetching workout logs' });
  }
});

const getPtId = async (req: Request) => {
  const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const pt = await prisma.trainerProfile.findUnique({ where: { userId: decoded.id } });
    return pt ? pt.id : null;
  } catch (e) {
    return null;
  }
};

// GET /workout/:memberId - Lấy lịch sử giáo án
router.get('/:memberId', async (req: Request, res: Response) => {
  try {
    const memberId = Number(req.params.memberId);
    const logs = await prisma.workoutLog.findMany({
      where: { memberId },
      include: { exercises: true },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Error fetching workout logs' });
  }
});

// POST /workout - Tạo giáo án mới
router.post('/', async (req: Request, res: Response) => {
  try {
    const ptId = await getPtId(req);
    if (!ptId) return res.status(401).json({ error: 'Unauthorized trainer' });

    const { memberId, notes, energyLevel, nutrition, exercises, bookingId } = req.body;

    let workoutDate = new Date();
    if (bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
      if (booking) {
        workoutDate = booking.startTime;
      }
    }

    const log = await prisma.workoutLog.create({
      data: {
        memberId: Number(memberId),
        trainerId: ptId,
        bookingId: bookingId ? Number(bookingId) : null,
        date: workoutDate,
        notes,
        energyLevel,
        nutrition,
        exercises: {
          create: exercises.map((ex: any) => ({
            name: ex.name,
            sets: Number(ex.sets),
            reps: Number(ex.reps),
            weight: Number(ex.weight || 0),
            notes: ex.notes
          }))
        }
      },
      include: { exercises: true }
    });

    res.json(log);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
