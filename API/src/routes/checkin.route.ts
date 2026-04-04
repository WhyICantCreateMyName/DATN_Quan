import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Tra cứu hội viên quét cổng
router.post('/lookup', async (req: Request, res: Response) => {
  try {
    const { payload } = req.body; // payload là SĐT hoặc là ID vân tay

    // Nếu không truyền
    if (!payload) {
      res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại hoặc mã thẻ định danh' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        // Cú pháp tìm kiếm User dựa trên phone, hoặc tìm memberProfile từ fingerprintId
        OR: [
          { phone: payload },
          { memberProfile: { fingerprintId: payload } }
        ]
      },
      include: {
        memberProfile: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: { plan: true }
            }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy hồ sơ hệ thống trùng khớp' });
      return;
    }

    const activeSubs = user.memberProfile?.subscriptions || [];
    let hasAccess = false;
    let mainPlan = 'Vãng Lai';
    let daysRemaining = 0;
    let expireString = '-';

    if (activeSubs.length > 0) {
       // Lấy gói tập Active có hạn dài nhất
       const currentPlan = activeSubs[0];
       hasAccess = true;
       mainPlan = currentPlan.plan.name;
       const expireDateObj = new Date(currentPlan.endDate);
       expireString = expireDateObj.toLocaleDateString('vi-VN');
       daysRemaining = Math.max(0, Math.ceil((expireDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    }

    res.json({
      id: user.id,
      memberId: user.memberProfile?.id,
      name: user.fullName,
      phone: user.phone,
      hasAccess,
      plan: mainPlan,
      expireDate: expireString,
      remainingDays: daysRemaining
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chốt ca và lưu lịch sử mở cổng
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { memberId, method } = req.body;
    
    if (!memberId) {
      res.status(400).json({ error: 'Trường memberId là bắt buộc' });
      return;
    }

    const checkInLog = await prisma.checkIn.create({
      data: {
        memberId: Number(memberId),
        method: method || 'MANUAL', // MANUAL, QR, FINGERPRINT
      }
    });

    res.json({ message: 'Ghi nhận ra vào cổng thành công', data: checkInLog });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
