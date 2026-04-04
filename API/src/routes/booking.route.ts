import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Lấy danh sách lớp học nhóm (Group Class)
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const groupClasses = await prisma.groupClass.findMany();
    res.json(groupClasses);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách lớp' });
  }
});

// Thêm mới lịch Group Class
router.post('/classes', async (req: Request, res: Response) => {
  try {
    const { name, capacity, startTime, endTime } = req.body;
    const groupClass = await prisma.groupClass.create({
      data: {
        name,
        capacity,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.json(groupClass);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Đặt lịch PT hoặc Lớp học nhóm
router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, trainerId, groupClassId, startTime, endTime } = req.body;
    
    // Tự động gán trạng thái
    const booking = await prisma.booking.create({
      data: {
        memberId: Number(memberId),
        trainerId: trainerId ? Number(trainerId) : undefined,
        groupClassId: groupClassId ? Number(groupClassId) : undefined,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'CONFIRMED'
      }
    });
    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Check-in (Điểm danh tự động qua cổng)
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const { memberId, method } = req.body; // method = FACE_ID, FINGERPRINT
    const checkin = await prisma.checkIn.create({
      data: { memberId: Number(memberId), method: method || 'MANUAL' }
    });
    res.json(checkin);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
