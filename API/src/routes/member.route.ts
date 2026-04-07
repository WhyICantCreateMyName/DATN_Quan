import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// Lấy Member ID từ Token
const getMemberId = async (req: Request) => {
  const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const member = await prisma.memberProfile.findUnique({ where: { userId: decoded.id } });
    return member?.id || null;
  } catch (e) { return null; }
};

// GET /member/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const memberId = await getMemberId(req);
    if (!memberId) return res.status(401).json({ error: 'Unauthorized Member' });

    const subscriptions = await prisma.memberSubscription.findMany({
      where: { memberId, status: 'ACTIVE' },
      include: { plan: true }
    });

    const activeSub = subscriptions.length > 0 ? subscriptions[0] : null;

    res.json({
       activeSubscription: activeSub,
       remainingPtSessions: activeSub ? activeSub.remainingPtSessions : 0
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /member/schedule
router.get('/schedule', async (req: Request, res: Response) => {
  try {
    const memberId = await getMemberId(req);
    if (!memberId) return res.status(401).json({ error: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { memberId },
      include: { trainer: { include: { user: true } }, groupClass: true },
      orderBy: { startTime: 'asc' }
    });

    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /member/inbody
router.get('/inbody', async (req: Request, res: Response) => {
   try {
     const memberId = await getMemberId(req);
     if (!memberId) return res.status(401).json({ error: 'Unauthorized' });
 
     const metrics = await prisma.bodyMetric.findMany({
       where: { memberId },
       include: { trainer: { include: { user: true } } },
       orderBy: { recordedAt: 'asc' }
     });
 
     res.json(metrics);
   } catch (e) {
     res.status(500).json({ error: 'Server error' });
   }
});

export default router;
