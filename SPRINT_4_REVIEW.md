# 📋 SPRINT 4: ĐỐI CHIẾU & AUDIT NGHIỆP VỤ (VẬN HÀNH LỚP HỌC, ĐẶT LỊCH & GIÁO ÁN)

## 1. Mục Tiêu Sprint 4
Vận hành toàn diện phân hệ Lớp học nhóm (`GroupClass`), Đặt lịch (`Booking`), Điểm danh hoàn thành và Giáo án điện tử (`WorkoutLog`, `WorkoutExercise`) tuân thủ nghiêm ngặt **4 Booking Rules** trong `Nghiệp_vụ.txt`.

---

## 2. Đối Chiếu Code Hiện Tại Với 4 Quy Tắc Nghiệp Vụ (`Nghiệp_vụ.txt`)

### A. Quy Tắc 1: Kiểm Tra Ví Số Buổi PT Khi Đặt Lịch
- **Yêu cầu nghiệp vụ:** Khi Hội viên đặt lịch với Huấn luyện viên cá nhân (PT), hệ thống bắt buộc kiểm tra `remainingPtSessions` trong `MemberProfile`. Nếu bằng 0 hoặc số lịch chờ (`PENDING`/`CONFIRMED`) đã đạt giới hạn ví, phải từ chối đặt lịch và gợi ý mua thêm gói.
- **Thực trạng code (`booking.route.ts`):** Đã kiểm tra sơ bộ nhưng chưa kiểm tra trường hợp hội viên hủy lịch (khi hủy lịch, số slot chờ phải được giải phóng).
- **Đánh giá:** Cần chuẩn hóa thông báo lỗi thân thiện và tối ưu truy vấn.

### B. Quy Tắc 2: Kiểm Tra Trùng Lịch PT & Sức Chứa Lớp Học Nhóm (GroupX)
- **Yêu cầu nghiệp vụ:**
  - Với lịch PT: Không được cho phép đặt trùng khung giờ với lịch PT khác đã được xác nhận của huấn luyện viên (`trainer overlap`).
  - Với Lớp học nhóm: Hệ thống bắt buộc kiểm tra sức chứa tối đa (`GroupClass.capacity`). Nếu số người đăng ký đã đạt sức chứa, không cho phép nhận thêm hội viên; đồng thời mỗi hội viên chỉ được đăng ký 1 chỗ trong cùng 1 lớp.
- **Thực trạng code (`booking.route.ts`):**
  - **HOÀN TOÀN THIẾU kiểm tra trùng giờ của PT!** Hai khách hàng có thể đặt cùng 1 PT vào cùng 1 giờ.
  - **HOÀN TOÀN THIẾU kiểm tra sức chứa của GroupClass!** Khách có thể đặt vô hạn người vào lớp 20 chỗ.
- **Đánh giá:** **LỖI NGHIÊM TRỌNG TRONG VẬN HÀNH.** Cần bổ sung kiểm tra overlap thời gian và kiểm tra capacity.

### C. Quy Tắc 3: Đối Chiếu Giáo Án Thực Tế Với Buổi Tập
- **Yêu cầu nghiệp vụ:** Một giáo án bài tập (`WorkoutLog`) phải gắn trực tiếp với 1 `Booking ID` (quan hệ 1-1) để lưu vết buổi tập diễn ra vào ngày giờ nào, tập với PT nào.
- **Thực trạng code (`workout.route.ts`):**
  - Đã có trường `bookingId Int? @unique`, nhưng chưa bắt buộc và chưa validate tính hợp lệ của `bookingId` (booking có đúng của member và PT đó không).
- **Đánh giá:** Cần validate chặt chẽ quyền sở hữu của `bookingId` khi PT tạo giáo án.

### D. Quy Tắc 4: Tự Động Trừ Buổi & Tính Hoa Hồng Khi Hoàn Thành
- **Yêu cầu nghiệp vụ:** Khi buổi tập hoàn thành (qua Quét mã QR check-out hoặc PT bấm xác nhận hoàn thành), hệ thống tự động trừ 1 buổi trong ví `MemberProfile.remainingPtSessions` và ghi nhận hoa hồng buổi dạy (`CommissionLog`) cho PT.
- **Thực trạng code (`booking.route.ts`):**
  - Đã có hàm `POST /:id/complete-with-qr` và `PATCH /:id`, nhưng cần đồng bộ hóa cấu trúc Transaction ACID và đảm bảo không trừ buổi lặp lại nếu đã `COMPLETED`.

### E. Thiếu API Liệt Kê Toàn Bộ Lịch Hẹn Cho Admin Web
- `booking.route.ts` thiếu endpoint `GET /api/bookings` hỗ trợ phân trang, lọc theo trạng thái, PT, ngày tháng cho Web Quản trị.

---

## 3. Kế Hoạch Khắc Phục Sprint 4
1. **Schema:** Đảm bảo `Booking` và `WorkoutLog` liên kết 1-1 trơn tru.
2. **Backend API:**
   - Thêm `GET /api/bookings` cho Admin Web.
   - Thêm kiểm tra trùng lịch PT (Overlap check).
   - Thêm kiểm tra sức chứa GroupClass (`capacity`) và chống đăng ký trùng lớp.
   - Chuẩn hóa Transaction trừ ví buổi tập khi hoàn thành.
   - Validate liên kết `bookingId` trong `workout.route.ts`.
3. **Frontend UI:**
   - Mobile App: Tái thiết kế màn hình `schedule.tsx`, `explore.tsx`, `workout.tsx` sang giao diện **High-Performance Kinetic Dark**.
   - Admin Web: Nâng cấp màn hình Lịch tập `/schedule` và Quản lý Lớp học trong `/catalog` sang **Warm Editorial**.
