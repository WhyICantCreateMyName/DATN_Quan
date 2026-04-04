import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu dọn dẹp và khởi tạo dữ liệu mẫu (Seeding)...');
  
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
  for (let i = 1; i <= 5; i++) {
    const plan = await prisma.membershipPlan.create({
      data: {
        name: `Gói Tập Hạng ${i} - Standard`,
        price: 500000 * i,
        durationDays: 30 * i,
        ptSessions: i > 2 ? 5 : 0,
        description: `Quyền lợi thẻ mốc ${i}`
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

  const roles = ['RECEPTIONIST', 'PT', 'PT', 'RECEPTIONIST'];
  for (let i = 1; i <= 14; i++) {
    const roleId = roles[i % roles.length];
    await prisma.user.create({
      data: {
        phone: `09200000${i.toString().padStart(2, '0')}`,
        passwordHash: '123456',
        fullName: `Nhân Sự Số ${i} (${roleId})`,
        role: roleId,
        trainerProfile: roleId === 'PT' ? { create: { specialization: 'General Training' } } : undefined
      }
    });
  }

  // 4. Tạo 25 Members (Khách Hàng)
  console.log('Tạo 25 Khách hàng...');
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
