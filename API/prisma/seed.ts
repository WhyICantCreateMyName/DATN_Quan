import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Bắt đầu dọn dẹp và khởi tạo bộ dữ liệu mẫu thực tế chuẩn xác 100%...');

  // 0. Xóa dữ liệu cũ theo đúng thứ tự ràng buộc khóa ngoại (Foreign Keys)
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
  await prisma.trainerAvailability.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.memberProfile.deleteMany();
  await prisma.lockerRow.deleteMany();
  await prisma.product.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Đã dọn sạch database');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ==========================================
  // 1. DANH MỤC GÓI TẬP (MEMBERSHIP PLANS)
  // 3 Hạng gói (Thường, VIP, VIP Khuyến mãi) x 4 mức thời hạn (1, 3, 6, 12 tháng)
  // + 3 Gói mua thêm (7, 14, 30 ngày) = Tổng cộng 15 gói
  // ==========================================
  console.log('📦 1. Tạo Danh mục Gói tập theo đúng yêu cầu (12 gói chính + 3 gói mua thêm)...');
  const planData = [
    // --- GÓI THƯỜNG (STANDARD) ---
    {
      name: 'Gói Thường 1 Tháng (Standard 30 Days)',
      price: 450000,
      durationDays: 30,
      ptSessions: 0,
      tag: 'STANDARD',
      description: 'Quyền tập luyện không giới hạn khung giờ trong 30 ngày, sử dụng toàn bộ máy tạ và cardio.'
    },
    {
      name: 'Gói Thường 3 Tháng (Standard 90 Days)',
      price: 1200000,
      durationDays: 90,
      ptSessions: 0,
      tag: 'STANDARD',
      description: 'Gói tập tiết kiệm 3 tháng, tặng kèm 1 lần đo chỉ số Inbody phân tích thể trạng ban đầu.'
    },
    {
      name: 'Gói Thường 6 Tháng (Standard 180 Days)',
      price: 2200000,
      durationDays: 180,
      ptSessions: 1,
      tag: 'STANDARD',
      description: 'Lộ trình rèn luyện 6 tháng bền vững, tặng 1 buổi định hướng tập luyện 1:1 cùng HLV.'
    },
    {
      name: 'Gói Thường 1 Năm (Standard 365 Days)',
      price: 3900000,
      durationDays: 365,
      ptSessions: 2,
      tag: 'STANDARD',
      description: 'Gói tập năm phổ thông giá tốt nhất, tặng 2 buổi hướng dẫn kỹ thuật cá nhân hóa.'
    },

    // --- GÓI VIP (VIP GOLD) ---
    {
      name: 'Gói VIP 1 Tháng (VIP Gold 30 Days)',
      price: 850000,
      durationDays: 30,
      ptSessions: 2,
      tag: 'VIP',
      description: 'Đặc quyền VIP 1 tháng: Xông hơi Sauna đá muối, tủ locker riêng trong ngày và 2 buổi tập PT 1:1.'
    },
    {
      name: 'Gói VIP 3 Tháng (VIP Gold 90 Days)',
      price: 2400000,
      durationDays: 90,
      ptSessions: 5,
      tag: 'VIP',
      description: 'Hạng thẻ VIP 3 tháng: Miễn phí nước detox, xông hơi không giới hạn và 5 buổi kèm sát từ PT.'
    },
    {
      name: 'Gói VIP 6 Tháng (VIP Gold 180 Days)',
      price: 4500000,
      durationDays: 180,
      ptSessions: 12,
      tag: 'VIP',
      description: 'Trải nghiệm VIP 6 tháng: Tặng khăn tập mỗi buổi, đo Inbody 2 tuần/lần và 12 buổi kèm chuyên sâu.'
    },
    {
      name: 'Gói VIP 1 Năm (VIP Diamond 365 Days)',
      price: 7900000,
      durationDays: 365,
      ptSessions: 25,
      tag: 'VIP',
      description: 'Đẳng cấp Diamond VIP 1 năm: Tủ locker cố định, nước khoáng miễn phí mỗi buổi tập và 25 buổi PT 1:1 trọn gói.'
    },

    // --- GÓI VIP KHUYẾN MÃI (PROMOTIONAL VIP) ---
    {
      name: 'Gói VIP Khuyến Mãi 1 Tháng (Promo VIP 30 Days)',
      price: 680000,
      durationDays: 30,
      ptSessions: 3,
      tag: 'PROMO_VIP',
      description: 'Ưu đãi trải nghiệm đặc quyền VIP giảm 20%: Miễn phí xông hơi thảo dược và tặng thêm 3 buổi PT.'
    },
    {
      name: 'Gói VIP Khuyến Mãi 3 Tháng (Promo VIP 90 Days)',
      price: 1800000,
      durationDays: 90,
      ptSessions: 8,
      tag: 'PROMO_VIP',
      description: 'Trợ giá mùa lễ hội giảm 25%: Đầy đủ quyền lợi VIP cao cấp và tặng 8 buổi huấn luyện chuyên sâu.'
    },
    {
      name: 'Gói VIP Khuyến Mãi 6 Tháng (Promo VIP 180 Days)',
      price: 3600000,
      durationDays: 180,
      ptSessions: 15,
      tag: 'PROMO_VIP',
      description: 'Gói vàng kích hoạt vóc dáng ưu đãi shock: 15 buổi PT kèm sát giáo án dinh dưỡng và thể hình.'
    },
    {
      name: 'Gói VIP Khuyến Mãi 1 Năm (Super VIP Promo 365 Days)',
      price: 6500000,
      durationDays: 365,
      ptSessions: 30,
      tag: 'PROMO_VIP',
      description: 'Đại tiệc tri ân hội viên 1 năm siêu tiết kiệm: Toàn quyền dịch vụ cao cấp và 30 buổi kèm chuyên gia Master PT.'
    },

    // --- 3 GÓI MUA THÊM (ADD-ON / SESSION-BASED PACKAGES) ---
    {
      name: 'Gói Mua Thêm 7 Ngày Tập (Vé Bổ Sung 7 Ngày)',
      price: 150000,
      durationDays: 7,
      ptSessions: 0,
      tag: 'ADDON',
      description: 'Gia hạn linh hoạt 7 ngày tập luyện nhanh dành cho khách đi công tác hoặc tập ngắn hạn.'
    },
    {
      name: 'Gói Mua Thêm 14 Ngày Tập (Vé Bổ Sung 14 Ngày)',
      price: 280000,
      durationDays: 14,
      ptSessions: 1,
      tag: 'ADDON',
      description: 'Gói bổ sung 14 ngày rèn luyện liên tục, tặng kèm 1 buổi kiểm tra thể lực cơ mỡ.'
    },
    {
      name: 'Gói Mua Thêm 30 Ngày Tập (Vé Bổ Sung 30 Ngày)',
      price: 500000,
      durationDays: 30,
      ptSessions: 2,
      tag: 'ADDON',
      description: 'Mua thêm 1 tháng tập luyện bổ trợ cho hợp đồng hiện tại với 2 buổi hỗ trợ từ PT.'
    }
  ];

  const plans: any[] = [];
  for (const p of planData) {
    const created = await prisma.membershipPlan.create({ data: p });
    plans.push(created);
  }
  console.log(`✓ Đã tạo thành công ${plans.length} gói tập`);

  // ==========================================
  // 2. CHÍNH SÁCH HOA HỒNG (COMMISSION RATES)
  // ==========================================
  console.log('💰 2. Thiết lập Chính sách hoa hồng chuẩn...');
  await prisma.commissionRate.create({
    data: {
      name: 'Hoa hồng dạy PT cá nhân 1:1',
      type: 'FIXED',
      value: 50000,
      applyTo: 'SESSION'
    }
  });
  await prisma.commissionRate.create({
    data: {
      name: 'Hoa hồng tư vấn bán Gói tập',
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

  // ==========================================
  // 3. SẢN PHẨM BÁN LẺ POS (TẠP HÓA PHÒNG GYM THEO KẾT QUẢ TÌM KIẾM THỰC TẾ)
  // Nước uống, thực phẩm bổ sung whey/bar, phụ kiện thể hình
  // ==========================================
  console.log('🥤 3. Tạo 24 Mặt hàng tạp hóa bán lẻ POS thực tế tại quầy lễ tân gym...');
  const productData = [
    // --- Nhóm Nước uống giải khát & Phục hồi bù điện giải ---
    { name: 'Nước khoáng thiên nhiên Lavie 500ml', price: 10000, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200' },
    { name: 'Nước uống bù điện giải Pocari Sweat 500ml', price: 20000, stock: 95, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
    { name: 'Nước uống thể thao Revive Chanh Muối 500ml', price: 15000, stock: 110, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200' },
    { name: 'Nước tăng lực Monster Energy Ultra White 355ml', price: 35000, stock: 65, imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200' },
    { name: 'Nước tăng lực Red Bull Thái Lan lon vàng 250ml', price: 20000, stock: 85, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200' },
    { name: 'Nước dừa tươi nguyên chất Cocoxim 330ml', price: 25000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200' },
    { name: 'Cà phê đen nguyên chất Pre-Workout đóng chai', price: 25000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200' },
    { name: 'Sinh tố Whey Protein Chuối xay trực tiếp (Juice Bar)', price: 45000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200' },

    // --- Nhóm Dinh dưỡng & Thực phẩm bổ sung (Supplements) ---
    { name: 'Gói Whey Gold Standard 100% Isolate (Sample 1 lần dùng)', price: 45000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },
    { name: 'Gói Rule 1 Protein Isolate (Sample 1 lần dùng)', price: 45000, stock: 75, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },
    { name: 'Gói BCAA Xtend phục hồi chống dị hóa cơ bắp', price: 30000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200' },
    { name: 'Gói Pre-Workout C4 Original tăng sức mạnh bùng nổ', price: 35000, stock: 55, imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200' },
    { name: 'Thanh Protein Bar Barebells Caramel Đan Mạch (20g Protein)', price: 75000, stock: 90, imageUrl: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=200' },
    { name: 'Thanh ngũ cốc năng lượng Play Nutrition vị Chocolate', price: 40000, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=200' },
    { name: 'Hộp kẹo bổ sung Creatine Monohydrate Chew (Gói 30 viên)', price: 120000, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200' },
    { name: 'Sữa Whey Protein Optimum Nutrition Gold Standard 5Lbs', price: 1850000, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },
    { name: 'Sữa Tăng Cân Nhanh Mass Gainer Mutant 15Lbs', price: 1750000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200' },

    // --- Nhóm Phụ kiện tập luyện chuyên dụng tại quầy ---
    { name: 'Bình lắc tập Gym Shaker Spider 3 ngăn 500ml', price: 85000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=200' },
    { name: 'Khăn tập thể thao Microfiber thấm hút kháng khuẩn', price: 50000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200' },
    { name: 'Găng tay tập Gym thể hình có đệm da chống chai tay Valeo', price: 130000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200' },
    { name: 'Dây kéo lưng Lifting Straps Aolikes hỗ trợ kéo xô / deadlift', price: 90000, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200' },
    { name: 'Dây quấn cổ tay trợ lực Wrist Wraps Harbinger', price: 150000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200' },
    { name: 'Đai lưng da tập Gym Squat & Deadlift Valeo Pro', price: 350000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200' },
    { name: 'Bộ dây kháng lực Mini Band tập mông đùi (Set 5 màu)', price: 120000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=200' },
    { name: 'Đôi tất thể thao chống trơn cổ ngắn chuyên dụng', price: 25000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=200' }
  ];

  const products: any[] = [];
  for (const prod of productData) {
    const created = await prisma.product.create({ data: prod });
    products.push(created);
  }
  console.log(`✓ Đã tạo thành công ${products.length} sản phẩm bán lẻ`);

  // ==========================================
  // 4. TÀI KHOẢN HỆ THỐNG (2 ADMIN)
  // ==========================================
  console.log('👑 4. Khởi tạo 2 Tài khoản Quản trị viên Hệ thống (Admin)...');
  const admin1 = await prisma.user.create({
    data: {
      phone: '0900000001',
      passwordHash: '123',
      fullName: 'Nguyễn Đức Quân (Admin Hệ Thống)',
      role: 'ADMIN',
      baseSalary: 25000000,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      phone: '0900000002',
      passwordHash: '123',
      fullName: 'Trần Hoàng Nam (Giám Đốc Vận Hành)',
      role: 'ADMIN',
      baseSalary: 22000000,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
    }
  });
  console.log('✓ Đã tạo 2 tài khoản ADMIN (0900000001 & 0900000002)');

  // ==========================================
  // 5. 4 TÀI KHOẢN LỄ TÂN XOAY CA 8 TIẾNG (04:00 - 20:00) CHIA ĐỀU TUẦN
  // Ca Sáng: 04:00 - 12:00 (8h)
  // Ca Chiều: 12:00 - 20:00 (8h)
  // ==========================================
  console.log('💁‍♀️ 5. Tạo 4 Tài khoản Lễ tân và Lịch trực xoay ca 8 tiếng (04:00 - 20:00)...');
  const receptionistData = [
    {
      phone: '0911000001',
      fullName: 'Lê Thị Thảo (Lễ Tân Trưởng)',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      baseSalary: 9500000
    },
    {
      phone: '0911000002',
      fullName: 'Trần Minh Tâm (Lễ Tân Thu Ngân)',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      baseSalary: 8500000
    },
    {
      phone: '0911000003',
      fullName: 'Phạm Thu Hà (Lễ Tân CSKH)',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
      baseSalary: 8500000
    },
    {
      phone: '0911000004',
      fullName: 'Hoàng Bích Ngọc (Lễ Tân Tiếp Đón)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      baseSalary: 8000000
    }
  ];

  const receptionists: any[] = [];
  for (const r of receptionistData) {
    const created = await prisma.user.create({
      data: {
        phone: r.phone,
        passwordHash: '123',
        fullName: r.fullName,
        role: 'RECEPTIONIST',
        baseSalary: r.baseSalary,
        avatarUrl: r.avatarUrl
      }
    });
    receptionists.push(created);
  }
  console.log('✓ Đã tạo 4 tài khoản RECEPTIONIST');

  // Lập lịch xoay ca 8 tiếng từ 04:00 đến 20:00 cho cả 7 ngày trong tuần
  // Lịch trực phủ kín 7 ngày trong tuần (từ Thứ 2 đến Chủ Nhật, cả tuần này và tuần tới)
  const daysOfWeekPlan = [
    { dayName: 'Thứ Hai', morning: 0, evening: 1 },    // Thảo (Sáng 04-12), Tâm (Chiều 12-20)
    { dayName: 'Thứ Ba', morning: 2, evening: 3 },     // Hà (Sáng 04-12), Ngọc (Chiều 12-20)
    { dayName: 'Thứ Tư', morning: 0, evening: 2 },     // Thảo (Sáng 04-12), Hà (Chiều 12-20)
    { dayName: 'Thứ Năm', morning: 1, evening: 3 },    // Tâm (Sáng 04-12), Ngọc (Chiều 12-20)
    { dayName: 'Thứ Sáu', morning: 0, evening: 3 },    // Thảo (Sáng 04-12), Ngọc (Chiều 12-20)
    { dayName: 'Thứ Bảy', morning: 1, evening: 2 },    // Tâm (Sáng 04-12), Hà (Chiều 12-20)
    { dayName: 'Chủ Nhật', morning: 2, evening: 0 }    // Hà (Sáng 04-12), Thảo (Chiều 12-20)
  ];

  // Tạo ca trực cho 7 ngày trước, hôm nay và 7 ngày tới (tổng 15 ngày phân ca đồng đều)
  for (let offset = -7; offset <= 7; offset++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + offset);
    const dayIndex = (targetDate.getDay() + 6) % 7; // Chuyển thành 0 = Thứ Hai ... 6 = Chủ Nhật
    const rotation = daysOfWeekPlan[dayIndex];

    // Ca Sáng: 04:00 - 12:00 (8 tiếng)
    const mStart = new Date(targetDate);
    mStart.setHours(4, 0, 0, 0);
    const mEnd = new Date(targetDate);
    mEnd.setHours(12, 0, 0, 0);

    await prisma.staffShift.create({
      data: {
        userId: receptionists[rotation.morning].id,
        startTime: mStart,
        endTime: mEnd,
        note: `Ca Sáng (04:00 - 12:00) - Mở cửa phòng tập, bàn giao chìa khóa & check-in ca sớm`
      }
    });

    // Ca Chiều: 12:00 - 20:00 (8 tiếng)
    const eStart = new Date(targetDate);
    eStart.setHours(12, 0, 0, 0);
    const eEnd = new Date(targetDate);
    eEnd.setHours(20, 0, 0, 0);

    await prisma.staffShift.create({
      data: {
        userId: receptionists[rotation.evening].id,
        startTime: eStart,
        endTime: eEnd,
        note: `Ca Chiều (12:00 - 20:00) - Tiếp đón giờ cao điểm, thu ngân POS & chốt sổ đóng cửa lúc 20:00`
      }
    });
  }
  console.log('✓ Đã tạo toàn bộ lịch xoay ca 8 tiếng 04:00 - 20:00 chuẩn 100% cho 4 Lễ tân');

  // ==========================================
  // 6. 5 TÀI KHOẢN PT XOAY CA TÙY CHỌN
  // ==========================================
  console.log('🏋️‍♂️ 6. Khởi tạo 5 Tài khoản Huấn luyện viên PT (Xoay ca tùy chọn)...');
  const trainerData = [
    {
      phone: '0922000001',
      fullName: 'Đặng Văn Lâm (PT Trưởng)',
      specialization: 'Thể hình Bodybuilding & Tăng cơ chuyên sâu (Hypertrophy)',
      bio: '8 năm kinh nghiệm thi đấu thể hình quốc gia, chuyên gia huấn luyện tăng cơ tối ưu và siết cơ chuẩn thi đấu.',
      avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=200',
      baseSalary: 12000000
    },
    {
      phone: '0922000002',
      fullName: 'Vũ Trọng Nghĩa (PT Thể Lực)',
      specialization: 'Giảm mỡ Siết cân & Cardio HIIT cường độ cao',
      bio: 'Chuyên gia thiết kế lộ trình giảm mỡ cấp tốc, rèn luyện sức bền tim mạch và phản xạ cơ thể linh hoạt.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      baseSalary: 10000000
    },
    {
      phone: '0922000003',
      fullName: 'Nguyễn Hoàng Long (PT Sức Mạnh)',
      specialization: 'Sức mạnh Powerlifting & Nâng tạ thể hình',
      bio: 'VĐV Powerlifting hạng 74kg, chuyên cải thiện kỹ thuật Squat - Bench - Deadlift an toàn và bứt phá ngưỡng tạ.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      baseSalary: 10000000
    },
    {
      phone: '0922000004',
      fullName: 'Đỗ Mai Anh (PT Nữ Vóc Dáng)',
      specialization: 'Pilates Mat, Thon gọn vóc dáng & Yoga Core',
      bio: 'Chứng nhận HLV Quốc tế, chuyên nắn chỉnh đường cong phụ nữ, săn chắc cơ mông đùi và cải thiện cơ lõi.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      baseSalary: 9500000
    },
    {
      phone: '0922000005',
      fullName: 'Phan Anh Tuấn (PT Trị Liệu)',
      specialization: 'Phục hồi chức năng, Chỉnh dáng & Trị liệu cơ xương khớp',
      bio: 'Bác sĩ Y học Thể thao, chuyên hỗ trợ phục hồi thoát vị đĩa đệm, đau mỏi vai gáy và lệch khớp vận động.',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
      baseSalary: 9500000
    }
  ];

  const trainers: any[] = [];
  for (const t of trainerData) {
    const created = await prisma.user.create({
      data: {
        phone: t.phone,
        passwordHash: '123',
        fullName: t.fullName,
        role: 'PT',
        baseSalary: t.baseSalary,
        avatarUrl: t.avatarUrl,
        trainerProfile: {
          create: {
            specialization: t.specialization,
            bio: t.bio
          }
        }
      },
      include: { trainerProfile: true }
    });
    trainers.push(created);
  }
  console.log('✓ Đã tạo 5 tài khoản PT kèm hồ sơ chuyên môn');

  // Khai báo lịch rảnh định kỳ (TrainerAvailability) xoay ca tùy chọn cho 5 PT
  console.log('⏰ Cài đặt Khung giờ rảnh tùy chọn (TrainerAvailability) cho các PT...');
  const availabilitySchedules = [
    // PT 1: Khung giờ sáng & chiều linh hoạt các ngày thứ 2, 4, 6
    [
      { dayOfWeek: 1, startTime: '06:00', endTime: '11:00' },
      { dayOfWeek: 1, startTime: '15:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '06:00', endTime: '11:00' },
      { dayOfWeek: 3, startTime: '15:00', endTime: '20:00' },
      { dayOfWeek: 5, startTime: '06:00', endTime: '11:00' },
      { dayOfWeek: 5, startTime: '15:00', endTime: '20:00' }
    ],
    // PT 2: Khung giờ chiều tối thứ 3, 5, 7
    [
      { dayOfWeek: 2, startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '17:30', endTime: '21:00' },
      { dayOfWeek: 4, startTime: '13:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '17:30', endTime: '21:00' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '15:00' }
    ],
    // PT 3: Toàn thời gian các ngày thứ 2 đến thứ 6
    [
      { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '12:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' }
    ],
    // PT 4: Ca sáng và chiều thứ 2, 3, 5, 6
    [
      { dayOfWeek: 1, startTime: '07:30', endTime: '11:30' },
      { dayOfWeek: 2, startTime: '15:30', endTime: '19:30' },
      { dayOfWeek: 4, startTime: '07:30', endTime: '11:30' },
      { dayOfWeek: 5, startTime: '15:30', endTime: '19:30' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' }
    ],
    // PT 5: Ca chiều tối các ngày trong tuần
    [
      { dayOfWeek: 1, startTime: '14:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '19:00' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '19:00' },
      { dayOfWeek: 6, startTime: '13:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '14:00' }
    ]
  ];

  for (let i = 0; i < trainers.length; i++) {
    const pt = trainers[i];
    const sched = availabilitySchedules[i];
    if (pt.trainerProfile) {
      for (const slot of sched) {
        await prisma.trainerAvailability.create({
          data: {
            trainerId: pt.trainerProfile.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime
          }
        });
      }
    }
  }

  // Phân bổ ca trực sàn / huấn luyện xoay ca tùy chọn trong tuần này cho 5 PT
  for (let i = 0; i < trainers.length; i++) {
    const pt = trainers[i];
    for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
      const sStart = new Date(now);
      sStart.setDate(sStart.getDate() + dayOffset);
      sStart.setHours(8 + (i * 2) % 6, 0, 0, 0);

      const sEnd = new Date(sStart);
      sEnd.setHours(sStart.getHours() + 6);

      await prisma.staffShift.create({
        data: {
          userId: pt.id,
          startTime: sStart,
          endTime: sEnd,
          note: `Ca trực sàn & Kèm học viên PT - HLV ${pt.fullName}`
        }
      });
    }
  }
  console.log('✓ Đã thiết lập lịch rảnh và ca trực linh hoạt cho 5 PT');

  // ==========================================
  // 7. 10 KHÁCH HÀNG CÓ TÀI KHOẢN (MEMBERS)
  // Đầy đủ hồ sơ cá nhân, vân tay, hợp đồng gói tập, chỉ số Inbody
  // ==========================================
  console.log('🏋️‍♀️ 7. Khởi tạo 10 Khách hàng hội viên có tài khoản...');
  const memberData = [
    {
      phone: '0933000001',
      fullName: 'Lê Tuấn Kiệt (VIP Diamond 1 Năm)',
      gender: 'MALE',
      planIdx: 7, // Gói VIP 1 Năm (Diamond)
      ptSessions: 25,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      fingerprintId: 'FP_0001',
      durationDays: 365,
      status: 'ACTIVE'
    },
    {
      phone: '0933000002',
      fullName: 'Trần Minh Châu (VIP Khuyến Mãi 6 Tháng)',
      gender: 'FEMALE',
      planIdx: 10, // Gói VIP Khuyến Mãi 6 Tháng
      ptSessions: 15,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      fingerprintId: 'FP_0002',
      durationDays: 180,
      status: 'ACTIVE'
    },
    {
      phone: '0933000003',
      fullName: 'Nguyễn Văn Bình (Gói Thường 3 Tháng)',
      gender: 'MALE',
      planIdx: 1, // Gói Thường 3 Tháng
      ptSessions: 0,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      fingerprintId: 'FP_0003',
      durationDays: 90,
      status: 'ACTIVE'
    },
    {
      phone: '0933000004',
      fullName: 'Phạm Phương Thảo (VIP 3 Tháng)',
      gender: 'FEMALE',
      planIdx: 5, // Gói VIP 3 Tháng
      ptSessions: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      fingerprintId: 'FP_0004',
      durationDays: 90,
      status: 'ACTIVE'
    },
    {
      phone: '0933000005',
      fullName: 'Hoàng Đức Anh (Gói Thường 1 Năm)',
      gender: 'MALE',
      planIdx: 3, // Gói Thường 1 Năm
      ptSessions: 2,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      fingerprintId: 'FP_0005',
      durationDays: 365,
      status: 'ACTIVE'
    },
    {
      phone: '0933000006',
      fullName: 'Vũ Thu Trang (Super VIP Khuyến Mãi 1 Năm)',
      gender: 'FEMALE',
      planIdx: 11, // Gói VIP Khuyến Mãi 1 Năm
      ptSessions: 30,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      fingerprintId: 'FP_0006',
      durationDays: 365,
      status: 'ACTIVE'
    },
    {
      phone: '0933000007',
      fullName: 'Đinh Hữu Phúc (Gói Thường 1 Tháng)',
      gender: 'MALE',
      planIdx: 0, // Gói Thường 1 Tháng
      ptSessions: 0,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      fingerprintId: 'FP_0007',
      durationDays: 30,
      status: 'ACTIVE'
    },
    {
      phone: '0933000008',
      fullName: 'Trịnh Mỹ Duyên (VIP 6 Tháng)',
      gender: 'FEMALE',
      planIdx: 6, // Gói VIP 6 Tháng
      ptSessions: 12,
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
      fingerprintId: 'FP_0008',
      durationDays: 180,
      status: 'ACTIVE'
    },
    {
      phone: '0933000009',
      fullName: 'Đào Quang Huy (Gói Bổ Sung 30 Ngày)',
      gender: 'MALE',
      planIdx: 14, // Gói Mua Thêm 30 Ngày
      ptSessions: 2,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
      fingerprintId: 'FP_0009',
      durationDays: 30,
      status: 'ACTIVE'
    },
    {
      phone: '0933000010',
      fullName: 'Lâm Bảo Ngọc (VIP Khuyến Mãi 1 Tháng)',
      gender: 'FEMALE',
      planIdx: 8, // Gói VIP Khuyến Mãi 1 Tháng
      ptSessions: 3,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
      fingerprintId: 'FP_0010',
      durationDays: 30,
      status: 'ACTIVE'
    }
  ];

  const members: any[] = [];
  for (const m of memberData) {
    const selectedPlan = plans[m.planIdx];
    const created = await prisma.user.create({
      data: {
        phone: m.phone,
        passwordHash: '123',
        fullName: m.fullName,
        role: 'MEMBER',
        avatarUrl: m.avatarUrl,
        memberProfile: {
          create: {
            fingerprintId: m.fingerprintId,
            remainingPtSessions: m.ptSessions,
            subscriptions: {
              create: {
                planId: selectedPlan.id,
                startDate: new Date(Date.now() - 5 * 86400000),
                endDate: new Date(Date.now() + m.durationDays * 86400000),
                grantedPtSessions: m.ptSessions,
                status: m.status
              }
            }
          }
        }
      },
      include: { memberProfile: true }
    });
    members.push(created);
  }
  console.log('✓ Đã tạo thành công 10 tài khoản MEMBER có hồ sơ và gói tập hoạt động');

  // ==========================================
  // 8. 2 DÃY TỦ LOCKER MA TRẬN 4x15 (4 HÀNG x 15 CỘT = 60 NGĂN MỖI DÃY)
  // Dãy A: Khu vực Nam (Tầng 1) - 4x15
  // Dãy B: Khu vực Nữ (Tầng 2) - 4x15
  // ==========================================
  console.log('🗄️ 8. Tạo 2 Dãy Locker quy mô 4x15 (Tổng 120 ngăn) theo yêu cầu...');

  // Dãy Locker A: 4 hàng x 15 cột
  // layout[row][col]: null = Trống, number (userId) = Đang sử dụng, 'BROKEN' = Đang bảo trì
  const layoutA: any[][] = Array.from({ length: 4 }, () => Array.from({ length: 15 }, () => null));
  // Gán tủ cho các hội viên Nam (Lưu user.id để giao diện hiển thị tên hội viên chuẩn xác)
  layoutA[0][0] = members[0].id; // Lê Tuấn Kiệt ô A001
  layoutA[0][2] = members[2].id; // Nguyễn Văn Bình ô A003
  layoutA[1][4] = members[4].id; // Hoàng Đức Anh ô A105
  layoutA[2][7] = members[6].id; // Đinh Hữu Phúc ô A208
  layoutA[3][10] = members[8].id; // Đào Quang Huy ô A311
  // Một số ngăn bảo trì thực tế
  layoutA[1][8] = 'BROKEN';
  layoutA[3][14] = 'BROKEN';

  await prisma.lockerRow.create({
    data: {
      name: 'A',
      rowCount: 4,
      colCount: 15,
      layout: layoutA as any
    }
  });

  // Dãy Locker B: 4 hàng x 15 cột
  const layoutB: any[][] = Array.from({ length: 4 }, () => Array.from({ length: 15 }, () => null));
  // Gán tủ cho các hội viên Nữ
  layoutB[0][1] = members[1].id; // Trần Minh Châu ô B002
  layoutB[0][5] = members[3].id; // Phạm Phương Thảo ô B006
  layoutB[1][6] = members[5].id; // Vũ Thu Trang ô B107
  layoutB[2][9] = members[7].id; // Trịnh Mỹ Duyên ô B210
  layoutB[3][12] = members[9].id; // Lâm Bảo Ngọc ô B313
  // Một số ngăn bảo trì
  layoutB[0][14] = 'BROKEN';
  layoutB[2][3] = 'BROKEN';

  await prisma.lockerRow.create({
    data: {
      name: 'B',
      rowCount: 4,
      colCount: 15,
      layout: layoutB as any
    }
  });
  console.log('✓ Đã tạo 2 dãy Locker 4x15 (Dãy A và Dãy B) tích hợp quản lý ngăn trống/sử dụng/bảo trì');

  // ==========================================
  // 9. LỚP HỌC NHÓM (GROUP CLASSES)
  // Yoga, Zumba, Kickfit, Spinning
  // ==========================================
  console.log('🧘 9. Tạo Lịch Lớp học nhóm (Group Classes)...');
  const classTemplates = [
    { name: 'Yoga Hatha Đánh Thức Năng Lượng Sáng', capacity: 15, hStart: 6, mStart: 30, hEnd: 7, mEnd: 30 },
    { name: 'Pilates Core & Giữ Dáng Thon Gọn', capacity: 12, hStart: 8, mStart: 30, hEnd: 9, mEnd: 30 },
    { name: 'Kickfit Cardio & Đốt Mỡ Cường Độ Cao', capacity: 14, hStart: 17, mStart: 30, hEnd: 18, mEnd: 30 },
    { name: 'Zumba Dance Vũ Điệu Năng Động', capacity: 20, hStart: 18, mStart: 30, hEnd: 19, mEnd: 30 },
    { name: 'Spinning Đạp Xe Sức Bền Nhịp Điệu', capacity: 16, hStart: 19, mStart: 30, hEnd: 20, mEnd: 30 }
  ];

  const createdClasses: any[] = [];
  for (let d = 0; d <= 3; d++) {
    for (const ct of classTemplates) {
      const cStart = new Date(now);
      cStart.setDate(cStart.getDate() + d);
      cStart.setHours(ct.hStart, ct.mStart, 0, 0);

      const cEnd = new Date(now);
      cEnd.setDate(cEnd.getDate() + d);
      cEnd.setHours(ct.hEnd, ct.mEnd, 0, 0);

      const cls = await prisma.groupClass.create({
        data: {
          name: ct.name,
          capacity: ct.capacity,
          startTime: cStart,
          endTime: cEnd
        }
      });
      createdClasses.push(cls);
    }
  }

  // ==========================================
  // 10. CHỈ SỐ INBODY, LỊCH HẸN & GIÁO ÁN TẬP LUYỆN THỰC TẾ
  // Hội viên VIP Lê Tuấn Kiệt cùng Master PT Đặng Văn Lâm
  // ==========================================
  console.log('📊 10. Tạo Chỉ số Inbody tiến trình và Nhật ký tập luyện cho Hội viên VIP...');
  const kietProfile = members[0].memberProfile;
  const lamProfile = trainers[0].trainerProfile;

  if (kietProfile && lamProfile) {
    // 3 lần đo Inbody ghi nhận sự tiến bộ vượt bậc
    await prisma.bodyMetric.create({
      data: {
        memberId: kietProfile.id,
        trainerId: lamProfile.id,
        weight: 78.5,
        height: 176.0,
        bmi: 25.3,
        bodyFat: 24.2,
        muscleMass: 33.1,
        recordedAt: new Date(Date.now() - 60 * 86400000)
      }
    });

    await prisma.bodyMetric.create({
      data: {
        memberId: kietProfile.id,
        trainerId: lamProfile.id,
        weight: 75.8,
        height: 176.0,
        bmi: 24.5,
        bodyFat: 20.6,
        muscleMass: 34.5,
        recordedAt: new Date(Date.now() - 30 * 86400000)
      }
    });

    await prisma.bodyMetric.create({
      data: {
        memberId: kietProfile.id,
        trainerId: lamProfile.id,
        weight: 73.2,
        height: 176.0,
        bmi: 23.6,
        bodyFat: 16.9,
        muscleMass: 36.2,
        recordedAt: new Date(Date.now() - 2 * 86400000)
      }
    });

    // Buổi tập thân trên đã hoàn thành
    const b1 = await prisma.booking.create({
      data: {
        memberId: kietProfile.id,
        trainerId: lamProfile.id,
        startTime: new Date(Date.now() - 2 * 86400000),
        endTime: new Date(Date.now() - 2 * 86400000 + 3600000),
        status: 'COMPLETED'
      }
    });

    await prisma.workoutLog.create({
      data: {
        memberId: kietProfile.id,
        trainerId: lamProfile.id,
        bookingId: b1.id,
        date: new Date(Date.now() - 2 * 86400000),
        notes: 'Buổi tập Ngực & Tay Sau (Chest & Triceps Focus) - Thể lực cực tốt, tăng mức tạ Bench Press',
        energyLevel: 'Tràn đầy năng lượng',
        nutrition: 'Uống 1 muỗng Whey Gold sau tập, duy trì 160g protein/ngày',
        exercises: {
          create: [
            { name: 'Barbell Bench Press', sets: 4, reps: 10, weight: 80.0, notes: 'Kiểm soát giai đoạn hạ tạ (eccentric 3s)' },
            { name: 'Incline Dumbbell Press', sets: 4, reps: 12, weight: 28.0, notes: 'Góc dốc 30 độ, siết chặt ngực trên' },
            { name: 'Dips (Xà kép)', sets: 3, reps: 12, weight: 0.0, notes: 'Đổ người về trước 15 độ' },
            { name: 'Rope Triceps Pushdown', sets: 4, reps: 15, weight: 25.0, notes: 'Tách dây ở điểm cuối để cô lập tay sau' }
          ]
        }
      }
    });

    // Buổi tập hôm nay đã xác nhận
    await prisma.booking.create({
      data: {
        memberId: kietProfile.id,
        trainerId: lamProfile.id,
        startTime: new Date(new Date().setHours(17, 30, 0, 0)),
        endTime: new Date(new Date().setHours(18, 30, 0, 0)),
        status: 'CONFIRMED'
      }
    });

    // Đặt chỗ lớp học Kickfit ngày mai
    if (createdClasses[2]) {
      await prisma.booking.create({
        data: {
          memberId: kietProfile.id,
          groupClassId: createdClasses[2].id,
          startTime: createdClasses[2].startTime,
          endTime: createdClasses[2].endTime,
          status: 'CONFIRMED'
        }
      });
    }
  }

  // ==========================================
  // 11. CHECK-IN HÔM NAY (30 LƯỢT CHECK-IN CHO DASHBOARD)
  // ==========================================
  console.log('🚪 11. Tạo 30 Lượt Check-in hôm nay sinh động...');
  const checkinMethods = ['QR_CODE', 'FINGERPRINT', 'FACE_ID'];
  for (let i = 0; i < 28; i++) {
    const mem = members[i % members.length];
    if (mem.memberProfile) {
      const hour = 5 + Math.floor(i / 2.5);
      const minute = (i * 11) % 60;
      const cTime = new Date(now);
      cTime.setHours(hour, minute, 0, 0);

      await prisma.checkIn.create({
        data: {
          memberId: mem.memberProfile.id,
          checkInTime: cTime,
          method: checkinMethods[i % checkinMethods.length]
        }
      });
    }
  }

  // ==========================================
  // 12. DÒNG DOANH THU & HÓA ĐƠN 7 NGÀY GẦN NHẤT
  // ==========================================
  console.log('💳 12. Tạo Dòng tiền Hóa đơn bán gói và hàng hóa 7 ngày qua...');
  const mainCashier = receptionists[0];

  const dailyRevenues = [
    { dayOffset: 6, amount: 6500000, method: 'CASH', planIdx: 0, prodIdx: 0 },
    { dayOffset: 5, amount: 9800000, method: 'TRANSFER', planIdx: 1, prodIdx: 1 },
    { dayOffset: 4, amount: 15400000, method: 'CARD', planIdx: 5, prodIdx: 3 },
    { dayOffset: 3, amount: 8200000, method: 'MOMO', planIdx: 8, prodIdx: 8 },
    { dayOffset: 2, amount: 18600000, method: 'TRANSFER', planIdx: 6, prodIdx: 12 },
    { dayOffset: 1, amount: 12500000, method: 'CASH', planIdx: 2, prodIdx: 17 },
    { dayOffset: 0, amount: 24800000, method: 'TRANSFER', planIdx: 7, prodIdx: 15 } // Hôm nay doanh thu cao
  ];

  for (const dr of dailyRevenues) {
    const invDate = new Date(now);
    invDate.setDate(invDate.getDate() - dr.dayOffset);
    invDate.setHours(10 + dr.dayOffset, 15, 0, 0);

    const targetPlan = plans[dr.planIdx];
    const targetProduct = products[dr.prodIdx];

    await prisma.invoice.create({
      data: {
        cashierId: mainCashier.id,
        memberId: members[dr.dayOffset % members.length]?.memberProfile?.id || null,
        totalAmount: dr.amount,
        paymentMethod: dr.method,
        createdAt: invDate,
        items: {
          create: [
            {
              planId: targetPlan?.id,
              quantity: 1,
              unitPrice: targetPlan?.price || 1200000,
              subTotal: targetPlan?.price || 1200000
            },
            {
              productId: targetProduct?.id,
              quantity: 2,
              unitPrice: targetProduct?.price || 50000,
              subTotal: (targetProduct?.price || 50000) * 2
            }
          ]
        }
      }
    });
  }

  // ==========================================
  // 13. CHỈ TIÊU KPI & HOA HỒNG NHÂN SỰ (HRM)
  // ==========================================
  console.log('🎯 13. Cài đặt Chỉ tiêu KPI và Nhật ký hoa hồng thực tế...');
  // KPI Admin & Nhân sự tháng này
  await prisma.staffKPI.create({
    data: {
      userId: admin1.id,
      month: currentMonth,
      year: currentYear,
      targetAmount: 150000000,
      achievedAmount: 125000000
    }
  });

  await prisma.staffKPI.create({
    data: {
      userId: receptionists[0].id, // Lê Thị Thảo
      month: currentMonth,
      year: currentYear,
      targetAmount: 45000000,
      achievedAmount: 38500000
    }
  });

  await prisma.staffKPI.create({
    data: {
      userId: receptionists[1].id, // Trần Minh Tâm
      month: currentMonth,
      year: currentYear,
      targetAmount: 35000000,
      achievedAmount: 29000000
    }
  });

  await prisma.staffKPI.create({
    data: {
      userId: trainers[0].id, // Đặng Văn Lâm (PT Trưởng)
      month: currentMonth,
      year: currentYear,
      targetAmount: 30000000,
      achievedAmount: 26500000
    }
  });

  await prisma.staffKPI.create({
    data: {
      userId: trainers[1].id, // Vũ Trọng Nghĩa
      month: currentMonth,
      year: currentYear,
      targetAmount: 25000000,
      achievedAmount: 21000000
    }
  });

  // Nhật ký hoa hồng chi trả
  await prisma.commissionLog.createMany({
    data: [
      {
        userId: trainers[0].id,
        amount: 50000,
        reason: 'Hoa hồng hoàn thành buổi tập PT 1:1 - Hội viên Lê Tuấn Kiệt',
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        userId: trainers[0].id,
        amount: 790000,
        reason: 'Hoa hồng 10% tư vấn thành công Gói VIP 1 Năm (Diamond) - Hội viên Lê Tuấn Kiệt',
        createdAt: new Date(Date.now() - 5 * 86400000)
      },
      {
        userId: trainers[1].id,
        amount: 50000,
        reason: 'Hoa hồng buổi tập HIIT Cardio giảm mỡ',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        userId: receptionists[0].id,
        amount: 360000,
        reason: 'Hoa hồng 10% tư vấn Gói VIP Khuyến Mãi 6 Tháng - Hội viên Trần Minh Châu',
        createdAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        userId: receptionists[0].id,
        amount: 650000,
        reason: 'Hoa hồng 10% bán Gói Super VIP Khuyến Mãi 1 Năm - Hội viên Vũ Thu Trang',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        userId: receptionists[1].id,
        amount: 240000,
        reason: 'Hoa hồng 10% chốt hợp đồng Gói VIP 3 Tháng - Hội viên Phạm Phương Thảo',
        createdAt: new Date(Date.now() - 4 * 86400000)
      }
    ]
  });

  console.log('✨ HOÀN TẤT KHỞI TẠO BỘ DỮ LIỆU SEED MỚI THỰC TẾ 100%!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 2 TÀI KHOẢN ADMIN:');
  console.log('   - 0900000001 | Mật khẩu: 123 (Nguyễn Đức Quân - Admin Hệ Thống)');
  console.log('   - 0900000002 | Mật khẩu: 123 (Trần Hoàng Nam - Giám Đốc Vận Hành)');
  console.log('📌 4 TÀI KHOẢN LỄ TÂN (XOAY CA 8H TỪ 04:00 ĐẾN 20:00 CẢ TUẦN):');
  console.log('   - 0911000001 | 123 (Lê Thị Thảo - Lễ Tân Trưởng)');
  console.log('   - 0911000002 | 123 (Trần Minh Tâm - Lễ Tân Thu Ngân)');
  console.log('   - 0911000003 | 123 (Phạm Thu Hà - Lễ Tân CSKH)');
  console.log('   - 0911000004 | 123 (Hoàng Bích Ngọc - Lễ Tân Tiếp Đón)');
  console.log('📌 5 TÀI KHOẢN PT (XOAY CA TÙY CHỌN):');
  console.log('   - 0922000001 | 123 (Đặng Văn Lâm - PT Trưởng Bodybuilding)');
  console.log('   - 0922000002 | 123 (Vũ Trọng Nghĩa - PT Giảm Mỡ Cardio)');
  console.log('   - 0922000003 | 123 (Nguyễn Hoàng Long - PT Sức Mạnh Powerlifting)');
  console.log('   - 0922000004 | 123 (Đỗ Mai Anh - PT Nữ Pilates & Yoga Core)');
  console.log('   - 0922000005 | 123 (Phan Anh Tuấn - PT Trị Liệu Phục Hồi)');
  console.log('📌 10 TÀI KHOẢN HỘI VIÊN (MEMBER):');
  console.log('   - 0933000001 đến 0933000010 | Mật khẩu: 123');
  console.log('   - 0933000001: Lê Tuấn Kiệt (VIP Diamond 1 Năm, 25 buổi PT, Inbody)');
  console.log('   - 0933000002: Trần Minh Châu (VIP Khuyến Mãi 6 Tháng, 15 buổi PT)');
  console.log('📌 HỆ THỐNG GÓI TẬP: 12 Gói chính (Thường, VIP, VIP Khuyến mãi 1/3/6/12 tháng) + 3 Gói mua thêm (7, 14, 30 ngày)');
  console.log('📌 HÀNG HÓA BÁN LẺ POS: 24 mặt hàng nước uống bù điện giải, thực phẩm bổ sung, phụ kiện tập');
  console.log('📌 2 DÃY TỦ LOCKER 4x15: Dãy A (60 ngăn) & Dãy B (60 ngăn) đầy đủ trạng thái');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
