import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Danh sách các gói tập
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.membershipPlan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy gói' });
  }
});

// Tạo gói tập mới
router.post('/plans', async (req: Request, res: Response) => {
  try {
    const { name, price, durationDays, ptSessions, description } = req.body;
    const plan = await prisma.membershipPlan.create({
      data: { name, price, durationDays, ptSessions, description }
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo gói' });
  }
});

// Kích hoạt gói cho hội viên (Subscription)
router.post('/subscribe', async (req: Request, res: Response) => {
  const { memberId, planId } = req.body;
  try {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: Number(planId) } });
    if (!plan) {
      res.status(404).json({ error: 'Gói tập không tồn tại' });
      return;
    }
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await prisma.memberSubscription.create({
      data: {
        memberId: Number(memberId),
        planId: Number(planId),
        startDate: new Date(),
        endDate,
        remainingPtSessions: plan.ptSessions,
        status: 'ACTIVE'
      }
    });
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Lấy danh sách gói tập của hội viên cụ thể
router.get('/user/:memberId', async (req: Request, res: Response) => {
  try {
    const subs = await prisma.memberSubscription.findMany({
      where: { memberId: Number(req.params.memberId) },
      include: { plan: true }
    });
    res.json(subs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa gói tập
router.delete('/plans/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.membershipPlan.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
