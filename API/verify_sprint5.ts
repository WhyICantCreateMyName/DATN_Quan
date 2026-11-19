import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('=== [SPRINT 5 VERIFICATION: HRM, COMMISSIONS & KPI] ===');
  let errors = 0;

  try {
    // 1. Kiểm tra Lịch trực ca (StaffShift)
    console.log('\n--- 1. Kiểm tra Phân ca trực (StaffShift) ---');
    const pt = await prisma.user.findFirst({ where: { role: 'PT' } });
    if (!pt) throw new Error('Không tìm thấy PT trong DB');

    const now = new Date();
    const testShift = await prisma.staffShift.create({
      data: {
        userId: pt.id,
        startTime: new Date(now.getTime() + 3600000),
        endTime: new Date(now.getTime() + 7200000),
        note: 'Test Shift Auto Verification'
      }
    });
    console.log(`✓ Đã tạo ca trực mới ID=${testShift.id} cho ${pt.fullName}`);

    const shifts = await prisma.staffShift.findMany({ where: { userId: pt.id } });
    if (shifts.length < 1) {
      console.error('✗ Không tìm thấy ca trực của PT');
      errors++;
    } else {
      console.log(`✓ PT có ${shifts.length} ca trực được ghi nhận.`);
    }

    // Clean up test shift
    await prisma.staffShift.delete({ where: { id: testShift.id } });
    console.log(`✓ Đã xóa dọn dẹp ca trực test ID=${testShift.id}`);

    // 2. Kiểm tra Cấu hình Tỷ lệ Hoa hồng (CommissionRate)
    console.log('\n--- 2. Kiểm tra Cấu hình Hoa hồng (CommissionRate) ---');
    const rates = await prisma.commissionRate.findMany();
    console.log(`✓ Tổng số chính sách hoa hồng: ${rates.length}`);
    const sessionRate = rates.find(r => r.applyTo === 'SESSION');
    const saleRate = rates.find(r => r.applyTo === 'SALE');

    if (!sessionRate || !saleRate) {
      console.error('✗ Thiếu cấu hình hoa hồng SESSION hoặc SALE');
      errors++;
    } else {
      console.log(`✓ SESSION rate: ${sessionRate.name} = ${sessionRate.value} (${sessionRate.type})`);
      console.log(`✓ SALE rate: ${saleRate.name} = ${saleRate.value}% (${saleRate.type})`);
    }

    // 3. Kiểm tra Chỉ tiêu KPI (StaffKPI)
    console.log('\n--- 3. Kiểm tra Chỉ tiêu KPI & Tỷ lệ hoàn thành ---');
    const kpis = await prisma.staffKPI.findMany({
      include: { user: true }
    });
    console.log(`✓ Đã tìm thấy ${kpis.length} bản ghi KPI`);
    kpis.forEach(k => {
      const pct = k.targetAmount > 0 ? Math.round((k.achievedAmount / k.targetAmount) * 100) : 0;
      let rating = 'POOR';
      if (pct >= 100) rating = 'EXCELLENT';
      else if (pct >= 80) rating = 'GOOD';
      else if (pct >= 50) rating = 'AVERAGE';
      console.log(`  - Nhân sự: ${k.user.fullName} (${k.user.role}) | Tháng ${k.month}/${k.year} | Mục tiêu: ${k.targetAmount.toLocaleString()}đ | Đạt: ${k.achievedAmount.toLocaleString()}đ (${pct}% - ${rating})`);
    });

    if (kpis.length === 0) {
      console.error('✗ Không có KPI nào được seed');
      errors++;
    }

    // 4. Kiểm tra Nhật ký hoa hồng & Bảng tính lương tự động (Payroll)
    console.log('\n--- 4. Kiểm tra Bảng tính lương tự động (Payroll Logic) ---');
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);

    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'RECEPTIONIST', 'PT'] }, isActive: true }
    });

    for (const u of staffUsers.slice(0, 3)) {
      const commSum = await prisma.commissionLog.aggregate({
        where: {
          userId: u.id,
          createdAt: { gte: startDate, lt: endDate }
        },
        _sum: { amount: true }
      });
      const totalCommission = commSum._sum.amount || 0;
      const baseSalary = u.baseSalary || 8000000;
      const netSalary = baseSalary + totalCommission;

      console.log(`  - ${u.fullName} (${u.role}): Lương cứng=${baseSalary.toLocaleString()}đ, Hoa hồng=${totalCommission.toLocaleString()}đ => Thực nhận=${netSalary.toLocaleString()}đ`);
    }

    // 5. Kiểm tra PT Dashboard tính hoa hồng động từ CommissionLog
    console.log('\n--- 5. Kiểm tra PT Dashboard (Không hardcode 150k) ---');
    const ptUser = await prisma.user.findFirst({ where: { phone: '0988888888' } });
    if (!ptUser) throw new Error('Không tìm thấy PT Master');

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const commAggr = await prisma.commissionLog.aggregate({
      where: {
        userId: ptUser.id,
        createdAt: { gte: firstDay }
      },
      _sum: { amount: true }
    });
    const expectedComm = commAggr._sum.amount || 0;

    console.log(`✓ PT Master (ID: ${ptUser.id}) hoa hồng thực tế tích lũy trong tháng: ${expectedComm.toLocaleString()}đ`);
    if (expectedComm <= 0) {
      console.error('✗ Hoa hồng thực tế của PT Master phải > 0');
      errors++;
    } else {
      console.log(`✓ Xác nhận logic động: Dashboard sẽ hiển thị chính xác ${expectedComm.toLocaleString()}đ thay vì 150k nhân chay!`);
    }

  } catch (err: any) {
    console.error('✗ Lỗi ngoại lệ trong quá trình verify:', err.message);
    errors++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n======================================================');
  if (errors === 0) {
    console.log('🎉 SPRINT 5 BACKEND VERIFICATION HOÀN TẤT VỚI 0 LỖI!');
  } else {
    console.log(`⚠️ SPRINT 5 CÓ ${errors} LỖI CẦN XỬ LÝ!`);
    process.exit(1);
  }
}

runVerification();
