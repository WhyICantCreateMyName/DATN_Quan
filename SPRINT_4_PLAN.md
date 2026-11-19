# 🛠️ SPRINT 4: KẾ HOẠCH HÀNH ĐỘNG CHI TIẾT (VẬN HÀNH LỚP HỌC, ĐẶT LỊCH & GIÁO ÁN)

## 1. Mục Tiêu Sprint 4
- Hoàn thiện toàn bộ 4 quy tắc Đặt lịch & Vận hành lớp học theo đúng `Nghiệp_vụ.txt`.
- Bổ sung endpoint `GET /api/bookings` đầy đủ bộ lọc (ngày, trạng thái, PT, lớp) cho Admin Web.
- Ngăn chặn triệt để đặt trùng lịch huấn luyện viên và đặt quá sức chứa lớp học nhóm.
- Đảm bảo trừ ví buổi tập `remainingPtSessions` chính xác 1 lần duy nhất khi hoàn thành buổi tập.
- Đồng bộ giao diện Mobile App (`schedule.tsx`, `explore.tsx`, `workout.tsx`) theo phong cách Kinetic Dark và Admin Web theo phong cách Warm Editorial.

---

## 2. Chi Tiết Kỹ Thuật Từng Thành Phần

### Bước 3: Logic & Backend API
1. **Endpoint `GET /api/bookings` trong `API/src/routes/booking.route.ts`:**
   - Query: `page`, `limit`, `status`, `trainerId`, `memberId`, `groupClassId`, `date`.
   - Include: `member.user`, `trainer.user`, `groupClass`, `workoutLog.exercises`.
   - Trả về `{ data, total, page, limit }`.

2. **Quy tắc kiểm tra trong `POST /api/bookings`:**
   - **Đặt lịch PT (`trainerId`):**
     - Kiểm tra ví: `memberProfile.remainingPtSessions > 0`.
     - Kiểm tra giới hạn lịch chờ: `activeBookingsCount < memberProfile.remainingPtSessions`.
     - **Kiểm tra trùng lịch:** Tìm booking của PT trong khoảng thời gian `(startTime < newEndTime) && (endTime > newStartTime)` với status thuộc `['PENDING', 'CONFIRMED']`. Nếu có, trả về lỗi 400.
   - **Đặt lớp học nhóm (`groupClassId`):**
     - Kiểm tra lớp tồn tại.
     - Đếm số lượng booking chưa hủy của lớp: `bookedCount < groupClass.capacity`. Nếu bằng hoặc vượt quá, từ chối.
     - Kiểm tra hội viên đã đăng ký lớp này chưa: Nếu đã có booking trạng thái khác `CANCELLED`, từ chối báo đã đăng ký.

3. **Cập nhật trạng thái hoàn thành (`PATCH /:id` & `POST /:id/complete-with-qr`):**
   - Đảm bảo chỉ trừ buổi khi trạng thái cũ KHÁC `COMPLETED` và trạng thái mới là `COMPLETED`.
   - Sử dụng `prisma.$transaction`: Trừ `memberProfile.remainingPtSessions`, cập nhật booking status, ghi nhận hoa hồng PT.

4. **Tạo giáo án bài tập (`API/src/routes/workout.route.ts`):**
   - Khi truyền `bookingId`:
     - Kiểm tra `bookingId` có tồn tại và thuộc về đúng `memberId` và `ptId`.
     - Gán `date = booking.startTime`.
     - Tự động chuyển booking sang `CONFIRMED` hoặc `COMPLETED` nếu PT viết giáo án thực tế.

5. **Kịch bản Kiểm thử Tự Động (`API/verify_sprint4.ts`):**
   - Test 1: Đặt lịch PT khi ví = 0 -> Bị chặn và báo lỗi rõ ràng.
   - Test 2: Đặt lịch PT trùng khung giờ -> Bị chặn báo trùng lịch.
   - Test 3: Đặt lớp GroupClass khi lớp đã đủ sĩ số -> Bị chặn báo hết chỗ.
   - Test 4: Hoàn thành buổi tập -> Ví buổi tập của hội viên giảm đúng 1.
   - Test 5: Tạo giáo án gắn với `bookingId` -> Truy vấn giáo án kèm danh sách bài tập.

---

### Bước 4: Tái Cấu Trúc Giao Diện
1. **Mobile App:**
   - `mobile-app/app/(member)/schedule.tsx`: Tái thiết kế sang **High-Performance Kinetic Dark** (`#0E100F`, `#1A1D1B`, `#C8F135`, `#F4F5F0`, `#8E9490`). Hiển thị thẻ lịch hẹn, mã QR check-in hoàn thành buổi tập.
   - `mobile-app/app/(member)/explore.tsx`: Tái thiết kế giao diện đặt lịch PT & Lớp học với bảng chọn giờ và chọn PT thể thao sắc nét.
   - `mobile-app/app/(member)/workout.tsx`: Tái thiết kế màn hình Giáo án tập luyện với danh sách bài tập, số hiệp (sets), số lần (reps), tạ (kg) và ghi chú kỹ thuật từ PT.
2. **Admin Web:**
   - `admin-web/src/app/(public)/schedule/page.tsx`: Cập nhật sang phong cách hiện đại Warm Editorial.
   - Thêm tab Lớp học nhóm trong `/catalog` và kiểm tra `admin-web/src/services/bookingService.ts`.
