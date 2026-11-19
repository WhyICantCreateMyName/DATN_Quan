import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// Helper để lấy Member ID từ Token
const getMemberId = async (req: Request) => {
  const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const member = await prisma.memberProfile.findUnique({ where: { userId: decoded.id } });
    return member?.id || null;
  } catch (e) { return null; }
};

// Danh sách các gói tập
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await prisma.membershipPlan.count();
    const plans = await prisma.membershipPlan.findMany({
      skip,
      take: limit,
      orderBy: { id: 'desc' }
    });

    res.json({ 
      data: plans, 
      total,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy gói' });
  }
});

// Tạo gói tập mới
router.post('/plans', async (req: Request, res: Response) => {
  try {
    const { name, price, durationDays, ptSessions, description, tag } = req.body;
    const plan = await prisma.membershipPlan.create({
      data: { name, price, durationDays, ptSessions, description, tag }
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo gói' });
  }
});

// Kích hoạt/Gia hạn gói cho hội viên (Subscription Logic)
router.post('/subscribe', async (req: Request, res: Response) => {
  let { memberId, planId } = req.body;
  try {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return res.status(404).json({ error: 'Gói tập không tồn tại' });

    // Lấy memberId từ token nếu không có trong body
    if (!memberId) {
      memberId = await getMemberId(req);
    }

    if (!memberId) return res.status(401).json({ error: 'Không xác định được hội viên' });

    // Tìm gói đang hoạt động của hội viên
    const existingSub = await prisma.memberSubscription.findFirst({
      where: { memberId: Number(memberId), status: 'ACTIVE' },
      include: { plan: true }
    });

    if (existingSub && existingSub.plan.tag === plan.tag) {
      // CÙNG PHÂN KHÚC (TAG) -> CỘNG DỒN THỜI GIAN & BUỔI PT VÀO WALLET
      const newEndDate = new Date(existingSub.endDate);
      newEndDate.setDate(newEndDate.getDate() + plan.durationDays);

      const [subscription] = await prisma.$transaction([
        prisma.memberSubscription.update({
          where: { id: existingSub.id },
          data: {
            endDate: newEndDate,
            grantedPtSessions: existingSub.grantedPtSessions + plan.ptSessions
          }
        }),
        prisma.memberProfile.update({
          where: { id: Number(memberId) },
          data: {
            remainingPtSessions: { increment: plan.ptSessions }
          }
        })
      ]);
      return res.json({ message: 'Cộng dồn gói cùng phân khúc thành công', subscription });
    }

    // KHÁC LOẠI GÓI HOẶC CHƯA CÓ GÓI -> TẠO GÓI MỚI & CỘNG BUỔI PT VÀO WALLET
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const [subscription] = await prisma.$transaction([
      prisma.memberSubscription.create({
        data: {
          memberId: Number(memberId),
          planId: Number(planId),
          startDate: new Date(),
          endDate,
          grantedPtSessions: plan.ptSessions,
          status: 'ACTIVE'
        }
      }),
      prisma.memberProfile.update({
        where: { id: Number(memberId) },
        data: {
          remainingPtSessions: { increment: plan.ptSessions }
        }
      })
    ]);

    res.json({ message: 'Đăng ký gói mới thành công', subscription });
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

// Cập nhật thông tin gói tập
router.patch('/plans/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, price, durationDays, ptSessions, description, tag } = req.body;
    const plan = await prisma.membershipPlan.update({
      where: { id },
      data: { name, price, durationDays, ptSessions, description, tag }
    });
    res.json(plan);
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

// Cập nhật trạng thái gói (Bảo lưu/Kích hoạt lại)
router.patch('/subscriptions/:id/status', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // ACTIVE, FROZEN, EXPIRED
    
    const sub = await prisma.memberSubscription.update({
      where: { id },
      data: { status }
    });
    res.json(sub);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Chuyển nhượng gói tập
router.patch('/subscriptions/:id/transfer', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { targetMemberId } = req.body;
    
    const existingSub = await prisma.memberSubscription.findUnique({ where: { id } });
    if (!existingSub) return res.status(404).json({ error: 'Gói đăng ký không tồn tại' });
    
    const oldMemberId = existingSub.memberId;
    const newMemberId = Number(targetMemberId);

    const updatedSub = await prisma.$transaction(async (tx) => {
      const sub = await tx.memberSubscription.update({
        where: { id },
        data: { memberId: newMemberId }
      });

      // Chuyển các buổi PT chưa tập từ ví hội viên cũ sang hội viên mới
      const oldMember = await tx.memberProfile.findUnique({ where: { id: oldMemberId } });
      const sessionsToMove = Math.min(oldMember?.remainingPtSessions || 0, existingSub.grantedPtSessions);
      if (sessionsToMove > 0) {
        await tx.memberProfile.update({
          where: { id: oldMemberId },
          data: { remainingPtSessions: { decrement: sessionsToMove } }
        });
        await tx.memberProfile.update({
          where: { id: newMemberId },
          data: { remainingPtSessions: { increment: sessionsToMove } }
        });
      }

      return sub;
    });

    res.json(updatedSub);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
