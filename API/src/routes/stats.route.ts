import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Doanh thu hôm nay
    const todayInvoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: today } }
    });
    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // 2. Khách check-in hôm nay
    const todayCheckIns = await prisma.checkIn.count({
      where: { checkInTime: { gte: today } }
    });

    // 3. Số thẻ đang Active
    const activeMemberships = await prisma.memberSubscription.count({
      where: { status: 'ACTIVE' }
    });

    // 4. Tổng hội viên trên hệ thống
    const totalMembers = await prisma.user.count({
      where: { role: 'MEMBER' }
    });

    // 5. Thống kê theo 7 ngày để vẽ biểu đồ
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawInvoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    // Cấu trúc Data mảng 7 ngày gán sẵn mặc định
    const weekStats: Record<string, number> = {};
    for (let i = 0; i <= 6; i++) {
       const d = new Date(sevenDaysAgo);
       d.setDate(d.getDate() + i);
       // Tên thứ
       const options = { weekday: 'short' } as const;
       const dayName = new Intl.DateTimeFormat('vi-VN', options).format(d).toUpperCase();
       const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
       weekStats[dayKey] = { name: dayName, total: 0 } as any;
    }

    rawInvoices.forEach(inv => {
      const d = inv.createdAt;
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (weekStats[dayKey] !== undefined) {
         (weekStats[dayKey] as any).total += inv.totalAmount;
      }
    });

    const chartData = Object.values(weekStats);

    // 6. Số lượng từng nhóm gói tập (sắp hết hạn, khóa hạn)
    const expiringSubscriptions = await prisma.memberSubscription.count({
       where: {
         status: 'ACTIVE',
         endDate: {
           lte: new Date(new Date().setDate(new Date().getDate() + 7)),
           gte: new Date()
         }
       }
    });
    const frozenSubscriptions = await prisma.memberSubscription.count({
       where: { status: 'FROZEN' }
    });
    const expiredSubscriptions = await prisma.memberSubscription.count({
       where: { status: 'EXPIRED' }
    });

    res.json({
      overview: {
        todayRevenue,
        todayCheckIns,
        activeMemberships,
        totalMembers,
      },
      chartData,
      statusCount: {
        active: activeMemberships,
        expiring: expiringSubscriptions,
        frozen: frozenSubscriptions,
        expired: expiredSubscriptions,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
