import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu dọn dẹp và khởi tạo dữ liệu mẫu (Seeding)...');

  await prisma.workoutLogExercise.deleteMany();
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
  await prisma.user.create({
    data: { phone: '0902222222', passwordHash: '123456', fullName: 'ADMIN QUYỀN LỰC', role: 'ADMIN' }
  });

  // Tạo PT cố định để test
  await prisma.user.create({
    data: {
      phone: '0988888888',
      passwordHash: '123456',
      fullName: 'PT MASTER',
      role: 'PT',
      trainerProfile: {
        create: {
          specialization: 'Bodybuilding & Fitness',
          bio: 'Chuyên gia huấn luyện hình thể 10 năm kinh nghiệm'
        }
      }
    }
  });

  const roles = ['RECEPTIONIST', 'PT', 'PT', 'RECEPTIONIST'];
  for (let i = 1; i <= 14; i++) {
    const roleId = roles[i % roles.length];
    await prisma.user.create({
      data: {
        phone: `09200000${i.toString().padStart(2, '0')}`,
        passwordHash: '123456',
        fullName: `Nhân Sự Số ${i} (${roleId})`,
        role: roleId || 'PT',
        ...(roleId === 'PT' ? { trainerProfile: { create: { specialization: 'General Training' } } } : {})
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
      memberProfile: {
        create: {
          fingerprintId: 'QUAN_0111',
          remainingPtSessions: 24, // Đồng bộ số buổi vào Profile
          subscriptions: {
            create: {
              planId: diamond180.id,
              startDate: new Date(),
              endDate: new Date(new Date().setDate(new Date().getDate() + 180)),
              remainingPtSessions: 24,
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
    if (i % 2 === 0 && mem.memberProfile) {
      await prisma.memberSubscription.create({
        data: {
          memberId: mem.memberProfile.id,
          planId: plans[0].id, // Cấp gói 1
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          remainingPtSessions: 0,
          status: 'ACTIVE'
        }
      });
    }
  }

  console.log('Seeding thành công! Database đã ngập tràn Data giả lập Big Data.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
