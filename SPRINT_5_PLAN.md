# SPRINT 5 PLAN: QUẢN TRỊ NHÂN SỰ, HOA HỒNG & KPI (HRM)

## 1. Mục Tiêu Sprint 5
Hoàn thiện toàn bộ hệ thống Quản trị nhân sự, Lịch trực ca, Bảng tính hoa hồng & lương, Chỉ tiêu KPI cho Admin Web và Mobile App PT.

---

## 2. Kế Hoạch Chi Tiết Các Hạng Mục Thực Hiện

### Giai Đoạn 1: Backend & Database Refactor
1. **Model & Schema (`schema.prisma`):**
   - Đảm bảo `StaffKPI` hỗ trợ unique check `@@unique([userId, month, year])` hoặc xử lý an toàn trong transaction.
   - Thêm trường `baseSalary Float @default(8000000)` vào `User` nếu chưa có, hoặc thiết lập mức lương cứng mặc định theo vai trò (ADMIN: 15.000.000đ, RECEPTIONIST: 8.000.000đ, PT: 7.000.000đ).
2. **Cải tiến `API/src/routes/hrm.route.ts`:**
   - **Shifts:** Bổ sung `GET /shifts` (có lọc `userId`, `startDate`, `endDate`), `POST /shifts` (validate thời gian bắt đầu < kết thúc), `DELETE /shifts/:id`, `PATCH /shifts/:id`.
   - **Commission Rates:** `GET /commissions/rates`, `POST /commissions/rates` (xử lý upsert chuẩn), `DELETE /commissions/rates/:id`.
   - **Commission Logs:** `GET /commissions/logs` (hỗ trợ lọc `userId`, `month`, `year`, phân trang và trả về tổng hoa hồng).
   - **Staff KPIs:** `GET /kpi` (tính toán `achievementPercent` và xếp hạng hiệu suất: EXCELLENT, GOOD, AVERAGE, POOR), `POST /kpi` (upsert theo `userId, month, year`), `DELETE /kpi/:id`.
   - **Payroll Aggregation (`GET /hrm/payroll`):** Tổng hợp bảng lương hàng tháng:
     `totalSalary = baseSalary + totalCommission` kèm thống kê số ca trực và % KPI đạt được.
3. **Sửa `API/src/routes/trainer.route.ts`:**
   - Bỏ hardcode `completedBookings * 150000`.
   - Tính toán hoa hồng thực nhận từ `CommissionLog`:
     `prisma.commissionLog.aggregate({ _sum: { amount: true }, where: { userId: ptId, createdAt: { gte: firstDay } } })`.
   - Trả về đồng thời `commissionEarned`, `completedThisMonth`, `pendingClasses`, và thông tin KPI tháng hiện tại.
4. **Seed dữ liệu mẫu (`API/prisma/seed.ts`):**
   - Dọn sạch và tạo:
     - 2 tỷ lệ hoa hồng mặc định: Hoa hồng dạy PT (50.000đ/buổi), Hoa hồng bán gói tập (10% doanh số).
     - Lịch trực ca mẫu trong tuần cho các nhân viên.
     - Chỉ tiêu KPI tháng hiện tại cho các nhân viên (Target: 20.000.000đ).
     - Nhật ký hoa hồng mẫu.
5. **Backend Verification Script (`API/verify_sprint5.ts`):**
   - Kiểm tra CRUD ca trực.
   - Kiểm tra thiết lập tỷ lệ hoa hồng & tính hoa hồng từ completed booking và POS.
   - Kiểm tra tính KPI và phân loại xếp hạng.
   - Kiểm tra bảng tính lương `/hrm/payroll`.
   - Kiểm tra PT Dashboard trả về số liệu thực từ `CommissionLog`.

---

### Giai Đoạn 2: Frontend Refactor

1. **Admin Web:**
   - **Types (`admin-web/src/types/hrm.ts`):**
     - Loại bỏ hoàn toàn import `@prisma/client`. Chuyển sang 100% Pure TypeScript interfaces (`StaffShift`, `CommissionRate`, `StaffKPI`, `CommissionLog`, `PayrollRecord`, v.v.).
   - **Service & Hook:**
     - Cập nhật `admin-web/src/services/hrmService.ts` với đầy đủ endpoints (`getPayroll`, `deleteShift`, `deleteCommissionRate`, `deleteKPI`).
     - Tối ưu `admin-web/src/hooks/useHRM.ts`.
   - **Giao Diện Warm Editorial:**
     - `admin-web/src/components/Staff/`:
       - `index.tsx`: Điều hướng 4 tab trực quan với Warm Alabaster (`#F7F7F5`), Pure White (`#FFFFFF`), Electric Tangerine (`#EA580C`), Forest Pine (`#15803D`).
       - Tab 1: Đội ngũ nhân viên (`StaffTable.tsx` & modals).
       - Tab 2: Lịch phân ca & Chấm công (`ShiftManagement.tsx`, `ModalCreateShift.tsx`).
       - Tab 3: Bảng lương & Hoa hồng (`PayrollManagement.tsx`, `ModalCommissionRate.tsx`).
       - Tab 4: Đánh giá KPI (`KpiManagement.tsx`, `ModalSetKpi.tsx`).

2. **Mobile App (PT Screens):**
   - Cập nhật các màn hình của PT theo phong cách **High-Performance Kinetic Dark**:
     - `mobile-app/app/(trainer)/index.tsx`: Hiển thị thu nhập hoa hồng thực tế, số buổi hoàn thành, số buổi chờ dạy, thanh tiến độ KPI tháng.
     - `mobile-app/app/(trainer)/clients.tsx`: Danh sách học viên quản lý, thẻ chỉ số Inbody, màu Obsidian Black `#0E100F`, Carbon Gray `#1A1D1B`, Kinetic Volt `#C8F135`.
     - `mobile-app/app/(trainer)/schedule.tsx` & `availability.tsx`: Bảng màu Kinetic Dark đồng bộ.

---

### Giai Đoạn 3: Verification & Chốt Master Plan
1. Chạy `npm run build` trên `admin-web` đảm bảo không lỗi kiểu hoặc trang tĩnh.
2. Chạy `npx tsc --noEmit` trên `mobile-app` đảm bảo sạch lỗi TypeScript.
3. Cập nhật `KE_HOACH_TOI_UU_HE_THONG.md` và artifact `ke-hoach-toi-uu-he-thong.md`.
4. Git commit & push nhánh `feat/sprint-1-and-2`.
