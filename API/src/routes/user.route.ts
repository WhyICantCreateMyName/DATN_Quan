import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Lấy danh sách toàn bộ Users
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    let limit = Math.max(1, Number(req.query.limit) || 10);
    limit = Math.min(limit, 50); // Tối đa 50 

    const roleFilter = req.query.role as string;
    const whereClause: any = {};
    if (roleFilter === 'STAFF') {
      whereClause.role = { not: 'MEMBER' };
    } else if (roleFilter) {
      whereClause.role = roleFilter;
    }

    const total = await prisma.user.count({ where: whereClause });
    const users = await prisma.user.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: 'desc' },
      include: {
        memberProfile: {
          include: {
            subscriptions: {
              include: { plan: true }
            }
          }
        },
        trainerProfile: true
      }
    });

    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách user' });
  }
});

// Đăng ký User mới
router.post('/', async (req: Request, res: Response) => {
  try {
    const { phone, password, fullName, role } = req.body;

    if (!phone || !password || !fullName) {
      res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash: password, // Todo: mã hoá bcrypt
        fullName,
        role: role || 'MEMBER',
        memberProfile: (role === 'MEMBER' || !role) ? { create: {} } : undefined,
        trainerProfile: role === 'PT' ? { create: { specialization: 'General' } } : undefined
      }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: `Lỗi khi tạo user: ${error.message}` });
  }
});

// Lấy chi tiết một user
router.get('/:id', async (req: Request, res: Response, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return next(); // Bỏ qua nếu ko phải là số để các route khác (nếu có) hứng

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { memberProfile: true, trainerProfile: true }
    });
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy user' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
