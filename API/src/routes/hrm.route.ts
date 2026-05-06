import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// --- SHIFTS ---
// Lấy lịch trực
router.get('/shifts', async (req, res) => {
  const shifts = await prisma.staffShift.findMany({
    include: { user: true },
    orderBy: { startTime: 'asc' }
  });
  res.json(shifts);
});

// Tạo lịch trực
router.post('/shifts', async (req, res) => {
  const { userId, startTime, endTime, note } = req.body;
  const shift = await prisma.staffShift.create({
    data: { 
      userId: Number(userId), 
      startTime: new Date(startTime), 
      endTime: new Date(endTime), 
      note 
    }
  });
  res.json(shift);
});

// --- COMMISSIONS ---
// Lấy cấu hình hoa hồng
router.get('/commissions/rates', async (req, res) => {
  const rates = await prisma.commissionRate.findMany({
    include: { plan: true }
  });
  res.json(rates);
});

// Tạo/Cập nhật hoa hồng
router.post('/commissions/rates', async (req, res) => {
  const { name, type, value, applyTo, planId } = req.body;
  const rate = await prisma.commissionRate.upsert({
    where: { planId: planId ? Number(planId) : -1 },
    update: { name, type, value, applyTo },
    create: { name, type, value, applyTo, planId: planId ? Number(planId) : null }
  });
  res.json(rate);
});

// Lấy nhật ký hoa hồng
router.get('/commissions/logs', async (req, res) => {
  const logs = await prisma.commissionLog.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(logs);
});

// --- KPIs ---
// Lấy chỉ tiêu KPI
router.get('/kpi', async (req, res) => {
  const { month, year } = req.query;
  const where: any = {};
  if (month) where.month = Number(month);
  if (year) where.year = Number(year);

  const kpis = await prisma.staffKPI.findMany({
    where,
    include: { user: true }
  });
  res.json(kpis);
});

// Thiết lập KPI
router.post('/kpi', async (req, res) => {
  const { userId, month, year, targetAmount } = req.body;
  const kpi = await prisma.staffKPI.upsert({
    where: { id: -1 }, // Sẽ cải thiện sau để check unique [userId, month, year]
    update: { targetAmount: Number(targetAmount) },
    create: { 
      userId: Number(userId), 
      month: Number(month), 
      year: Number(year), 
      targetAmount: Number(targetAmount) 
    }
  });
  res.json(kpi);
});

export default router;
