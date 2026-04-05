import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// Middleware auth mock (for PT id via Headers or query)
// In a real app we'd verify JWT. Here we pass ptId in query or header
const getPtId = (req: Request) => {
  const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      return decoded.id; // user ID
    } catch (e) { }
  }
  return Number(req.query.ptId || req.headers['x-pt-id']);
};

// GET /trainer/dashboard (Chỉ số cá nhân)
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    if (!ptId) return res.status(401).json({ error: 'Unauthorized PT' });

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedBookings = await prisma.booking.count({
      where: {
        trainer: { userId: ptId }, // ptId here is User ID to match login
        status: 'COMPLETED',
        startTime: { gte: firstDay }
      }
    });

    const pendingBookings = await prisma.booking.count({
      where: { trainer: { userId: ptId }, status: 'PENDING' }
    });

    res.json({
      completedThisMonth: completedBookings,
      pendingClasses: pendingBookings,
      commissionEstimated: completedBookings * 150000 // Giả sử 150k/buổi
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /trainer/clients (Học viên đang quản lý)
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    if (!ptId) return res.status(401).json({ error: 'Unauthorized PT' });

    // Lấy TrainerProfile ID từ User ID
    const ptProfile = await prisma.trainerProfile.findUnique({ where: { userId: ptId } });
    if (!ptProfile) return res.json([]);

    // Tìm Hội viên qua Booking logic
    const associatedMembers = await prisma.booking.findMany({
      where: { trainerId: ptProfile.id },
      select: { memberId: true },
      distinct: ['memberId']
    });

    const memberIds = associatedMembers.map(b => b.memberId);

    // Bổ sung những người đã từng được PT này đo inbody
    const measuredMembers = await prisma.bodyMetric.findMany({
      where: { trainerId: ptProfile.id },
      select: { memberId: true },
      distinct: ['memberId']
    });
    const allMemberIds = Array.from(new Set([...memberIds, ...measuredMembers.map(m => m.memberId)]));

    const clients = await prisma.memberProfile.findMany({
      where: { id: { in: allMemberIds } },
      include: {
        user: true,
        subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } },
        bodyMetrics: { orderBy: { recordedAt: 'desc' }, take: 1 } // Lấy chỉ số mới nhất
      }
    });

    res.json(clients);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /trainer/schedule (Thời khóa biểu)
router.get('/schedule', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    // Find trainer ID
    const ptProfile = await prisma.trainerProfile.findUnique({ where: { userId: ptId } });
    if (!ptProfile) return res.json([]);

    const bookings = await prisma.booking.findMany({
      where: { trainerId: ptProfile.id },
      include: { member: { include: { user: true } } },
      orderBy: { startTime: 'asc' }
    });
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
