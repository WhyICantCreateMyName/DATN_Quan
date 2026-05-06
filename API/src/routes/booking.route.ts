import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Lấy danh sách lớp học nhóm (Group Class)
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await prisma.groupClass.count();
    const groupClasses = await prisma.groupClass.findMany({
      skip,
      take: limit,
      orderBy: { startTime: 'desc' }
    });

    res.json({ data: groupClasses, page, limit, total });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách lớp' });
  }
});

// Thêm mới lịch Group Class
router.post('/classes', async (req: Request, res: Response) => {
  try {
    const { name, capacity, startTime, endTime } = req.body;
    const groupClass = await prisma.groupClass.create({
      data: {
        name,
        capacity,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.json(groupClass);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật lịch Group Class
router.patch('/classes/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, capacity, startTime, endTime } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);

    const groupClass = await prisma.groupClass.update({
      where: { id },
      data: updateData
    });
    res.json(groupClass);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa Group Class
router.delete('/classes/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.groupClass.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Đặt lịch PT hoặc Lớp học nhóm
router.post('/', async (req: Request, res: Response) => {
  try {
    let { memberId, trainerId, groupClassId, startTime, endTime } = req.body;

    // Nếu không có memberId, thử lấy từ token
    if (!memberId) {
      const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        try {
          const decoded: any = jwt.verify(token, 'TITANGYM_SECRET_KEY');
          const member = await prisma.memberProfile.findUnique({ where: { userId: decoded.id } });
          memberId = member?.id;
        } catch (e) { }
      }
    }

    if (!memberId) return res.status(401).json({ error: 'Không xác định được hội viên' });

    // KIỂM TRA SỐ BUỔI PT NẾU LÀ ĐẶT LỊCH PT
    if (trainerId) {
      const memberProfile = await prisma.memberProfile.findUnique({
        where: { id: Number(memberId) }
      });
      
      if (!memberProfile || memberProfile.remainingPtSessions <= 0) {
        return res.status(400).json({ error: 'Hội viên đã hết buổi tập PT. Vui lòng mua thêm gói bổ sung.' });
      }
      
      // Kiểm tra xem số lịch đã đặt (đang chờ hoặc đã xác nhận) có vượt quá số buổi hiện có không
      const activeBookingsCount = await prisma.booking.count({
        where: {
          memberId: Number(memberId),
          trainerId: { not: null },
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });
      
      if (activeBookingsCount >= memberProfile.remainingPtSessions) {
        return res.status(400).json({ error: 'Số lịch tập đang chờ đã đạt tối đa số buổi bạn hiện có.' });
      }
    }

    // Tự động gán trạng thái
    const booking = await prisma.booking.create({
      data: {
        memberId: Number(memberId),
        trainerId: trainerId ? Number(trainerId) : null,
        groupClassId: groupClassId ? Number(groupClassId) : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'PENDING' // Chuyển về PENDING để PT xác nhận
      }
    });
    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Check-in (Điểm danh tự động qua cổng)
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const { memberId, method } = req.body; // method = FACE_ID, FINGERPRINT
    const checkin = await prisma.checkIn.create({
      data: { memberId: Number(memberId), method: method || 'MANUAL' }
    });
    res.json(checkin);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái Booking & Tính hoa hồng
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const oldBooking = await prisma.booking.findUnique({ where: { id } });
    if (!oldBooking) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { trainer: { include: { user: true } } }
    });

    // Nếu hoàn thành buổi tập PT -> Tính hoa hồng & Trừ buổi tập
    if (status === 'COMPLETED' && booking.trainerId && oldBooking.status !== 'COMPLETED') {
      // 1. Trừ buổi tập trong hồ sơ Hội viên
      await prisma.memberProfile.update({
        where: { id: booking.memberId },
        data: { remainingPtSessions: { decrement: 1 } }
      });

      // 2. Tính hoa hồng cho PT
      const rate = await prisma.commissionRate.findFirst({
        where: { applyTo: 'SESSION' }
      });

      if (rate && booking.trainer) {
        let amount = 0;
        if (rate.type === 'FIXED') amount = rate.value;

        if (amount > 0) {
          await prisma.commissionLog.create({
            data: {
              userId: booking.trainer.userId,
              amount,
              reason: `Dạy buổi PT cho khách ID: ${booking.memberId}`,
              bookingId: booking.id
            }
          });
        }
      }
    }

    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
