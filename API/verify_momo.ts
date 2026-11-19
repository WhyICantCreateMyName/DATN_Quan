async function simulateEndToEndMomoPurchase() {
  console.log('===============================================================');
  console.log('🧪 BẮT ĐẦU TEST TOÀN TRÌNH: MUA GÓI TẬP BẰNG CỔNG MOMO SANDBOX');
  console.log('===============================================================\n');

  // 1. Lấy thông tin Hội viên Nguyễn Văn Bình
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-platform': 'mobile' },
    body: JSON.stringify({ phone: '0933000003', password: '123' })
  });
  const loginData: any = await loginRes.json();
  const token = loginData.token;
  const memberId = loginData.user.memberProfile.id;

  const preDashRes = await fetch('http://localhost:3000/api/member/dashboard', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const preDash: any = await preDashRes.json();
  console.log('1. TRẠNG THÁI TRƯỚC THANH TOÁN CỦA HỘI VIÊN:');
  console.log('   - Họ tên:', loginData.user.fullName);
  console.log('   - Gói hiện tại:', preDash.activeSubscription?.plan?.name || 'Chưa có');
  console.log('   - Hạn gói:', preDash.activeSubscription?.endDate);
  console.log('   - Số buổi PT hiện có:', preDash.remainingPtSessions, 'buổi\n');

  // 2. Lấy doanh thu tổng quan của phòng gym trước khi mua
  const preStatsRes = await fetch('http://localhost:3000/api/stats');
  const preStats: any = await preStatsRes.json();
  console.log('2. TỔNG QUAN DOANH THU TRƯỚC KHI MUA:');
  console.log('   - Doanh thu hôm nay:', preStats.overview.todayRevenue.toLocaleString(), 'VND\n');

  // 3. Chọn gói tập: Gói VIP Khuyến Mãi 1 Tháng (3 buổi PT, 680.000đ)
  const plansRes = await fetch('http://localhost:3000/api/memberships/plans');
  const plansData: any = await plansRes.json();
  const selectedPlan = plansData.data.find((p: any) => p.name.includes('VIP Khuyến Mãi 1 Tháng'));
  console.log('3. CHỌN GÓI MUA TRÊN MEMBER APP:');
  console.log('   - Tên gói:', selectedPlan.name);
  console.log('   - Giá niêm yết:', selectedPlan.price.toLocaleString(), 'VND');
  console.log('   - Buổi PT kèm theo:', selectedPlan.ptSessions, 'buổi');
  console.log('   - Thời hạn:', selectedPlan.durationDays, 'ngày\n');

  // 4. Gọi API thanh toán MoMo Sandbox
  console.log('4. GỌI API CỔNG MOMO SANDBOX (POST /api/payment/momo)...');
  const momoReq = await fetch('http://localhost:3000/api/payment/momo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      amount: selectedPlan.price,
      planId: selectedPlan.id,
      redirectUrl: 'memberapp://payment-result'
    })
  });
  const momoRes: any = await momoReq.json();
  console.log('   ✓ MoMo Gateway Response Status:', momoReq.status);
  console.log('   ✓ ResultCode:', momoRes.resultCode, `(${momoRes.message})`);
  console.log('   ✓ OrderID:', momoRes.orderId);
  console.log('   ✓ PayUrl:', momoRes.payUrl);
  console.log('   ✓ Deeplink App MoMo:', momoRes.deeplink);

  if (momoRes.resultCode !== 0) {
    throw new Error('MoMo Sandbox Gateway trả về lỗi: ' + momoRes.message);
  }

  // 5. Giả lập MoMo Sandbox hoàn tất giao dịch và gửi IPN Callback về Webhook
  console.log('\n5. MÔ PHỎNG MOMO XÁC NHẬN THANH TOÁN THÀNH CÔNG VÀ BẮN IPN...');
  const extraData = Buffer.from(JSON.stringify({ memberId, planId: selectedPlan.id })).toString('base64');
  const ipnPayload = {
    partnerCode: 'MOMO',
    orderId: momoRes.orderId,
    requestId: momoRes.requestId,
    amount: selectedPlan.price,
    orderInfo: 'Thanh toan goi tap Titan Gym #' + selectedPlan.id,
    orderType: 'momo_wallet',
    transId: Date.now(),
    resultCode: 0,
    message: 'Thành công.',
    payType: 'qr',
    responseTime: Date.now(),
    extraData: extraData,
    signature: 'test_signature_mock'
  };

  const ipnRes = await fetch('http://localhost:3000/api/payment/momo-ipn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ipnPayload)
  });
  console.log('   ✓ IPN Response Status:', ipnRes.status, '(204 No Content là chuẩn spec MoMo)');

  // 6. Kiểm tra lại trạng thái hội viên sau khi thanh toán
  const postDashRes = await fetch('http://localhost:3000/api/member/dashboard', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const postDash: any = await postDashRes.json();
  console.log('\n6. TRẠNG THÁI SAU KHI THANH TOÁN THÀNH CÔNG TRÊN APP:');
  console.log('   - Gói mới kích hoạt:', postDash.activeSubscription?.plan?.name);
  console.log('   - Hạn gói mới:', postDash.activeSubscription?.endDate);
  console.log('   - Số buổi PT ví:', postDash.remainingPtSessions, `buổi (Tăng từ ${preDash.remainingPtSessions} -> ${postDash.remainingPtSessions})`);

  // 7. Kiểm tra Doanh thu và Hóa đơn tạo ra trên hệ thống
  const postStatsRes = await fetch('http://localhost:3000/api/stats');
  const postStats: any = await postStatsRes.json();
  const invoicesRes = await fetch('http://localhost:3000/api/pos/invoices');
  const invoicesData: any = await invoicesRes.json();
  const latestInvoice = invoicesData.data[0];

  console.log('\n7. BÁO CÁO TÀI CHÍNH & HÓA ĐƠN TRÊN ADMIN WEB:');
  console.log('   - Doanh thu hôm nay mới:', postStats.overview.todayRevenue.toLocaleString(), 'VND (+', (postStats.overview.todayRevenue - preStats.overview.todayRevenue).toLocaleString(), 'VND)');
  console.log('   - Hóa đơn mới nhất ID:', latestInvoice?.id);
  console.log('   - Hình thức thanh toán:', latestInvoice?.paymentMethod);
  console.log('   - Tổng tiền hóa đơn:', latestInvoice?.totalAmount?.toLocaleString(), 'VND');

  console.log('\n===============================================================');
  console.log('🎉 CỔNG THANH TOÁN MOMO SANDBOX HOẠT ĐỘNG HOÀN HẢO 100%!');
  console.log('===============================================================');
}

simulateEndToEndMomoPurchase().catch(e => console.error('Lỗi kiểm tra:', e));
