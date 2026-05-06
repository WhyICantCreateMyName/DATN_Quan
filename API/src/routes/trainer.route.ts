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
    const allMemberIds = Array.from(new Set(
      [...memberIds, ...measuredMembers.map(m => m.memberId)]
        .filter((id): id is number => id !== null)
    ));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.memberProfile.count({ where: { id: { in: allMemberIds } } });

    const clients = await prisma.memberProfile.findMany({
      where: { id: { in: allMemberIds } },
      skip,
      take: limit,
      include: {
        user: true,
        subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } },
        bodyMetrics: { orderBy: { recordedAt: 'desc' }, take: 1 } // Lấy chỉ số mới nhất
      }
    });

    res.json({ data: clients, page, limit, total });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /trainer/clients/:id (Chi tiết 1 học viên)
router.get('/clients/:id', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    const memberId = Number(req.params.id);

    // Lấy Profile của PT đang đăng nhập để lọc lịch hẹn
    const ptProfile = await prisma.trainerProfile.findUnique({ where: { userId: ptId } });
    if (!ptProfile) return res.status(404).json({ error: 'Trainer profile not found' });

    const client = await prisma.memberProfile.findUnique({
      where: { id: memberId },
      include: {
        user: true,
        subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } },
        bodyMetrics: { orderBy: { recordedAt: 'desc' }, take: 5 },
        bookings: {
          where: { trainerId: ptProfile.id },
          orderBy: { startTime: 'desc' },
          take: 10,
          include: { workoutLog: true }
        },
        workoutLogs: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { exercises: true }
        }
      }
    });

    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/schedule', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    // Find trainer ID
    const ptProfile = await prisma.trainerProfile.findUnique({ where: { userId: ptId } });
    if (!ptProfile) return res.json({ data: [], page: 1, limit: 10, total: 0 });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.booking.count({ where: { trainerId: ptProfile.id } });

    const bookings = await prisma.booking.findMany({
      where: { trainerId: ptProfile.id },
      skip,
      take: limit,
      include: { member: { include: { user: true } } },
      orderBy: { startTime: 'asc' }
    });

    res.json({ data: bookings, page, limit, total });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /trainer/profile (Cập nhật thông tin PT)
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    if (!ptId) return res.status(401).json({ error: 'Unauthorized PT' });

    const { fullName, avatarBase64, specialization, bio, height, weight, bodyFat } = req.body;

    // Update User (FullName)
    const user = await prisma.user.update({
      where: { id: ptId },
      data: { fullName }
    });

    // Update TrainerProfile
    const profile = await prisma.trainerProfile.update({
      where: { userId: ptId },
      data: {
        avatarBase64,
        specialization,
        bio,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        bodyFat: bodyFat ? Number(bodyFat) : null
      }
    });

    res.json({ user, profile });
  } catch (e: any) {
    res.status(500).json({ error: 'Lỗi cập nhật: ' + e.message });
  }
});

// GET /trainer/availability
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    const ptProfile = await prisma.trainerProfile.findUnique({ where: { userId: ptId } });
    if (!ptProfile) return res.status(404).json({ error: 'Trainer not found' });

    const availability = await prisma.trainerAvailability.findMany({
      where: { trainerId: ptProfile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
    res.json(availability);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /trainer/availability (Cập nhật toàn bộ lịch rảnh)
router.post('/availability', async (req: Request, res: Response) => {
  try {
    const ptId = getPtId(req);
    const ptProfile = await prisma.trainerProfile.findUnique({ where: { userId: ptId } });
    if (!ptProfile) return res.status(404).json({ error: 'Trainer not found' });

    const { slots } = req.body; // Array of { dayOfWeek, startTime, endTime }

    // Transaction to replace all
    await prisma.$transaction([
      prisma.trainerAvailability.deleteMany({ where: { trainerId: ptProfile.id } }),
      prisma.trainerAvailability.createMany({
        data: slots.map((s: any) => ({
          trainerId: ptProfile.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      })
    ]);

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
