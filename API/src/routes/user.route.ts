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
      total,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách user' });
  }
});

// Đăng ký User mới
router.post('/', async (req: Request, res: Response) => {
  try {
    const { phone, password, fullName, role, avatarUrl, specialization } = req.body;

    if (!phone || !password || !fullName) {
      res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      return;
    }

    const assignedRole = role || 'MEMBER';
    const data: any = {
      phone,
      passwordHash: password, // Todo: mã hoá bcrypt
      fullName,
      role: assignedRole,
      avatarUrl: avatarUrl || null
    };

    if (assignedRole === 'MEMBER') {
      data.memberProfile = { create: {} };
    } else if (assignedRole === 'PT') {
      data.trainerProfile = { create: { specialization: specialization || 'General' } };
    }

    const user = await prisma.user.create({
      data,
      include: { memberProfile: true, trainerProfile: true }
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

// Cập nhật Profile (Avatar, Fingerprint...)
router.patch('/:id/profile', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { avatarUrl, fingerprintId } = req.body;
    
    // Tìm user để biết role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    // Cập nhật avatarUrl trực tiếp lên bảng User
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(avatarUrl !== undefined ? { avatarUrl } : {})
      },
      include: { memberProfile: true, trainerProfile: true }
    });

    // Nếu là MEMBER và có gửi fingerprintId, cập nhật MemberProfile
    if (user.role === 'MEMBER' && fingerprintId !== undefined) {
      await prisma.memberProfile.upsert({
        where: { userId },
        update: { fingerprintId },
        create: { userId, fingerprintId }
      });
    }
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Cập nhật thông tin chung User
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { fullName, phone, role, isActive, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {})
      },
      include: { memberProfile: true, trainerProfile: true }
    });
    res.json(user);
  } catch (error: any) {
    console.error('Update User Error:', error);
    res.status(400).json({ error: 'Lỗi cập nhật user: ' + error.message });
  }
});

// Xóa User
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete User Error:', error);
    res.status(400).json({ error: 'Lỗi khi xóa user: ' + error.message });
  }
});

export default router;
