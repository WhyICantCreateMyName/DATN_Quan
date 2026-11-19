import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ==========================================
// 1. LỊCH TRỰC CA (STAFF SHIFTS)
// ==========================================

// Lấy danh sách ca trực (hỗ trợ lọc userId, startDate, endDate)
router.get('/shifts', async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const where: any = {};
    if (userId) where.userId = Number(userId);
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(String(startDate));
      if (endDate) where.startTime.lte = new Date(String(endDate));
    }

    const shifts = await prisma.staffShift.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, role: true, phone: true, avatarUrl: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });
    res.json(shifts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo ca trực mới
router.post('/shifts', async (req: Request, res: Response) => {
  try {
    const { userId, startTime, endTime, note } = req.body;
    if (!userId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Thiếu thông tin ca trực (userId, startTime, endTime)' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ error: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
    }

    const shift = await prisma.staffShift.create({
      data: {
        userId: Number(userId),
        startTime: start,
        endTime: end,
        note
      },
      include: {
        user: {
          select: { id: true, fullName: true, role: true, phone: true, avatarUrl: true }
        }
      }
    });
    res.status(201).json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật ca trực
router.patch('/shifts/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { startTime, endTime, note, userId } = req.body;

    const data: any = {};
    if (startTime) data.startTime = new Date(startTime);
    if (endTime) data.endTime = new Date(endTime);
    if (note !== undefined) data.note = note;
    if (userId) data.userId = Number(userId);

    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      return res.status(400).json({ error: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
    }

    const shift = await prisma.staffShift.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, fullName: true, role: true, phone: true, avatarUrl: true }
        }
      }
    });
    res.json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa ca trực
router.delete('/shifts/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.staffShift.delete({ where: { id } });
    res.json({ success: true, message: 'Đã xóa ca trực' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. CẤU HÌNH HOA HỒNG (COMMISSION RATES)
// ==========================================

// Lấy danh sách cấu hình hoa hồng
router.get('/commissions/rates', async (_req: Request, res: Response) => {
  try {
    const rates = await prisma.commissionRate.findMany({
      include: { plan: true },
      orderBy: { id: 'asc' }
    });
    res.json(rates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo hoặc cập nhật cấu hình hoa hồng
router.post('/commissions/rates', async (req: Request, res: Response) => {
  try {
    const { id, name, type, value, applyTo, planId } = req.body;
    if (!name || value === undefined || !applyTo) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (name, value, applyTo)' });
    }

    let rate;
    if (id) {
      rate = await prisma.commissionRate.update({
        where: { id: Number(id) },
        data: {
          name,
          type: type || 'PERCENTAGE',
          value: Number(value),
          applyTo,
          planId: planId ? Number(planId) : null
        },
        include: { plan: true }
      });
    } else if (planId) {
      rate = await prisma.commissionRate.upsert({
        where: { planId: Number(planId) },
        update: {
          name,
          type: type || 'PERCENTAGE',
          value: Number(value),
          applyTo
        },
        create: {
          name,
          type: type || 'PERCENTAGE',
          value: Number(value),
          applyTo,
          planId: Number(planId)
        },
        include: { plan: true }
      });
    } else {
      rate = await prisma.commissionRate.create({
        data: {
          name,
          type: type || 'PERCENTAGE',
          value: Number(value),
          applyTo,
          planId: null
        },
        include: { plan: true }
      });
    }

    res.json(rate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa cấu hình hoa hồng
router.delete('/commissions/rates/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.commissionRate.delete({ where: { id } });
    res.json({ success: true, message: 'Đã xóa cấu hình hoa hồng' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. NHẬT KÝ HOA HỒNG (COMMISSION LOGS)
// ==========================================

// Lấy danh sách nhật ký hoa hồng (lọc userId, month, year, hỗ trợ phân trang)
router.get('/commissions/logs', async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = Number(userId);
    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      where.createdAt = {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1)
      };
    }

    const [totalCount, logs, sumResult] = await Promise.all([
      prisma.commissionLog.count({ where }),
      prisma.commissionLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, role: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.commissionLog.aggregate({
        where,
        _sum: { amount: true }
      })
    ]);

    res.json({
      data: logs,
      totalAmount: sumResult._sum.amount || 0,
      total: totalCount,
      page,
      limit
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. CHỈ TIÊU KPI (STAFF KPIS)
// ==========================================

// Lấy danh sách KPI (hỗ trợ lọc theo month, year, userId)
router.get('/kpi', async (req: Request, res: Response) => {
  try {
    const { month, year, userId } = req.query;
    const where: any = {};
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    if (userId) where.userId = Number(userId);

    const kpis = await prisma.staffKPI.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, role: true, phone: true, avatarUrl: true }
        }
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { achievedAmount: 'desc' }]
    });

    // Làm giàu dữ liệu với tỷ lệ hoàn thành (%) và đánh giá hiệu suất
    const enriched = kpis.map(k => {
      const achievementPercent = k.targetAmount > 0 ? Math.round((k.achievedAmount / k.targetAmount) * 100) : 0;
      let performanceRating = 'POOR';
      if (achievementPercent >= 100) performanceRating = 'EXCELLENT';
      else if (achievementPercent >= 80) performanceRating = 'GOOD';
      else if (achievementPercent >= 50) performanceRating = 'AVERAGE';

      return {
        ...k,
        achievementPercent,
        performanceRating
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Thiết lập / Cập nhật chỉ tiêu KPI
router.post('/kpi', async (req: Request, res: Response) => {
  try {
    const { userId, month, year, targetAmount } = req.body;
    if (!userId || !month || !year || targetAmount === undefined) {
      return res.status(400).json({ error: 'Thiếu thông tin KPI (userId, month, year, targetAmount)' });
    }

    const uId = Number(userId);
    const m = Number(month);
    const y = Number(year);
    const target = Number(targetAmount);

    const kpi = await prisma.staffKPI.upsert({
      where: {
        userId_month_year: {
          userId: uId,
          month: m,
          year: y
        }
      },
      update: {
        targetAmount: target
      },
      create: {
        userId: uId,
        month: m,
        year: y,
        targetAmount: target,
        achievedAmount: 0
      },
      include: {
        user: {
          select: { id: true, fullName: true, role: true, phone: true, avatarUrl: true }
        }
      }
    });

    const achievementPercent = kpi.targetAmount > 0 ? Math.round((kpi.achievedAmount / kpi.targetAmount) * 100) : 0;
    res.json({
      ...kpi,
      achievementPercent,
      performanceRating: achievementPercent >= 100 ? 'EXCELLENT' : achievementPercent >= 80 ? 'GOOD' : achievementPercent >= 50 ? 'AVERAGE' : 'POOR'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa chỉ tiêu KPI
router.delete('/kpi/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.staffKPI.delete({ where: { id } });
    res.json({ success: true, message: 'Đã xóa chỉ tiêu KPI' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. BẢNG TÍNH LƯƠNG TỰ ĐỘNG (PAYROLL)
// ==========================================

// Tổng hợp bảng lương & hoa hồng hàng tháng
router.get('/payroll', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || (now.getMonth() + 1);
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Lấy tất cả nhân sự (ADMIN, RECEPTIONIST, PT)
    const staffUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'RECEPTIONIST', 'PT'] },
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        baseSalary: true
      },
      orderBy: { role: 'asc' }
    });

    const payrollList = await Promise.all(staffUsers.map(async (u) => {
      // 1. Tổng hoa hồng thực tế trong tháng từ CommissionLog
      const commSum = await prisma.commissionLog.aggregate({
        where: {
          userId: u.id,
          createdAt: { gte: startDate, lt: endDate }
        },
        _sum: { amount: true }
      });
      const totalCommission = commSum._sum.amount || 0;

      // 2. Số ca trực trong tháng
      const shiftCount = await prisma.staffShift.count({
        where: {
          userId: u.id,
          startTime: { gte: startDate, lt: endDate }
        }
      });

      // 3. Chỉ số KPI trong tháng
      const kpi = await prisma.staffKPI.findUnique({
        where: {
          userId_month_year: { userId: u.id, month, year }
        }
      });

      const targetKpi = kpi?.targetAmount || 0;
      const achievedKpi = kpi?.achievedAmount || 0;
      const kpiPercent = targetKpi > 0 ? Math.round((achievedKpi / targetKpi) * 100) : 0;
      let performanceRating = 'CHƯA ĐẶT';
      if (targetKpi > 0) {
        if (kpiPercent >= 100) performanceRating = 'EXCELLENT';
        else if (kpiPercent >= 80) performanceRating = 'GOOD';
        else if (kpiPercent >= 50) performanceRating = 'AVERAGE';
        else performanceRating = 'POOR';
      }

      // 4. Tổng lương thực nhận = Lương cứng + Hoa hồng
      const baseSalary = u.baseSalary || 8000000;
      const netSalary = baseSalary + totalCommission;

      return {
        user: u,
        month,
        year,
        baseSalary,
        totalCommission,
        shiftCount,
        targetKpi,
        achievedKpi,
        kpiPercent,
        performanceRating,
        netSalary
      };
    }));

    res.json({
      month,
      year,
      data: payrollList
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
