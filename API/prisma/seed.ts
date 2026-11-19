import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu dọn dẹp và khởi tạo dữ liệu mẫu (Seeding)...');

  await prisma.staffShift.deleteMany();
  await prisma.commissionLog.deleteMany();
  await prisma.staffKPI.deleteMany();
  await prisma.commissionRate.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bodyMetric.deleteMany();
  await prisma.memberSubscription.deleteMany();
  await prisma.groupClass.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.membershipPlan.deleteMany();

  // 1. Tạo Gói Tập
  const plans = [];
  for (let i = 0; i < 6; i++) {
    const isDiamond = i % 2 !== 0;
    const plan = await prisma.membershipPlan.create({
      data: {
        name: isDiamond ? `Gói Diamond ${i + 1} tháng` : `Gói Gold ${i + 1} tháng`,
        price: isDiamond ? (1000000 * (i + 1)) : (600000 * (i + 1)),
        durationDays: 30 * (i + 1),
        ptSessions: isDiamond ? (i + 1) * 2 : 0,
        tag: isDiamond ? 'DIAMOND' : 'GOLD',
        description: isDiamond ? 'Đầy đủ quyền lợi cao cấp nhất' : 'Gói tập cơ bản chất lượng'
      }
    });
    plans.push(plan);
  }

  // 2. Tạo 35 Sản phẩm POS
  console.log('Tạo 35 Mặt hàng lẻ...');
  for (let i = 1; i <= 35; i++) {
    await prisma.product.create({
      data: {
        name: `Hàng Hóa Mã T-${i} (Whey/Drink/Gear)`,
        price: 15000 + (i * 2000),
        stock: 50 + i
      }
    });
  }

  // 3. Tạo 15 Staff (ADMIN, PT, RECEPTIONIST)
  console.log('Tạo 15 Staff...');
  // Chắc chắn phải có Admin mặc định để test login admin-web
  const adminUser = await prisma.user.create({
    data: {
      phone: '0902222222',
      passwordHash: '123456',
      fullName: 'ADMIN QUYỀN LỰC',
      role: 'ADMIN',
      baseSalary: 15000000,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  });

  // Tạo PT cố định để test
  const ptMasterUser = await prisma.user.create({
    data: {
      phone: '0988888888',
      passwordHash: '123456',
      fullName: 'PT MASTER',
      role: 'PT',
      baseSalary: 7000000,
      avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150',
      trainerProfile: {
        create: {
          specialization: 'Bodybuilding & Fitness',
          bio: 'Chuyên gia huấn luyện hình thể 10 năm kinh nghiệm'
        }
      }
    }
  });

  let receptionistUser: any = null;
  const roles = ['RECEPTIONIST', 'PT', 'PT', 'RECEPTIONIST'];
  const staffAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  ];
  for (let i = 1; i <= 14; i++) {
    const roleId = roles[i % roles.length];
    const data: any = {
      phone: `09200000${i.toString().padStart(2, '0')}`,
      passwordHash: '123456',
      fullName: `Nhân Sự Số ${i} (${roleId})`,
      role: roleId || 'PT',
      baseSalary: roleId === 'RECEPTIONIST' ? 8000000 : 7000000,
      avatarUrl: staffAvatars[i % staffAvatars.length]
    };
    if (roleId === 'PT') {
      data.trainerProfile = { create: { specialization: 'General Training' } };
    }
    const createdStaff = await prisma.user.create({ data });
    if (roleId === 'RECEPTIONIST' && !receptionistUser) {
      receptionistUser = createdStaff;
    }
  }

  // 3.1. Cấu hình Tỷ Lệ Hoa Hồng Mặc Định (Commission Rates)
  console.log('Tạo Cấu hình Hoa hồng mẫu...');
  await prisma.commissionRate.create({
    data: {
      name: 'Hoa hồng dạy PT kèm',
      type: 'FIXED',
      value: 50000,
      applyTo: 'SESSION'
    }
  });
  await prisma.commissionRate.create({
    data: {
      name: 'Hoa hồng bán gói tập',
      type: 'PERCENTAGE',
      value: 10,
      applyTo: 'SALE'
    }
  });
  await prisma.commissionRate.create({
    data: {
      name: 'Hoa hồng bán lẻ sản phẩm POS',
      type: 'PERCENTAGE',
      value: 5,
      applyTo: 'SALE'
    }
  });

  // 3.2. Tạo Lịch Trực Ca Tuần Này (Staff Shifts)
  console.log('Tạo Lịch trực ca mẫu...');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const shiftTodayStart = new Date(now);
  shiftTodayStart.setHours(8, 0, 0, 0);
  const shiftTodayEnd = new Date(now);
  shiftTodayEnd.setHours(14, 0, 0, 0);

  await prisma.staffShift.create({
    data: {
      userId: ptMasterUser.id,
      startTime: shiftTodayStart,
      endTime: shiftTodayEnd,
      note: 'Ca sáng - Trực sàn tạ tự do tầng 2 & Hỗ trợ đo Inbody'
    }
  });

  const shiftTomorrowStart = new Date(now);
  shiftTomorrowStart.setDate(shiftTomorrowStart.getDate() + 1);
  shiftTomorrowStart.setHours(14, 0, 0, 0);
  const shiftTomorrowEnd = new Date(now);
  shiftTomorrowEnd.setDate(shiftTomorrowEnd.getDate() + 1);
  shiftTomorrowEnd.setHours(21, 0, 0, 0);

  await prisma.staffShift.create({
    data: {
      userId: ptMasterUser.id,
      startTime: shiftTomorrowStart,
      endTime: shiftTomorrowEnd,
      note: 'Ca chiều tối - Hướng dẫn lớp học & Kèm khách PT'
    }
  });

  if (receptionistUser) {
    await prisma.staffShift.create({
      data: {
        userId: receptionistUser.id,
        startTime: shiftTodayStart,
        endTime: shiftTodayEnd,
        note: 'Ca sáng - Trực quầy lễ tân sảnh chính & Check-in hội viên'
      }
    });
  }

  // 3.3. Thiết Lập Chỉ Tiêu KPI Tháng Hiện Tại (Staff KPIs)
  console.log('Tạo Chỉ tiêu KPI mẫu...');
  await prisma.staffKPI.create({
    data: {
      userId: ptMasterUser.id,
      month: currentMonth,
      year: currentYear,
      targetAmount: 20000000,
      achievedAmount: 14500000
    }
  });

  if (receptionistUser) {
    await prisma.staffKPI.create({
      data: {
        userId: receptionistUser.id,
        month: currentMonth,
        year: currentYear,
        targetAmount: 30000000,
        achievedAmount: 22800000
      }
    });
  }

  await prisma.staffKPI.create({
    data: {
      userId: adminUser.id,
      month: currentMonth,
      year: currentYear,
      targetAmount: 100000000,
      achievedAmount: 88500000
    }
  });

  // 3.4. Nhật Ký Hoa Hồng Mẫu (Commission Logs)
  console.log('Tạo Nhật ký hoa hồng mẫu...');
  await prisma.commissionLog.create({
    data: {
      userId: ptMasterUser.id,
      amount: 50000,
      reason: 'Hoa hồng hoàn thành buổi tập PT - Hội viên Nguyễn Minh Quân',
      createdAt: new Date()
    }
  });
  await prisma.commissionLog.create({
    data: {
      userId: ptMasterUser.id,
      amount: 50000,
      reason: 'Hoa hồng hoàn thành buổi tập PT cá nhân',
      createdAt: new Date(Date.now() - 86400000)
    }
  });
  if (receptionistUser) {
    await prisma.commissionLog.create({
      data: {
        userId: receptionistUser.id,
        amount: 500000,
        reason: 'Hoa hồng 10% tư vấn thành công Gói Diamond 180 ngày',
        createdAt: new Date()
      }
    });
  }

  // 4. Tạo 25 Members (Khách Hàng)
  console.log('Tạo 25 Khách hàng...');

  const diamond180 = await prisma.membershipPlan.create({
    data: {
      name: 'Gói Diamond 180 ngày',
      price: 5000000,
      durationDays: 180,
      ptSessions: 24,
      tag: 'DIAMOND',
      description: 'Gói Diamond cao cấp 6 tháng kèm 24 buổi PT'
    }
  });

  const ptAddon = await prisma.membershipPlan.create({
    data: {
      name: 'Gói Bổ Sung 10 Buổi PT',
      price: 1500000,
      durationDays: 90,
      ptSessions: 10,
      tag: 'PT_ADDON',
      description: 'Mua thêm 10 buổi tập kèm PT cá nhân'
    }
  });

  await prisma.user.create({
    data: {
      phone: '0111111111',
      passwordHash: '123456',
      fullName: 'Nguyễn Minh Quân',
      role: 'MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      memberProfile: {
        create: {
          fingerprintId: 'QUAN_0111',
          remainingPtSessions: 24, // Đồng bộ số buổi vào Profile
          subscriptions: {
            create: {
              planId: diamond180.id,
              startDate: new Date(),
              endDate: new Date(new Date().setDate(new Date().getDate() + 180)),
              grantedPtSessions: 24,
              status: 'ACTIVE'
            }
          }
        }
      }
    }
  });

  for (let i = 1; i <= 25; i++) {
    const mem = await prisma.user.create({
      data: {
        phone: `09300000${i.toString().padStart(2, '0')}`,
        passwordHash: '123456',
        fullName: `Khách Hàng Số ${i}`,
        role: 'MEMBER',
        memberProfile: { create: { fingerprintId: `FPG_${i}` } }
      },
      include: { memberProfile: true }
    });

    // 5. Cấp ngẫu nhiên gói tập cho 1 số Member (để test)
    if (i % 2 === 0 && mem.memberProfile && plans[0]) {
      await prisma.memberSubscription.create({
        data: {
          memberId: mem.memberProfile.id,
          planId: plans[0].id, // Cấp gói 1
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          grantedPtSessions: 0,
          status: 'ACTIVE'
        }
      });
    }
  }

  console.log('Seeding thành công! Database đã ngập tràn Data giả lập Big Data.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
