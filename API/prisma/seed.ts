import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu khởi tạo dữ liệu mẫu (Seeding)...');

  // 1. Tạo gói tập cơ bản
  const plan1 = await prisma.membershipPlan.create({
    data: {
      name: 'Thẻ Vàng 1 Tháng',
      price: 500000,
      durationDays: 30,
      ptSessions: 0,
      description: 'Tập khu vực gym cơ bản, không giới hạn giờ'
    }
  });

  const plan2 = await prisma.membershipPlan.create({
    data: {
      name: 'Thẻ Kim Cương 6 Tháng',
      price: 2500000,
      durationDays: 180,
      ptSessions: 3,
      description: 'Full dịch vụ, tặng 3 buổi với PT cá nhân'
    }
  });

  // 2. Tạo một vài sản phẩm bán lẻ
  await prisma.product.create({ data: { name: 'Whey Protein 1Kg', price: 1500000, stock: 20 }});
  await prisma.product.create({ data: { name: 'Thảm Yoga cao cấp', price: 250000, stock: 50 }});
  await prisma.product.create({ data: { name: 'Nước Khoáng Dasani', price: 10000, stock: 200 }});

  // 3. Tạo User Lễ tân, PT, Admin
  await prisma.user.create({
    data: {
      phone: '0900000000',
      passwordHash: '123456',
      fullName: 'Quản Lý Cấp Cao',
      role: 'ADMIN'
    }
  });

  const receptionist = await prisma.user.create({
    data: {
      phone: '0901111111',
      passwordHash: '123456',
      fullName: 'Nguyễn Thị Lễ Tân',
      role: 'RECEPTIONIST'
    }
  });

  const trainer = await prisma.user.create({
    data: {
      phone: '0902222222',
      passwordHash: '123456',
      fullName: 'Trần Văn PT',
      role: 'PT',
      trainerProfile: {
        create: { specialization: 'Thể hình & Giảm mỡ' }
      }
    }
  });

  const member = await prisma.user.create({
    data: {
      phone: '0903333333',
      passwordHash: '123456',
      fullName: 'Lê Khách Hàng VIP',
      role: 'MEMBER',
      memberProfile: {
        create: { fingerprintId: 'FP_001' }
      }
    },
    include: { memberProfile: true }
  });

  // 4. Tạo Subscription cho Member
  if (member.memberProfile) {
    await prisma.memberSubscription.create({
      data: {
        memberId: member.memberProfile.id,
        planId: plan1.id,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        remainingPtSessions: 0,
        status: 'ACTIVE'
      }
    });

    // Tạo Inbody Tracking để có report
    await prisma.bodyMetric.create({
      data: {
        memberId: member.memberProfile.id,
        weight: 70.5,
        height: 1.75,
        bmi: 23.0,
        bodyFat: 18.5,
        muscleMass: 33.2
      }
    });
  }

  // 5. Lớp học nhóm
  await prisma.groupClass.create({
    data: {
      name: 'Yoga Chăm Sóc Cột Sống',
      capacity: 25,
      startTime: new Date(new Date().setHours(18, 0, 0, 0)),
      endTime: new Date(new Date().setHours(19, 0, 0, 0))
    }
  });

  console.log('Seeding thành công! Database đã được có dữ liệu mẫu.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
