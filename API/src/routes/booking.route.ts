import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'TITANGYM_SECRET_KEY';

// 1. Lấy danh sách lớp học nhóm (Group Class)
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await prisma.groupClass.count();
    const groupClasses = await prisma.groupClass.findMany({
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: { notIn: ['CANCELLED'] } }
            }
          }
        }
      }
    });

    res.json({ 
      data: groupClasses, 
      total,
      page,
      limit
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách lớp học' });
  }
});

// 2. Thêm mới lịch Group Class
router.post('/classes', async (req: Request, res: Response) => {
  try {
    const { name, capacity, startTime, endTime } = req.body;
    if (!name || !capacity || !startTime || !endTime) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ tên, sĩ số và thời gian lớp học' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ error: 'Thời gian bắt đầu phải trước thời gian kết thúc' });
    }

    const groupClass = await prisma.groupClass.create({
      data: {
        name,
        capacity: Number(capacity),
        startTime: start,
        endTime: end
      }
    });
    res.json(groupClass);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Cập nhật lịch Group Class
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

// 4. Xóa Group Class
router.delete('/classes/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.groupClass.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Lấy danh sách toàn bộ lịch hẹn (Admin / PT Booking Management)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const status = req.query.status ? String(req.query.status) : undefined;
    const trainerId = req.query.trainerId ? Number(req.query.trainerId) : undefined;
    const memberId = req.query.memberId ? Number(req.query.memberId) : undefined;
    const groupClassId = req.query.groupClassId ? Number(req.query.groupClassId) : undefined;

    const where: any = {};
    if (status) where.status = status;
    if (trainerId) where.trainerId = trainerId;
    if (memberId) where.memberId = memberId;
    if (groupClassId) where.groupClassId = groupClassId;

    if (req.query.date) {
      const d = new Date(String(req.query.date));
      if (!isNaN(d.getTime())) {
        const startOfDay = new Date(d);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(d);
        endOfDay.setHours(23, 59, 59, 999);
        where.startTime = { gte: startOfDay, lte: endOfDay };
      }
    }

    const total = await prisma.booking.count({ where });
    const bookings = await prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startTime: 'desc' },
      include: {
        member: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } }
          }
        },
        trainer: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } }
          }
        },
        groupClass: true,
        workoutLog: {
          include: { exercises: true }
        }
      }
    });

    res.json({
      data: bookings,
      total,
      page,
      limit
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lấy danh sách lịch hẹn' });
  }
});

// 6. Đặt lịch PT hoặc Lớp học nhóm (Tuân thủ 4 Booking Rules)
router.post('/', async (req: Request, res: Response) => {
  try {
    let { memberId, trainerId, groupClassId, startTime, endTime } = req.body;

    // Nếu không có memberId, thử lấy từ token
    if (!memberId) {
      const token = req.cookies?.jwt || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          const member = await prisma.memberProfile.findUnique({ where: { userId: decoded.id } });
          memberId = member?.id;
        } catch (e) { }
      }
    }

    if (!memberId) {
      return res.status(401).json({ error: 'Không xác định được hội viên' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ error: 'Khung giờ đặt lịch không hợp lệ (giờ bắt đầu phải trước giờ kết thúc)' });
    }

    // RULE 1: KIỂM TRA SỐ BUỔI PT NẾU LÀ ĐẶT LỊCH PT
    if (trainerId) {
      const tId = Number(trainerId);
      const mId = Number(memberId);

      const memberProfile = await prisma.memberProfile.findUnique({
        where: { id: mId }
      });

      if (!memberProfile || memberProfile.remainingPtSessions <= 0) {
        return res.status(400).json({
          error: 'Ví buổi tập PT của bạn đã hết. Vui lòng nạp thêm gói tập để tiếp tục đặt lịch.'
        });
      }

      // Kiểm tra số lịch đang chờ duyệt hoặc đã xác nhận
      const activeBookingsCount = await prisma.booking.count({
        where: {
          memberId: mId,
          trainerId: { not: null },
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      });

      if (activeBookingsCount >= memberProfile.remainingPtSessions) {
        return res.status(400).json({
          error: `Số lịch hẹn đang chờ (${activeBookingsCount}) đã bằng tổng số buổi PT bạn còn (${memberProfile.remainingPtSessions}).`
        });
      }

      // RULE 2A: KIỂM TRA TRÙNG LỊCH PT (OVERLAP CHECK)
      const trainerOverlap = await prisma.booking.findFirst({
        where: {
          trainerId: tId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startTime: { lt: end },
          endTime: { gt: start }
        }
      });

      if (trainerOverlap) {
        return res.status(400).json({
          error: 'Huấn luyện viên đã có lịch dạy trong khung giờ này. Vui lòng chọn khung giờ khác.'
        });
      }
    }

    // RULE 2B: KIỂM TRA SỨC CHỨA LỚP HỌC GROUPX
    if (groupClassId) {
      const gId = Number(groupClassId);
      const mId = Number(memberId);

      const groupClass = await prisma.groupClass.findUnique({ where: { id: gId } });
      if (!groupClass) {
        return res.status(404).json({ error: 'Lớp học nhóm không tồn tại' });
      }

      // Kiểm tra số lượng người đã đăng ký
      const bookedCount = await prisma.booking.count({
        where: {
          groupClassId: gId,
          status: { notIn: ['CANCELLED'] }
        }
      });

      if (bookedCount >= groupClass.capacity) {
        return res.status(400).json({
          error: `Lớp học "${groupClass.name}" đã đủ sĩ số tối đa (${groupClass.capacity} người).`
        });
      }

      // Kiểm tra hội viên đã đăng ký lớp này chưa
      const alreadyBooked = await prisma.booking.findFirst({
        where: {
          groupClassId: gId,
          memberId: mId,
          status: { notIn: ['CANCELLED'] }
        }
      });

      if (alreadyBooked) {
        return res.status(400).json({
          error: 'Bạn đã đăng ký giữ chỗ cho lớp học này rồi.'
        });
      }
    }

    // Tạo bản ghi Booking
    const booking = await prisma.booking.create({
      data: {
        memberId: Number(memberId),
        trainerId: trainerId ? Number(trainerId) : null,
        groupClassId: groupClassId ? Number(groupClassId) : null,
        startTime: start,
        endTime: end,
        status: 'PENDING'
      },
      include: {
        trainer: { include: { user: true } },
        groupClass: true
      }
    });

    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Lỗi đặt lịch' });
  }
});

// 7. Check-in (Điểm danh tự động qua cổng)
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const { memberId, method } = req.body;
    const checkin = await prisma.checkIn.create({
      data: { memberId: Number(memberId), method: method || 'MANUAL' }
    });
    res.json(checkin);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Cập nhật trạng thái Booking & Trừ ví buổi tập (RULE 4)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    const oldBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        trainer: { include: { user: true } },
        member: { include: { user: true } }
      }
    });

    if (!oldBooking) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });

    // Sử dụng Transaction nếu chuyển sang COMPLETED để trừ ví an toàn
    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status },
        include: {
          trainer: { include: { user: true } },
          member: { include: { user: true } }
        }
      });

      // Nếu hoàn thành buổi tập PT và trước đó chưa hoàn thành -> Trừ 1 buổi ví & tính hoa hồng
      if (status === 'COMPLETED' && booking.trainerId && oldBooking.status !== 'COMPLETED') {
        const updatedProfile = await tx.memberProfile.update({
          where: { id: booking.memberId },
          data: { remainingPtSessions: { decrement: 1 } }
        });

        if (updatedProfile.remainingPtSessions < 0) {
          throw new Error('Hội viên đã hết số buổi tập trong ví.');
        }

        // Tính hoa hồng dạy kèm PT
        const rate = await tx.commissionRate.findFirst({
          where: { applyTo: 'SESSION' }
        });

        const amount = rate && rate.type === 'FIXED' ? rate.value : 50000;
        if (booking.trainer) {
          await tx.commissionLog.create({
            data: {
              userId: booking.trainer.userId,
              amount,
              reason: `Dạy buổi PT cho khách: ${booking.member?.user?.fullName || booking.memberId}`,
              bookingId: booking.id
            }
          });
        }
      }

      return booking;
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 9. Xác nhận hoàn thành buổi tập qua quét mã QR
router.post('/:id/complete-with-qr', async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const { trainerId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        member: { include: { user: true } },
        trainer: true 
      }
    });

    if (!booking) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Buổi tập đã được xác nhận hoàn thành trước đó' });
    }
    if (trainerId && booking.trainerId !== Number(trainerId)) {
      return res.status(403).json({ error: 'Bạn không có quyền xác nhận cho buổi tập của PT khác' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.memberProfile.update({
        where: { id: booking.memberId },
        data: { remainingPtSessions: { decrement: 1 } }
      });

      if (updatedProfile.remainingPtSessions < 0) {
        throw new Error('Hội viên đã hết số buổi tập trong ví.');
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' }
      });

      if (booking.trainer) {
        await tx.commissionLog.create({
          data: {
            userId: booking.trainer.userId,
            amount: 50000,
            reason: `Hoàn thành buổi dạy kèm cho ${booking.member.user.fullName}`,
            bookingId: booking.id
          }
        });
      }

      return { updatedBooking, updatedProfile };
    });

    res.json({
      message: 'Xác nhận hoàn thành buổi tập thành công',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
