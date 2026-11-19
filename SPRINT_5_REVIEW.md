# SPRINT 5 REVIEW: QUẢN TRỊ NHÂN SỰ, HOA HỒNG & KPI (HRM)

## 1. Mục Tiêu Sprint 5
Kiểm tra, chuẩn hóa và hoàn thiện toàn bộ phân hệ Quản trị nhân sự & Hiệu suất theo tài liệu `Nghiệp_vụ.txt` và bộ thiết kế Warm Editorial (Admin Web) & Kinetic Dark (Mobile App):
- Quản trị tài khoản nhân viên (Admin, Lễ tân, PT).
- Lịch phân ca trực & theo dõi giờ làm việc (`StaffShift`).
- Cấu hình chính sách hoa hồng (`CommissionRate`: % cho Doanh số bán hàng / Cố định cho Buổi dạy PT).
- Ghi nhận và đối soát hoa hồng thực tế (`CommissionLog`).
- Chỉ tiêu KPI hàng tháng và tỷ lệ hoàn thành (`StaffKPI`).
- Bảng tính lương tự động (Lương cơ bản + Hoa hồng + Đánh giá xếp loại).
- Đồng bộ Real-time Dashboard PT trên Mobile App (loại bỏ hoàn toàn logic mock 150k).

---

## 2. Đối Chiếu Nghiệp Vụ (`Nghiệp_vụ.txt` vs Hiện Trạng)

| Nghiệp Vụ Chuẩn (`Nghiệp_vụ.txt`) | Hiện Trạng Codebase | Đánh Giá & Giải Pháp Refactor |
| :--- | :--- | :--- |
| **1. Cấu hình tỷ lệ hoa hồng (`CommissionRate`)**<br>- Hoa hồng bán gói tập/hàng hóa (% doanh số)<br>- Hoa hồng dạy PT kèm (số tiền cố định/buổi) | Đã có model `CommissionRate` trong Prisma nhưng seed dữ liệu đang trống; API upsert chưa xử lý triệt để unique constraint. | **Cần chuẩn hóa:** Bổ sung seed mặc định (PT session 50.000đ; Sales 10%). Cung cấp đầy đủ API CRUD cho Admin. |
| **2. Tự động tích lũy doanh số KPI (`StaffKPI`)**<br>- Doanh số tự động nhảy khi Lễ tân chốt đơn POS | Đã tích hợp `tx.staffKPI.updateMany` trong `pos.route.ts` (Sprint 3). Tuy nhiên route `/hrm/kpi` đang dùng `id: -1` trong upsert gây lỗi. | **Cần sửa:** Sửa logic upsert trong `hrm.route.ts` bằng kiểm tra `findFirst({ where: { userId, month, year } })` hoặc composite unique. Trả về tỷ lệ % hoàn thành và xếp loại (Xuất sắc/Tốt/Trung bình/Kém). |
| **3. Nhật ký hoa hồng (`CommissionLog`)**<br>- Ghi nhận hoa hồng khi dạy xong buổi tập hoặc bán gói | Đã có ghi nhận tự động ở `pos.route.ts` và `booking.route.ts`. Tuy nhiên chưa có API tính tổng bảng lương tháng (`/hrm/payroll`). | **Cần bổ sung:** Endpoint `GET /hrm/payroll` tổng hợp Lương cứng + Hoa hồng + Doanh số KPI cho từng nhân viên theo tháng/năm. |
| **4. Lịch trực ca (`StaffShift`)**<br>- Xếp ca cho PT và Lễ tân | Đã có GET/POST cơ bản trong `hrm.route.ts`, nhưng thiếu API xóa (`DELETE`) và cập nhật (`PATCH`), chưa có dữ liệu mẫu. | **Cần bổ sung:** Hoàn thiện CRUD ca trực, seed lịch trực mẫu theo tuần. |
| **5. Thu nhập PT trên Mobile App (`trainer.route.ts`)**<br>- PT theo dõi thu nhập thực tế realtime | `trainer.route.ts:47` đang fix cứng `completedBookings * 150000` (sai nghiệp vụ). | **Khắc phục triệt để:** Tính tổng thực tế từ `CommissionLog` trong tháng qua `prisma.commissionLog.aggregate({ _sum: { amount: true } })`. |
| **6. Giao diện Admin Web** | Component `Staff/index.tsx` có các tab nhưng nội dung còn sơ sài, thiếu Modal xếp ca, bảng lương và form KPI. Import `@prisma/client` trong `types/hrm.ts`. | **Refactor:** Tách component chuyên biệt theo chuẩn Warm Editorial, chuyển `types/hrm.ts` thành Pure TypeScript interfaces 100%. |
| **7. Giao diện Mobile App PT** | `app/(trainer)/index.tsx`, `clients.tsx`, `schedule.tsx`, `availability.tsx` vẫn mang mã màu Dark Navy cũ (`#020617`, `#f59e0b`). | **Refactor:** Đồng bộ sang **High-Performance Kinetic Dark** (`#0E100F`, `#1A1D1B`, `#C8F135`, `#FF5A36`). |

---

## 3. Kết Luận
Cần triển khai theo đúng quy trình 5 bước để hoàn tất Sprint 5 và chốt toàn bộ dự án DATN Titan Gym.
