# 📋 SPRINT 1 PLAN: KẾ HOẠCH CHI TIẾT TẦNG MÓNG ĐỊNH DANH & TÀI KHOẢN

> **Sprint:** 1 / 5  
> **Trọng tâm:** `User`, `MemberProfile`, `TrainerProfile`  
> **Căn cứ từ review:** [SPRINT_1_REVIEW.md](file:///E:/DATN_Quan/SPRINT_1_REVIEW.md)  
> **Mục tiêu tối thượng:** 
> 1. Chuẩn hóa nguồn chân lý Avatar về thẳng `User`, dẹp bỏ triệt để rác `MemberProfile` cho Quản lý & Lễ tân.
> 2. Loại bỏ 3 trường rác tĩnh `height, weight, bodyFat` ở `TrainerProfile`.
> 3. Thiết lập nền móng Kiến trúc Frontend chuẩn (Types, SWR Hook, Enterprise Layout) và hệ màu **Warm Editorial** (Web) + **Kinetic Dark** (Mobile).

---

## 🏗️ PHẦN 1: SCHEMA PRISMA & DATABASE MIGRATION

### Task 1.1: Chỉnh sửa `API/prisma/schema.prisma`
- **File:** `API/prisma/schema.prisma`
- **Thay đổi cụ thể:**
  1. `model User`:
     - Thêm trường: `avatarUrl String?`
  2. `model MemberProfile`:
     - Xóa trường: `avatarUrl String?` (vì đã có trên User)
  3. `model TrainerProfile`:
     - Xóa trường: `avatarUrl String?` (vì đã có trên User)
     - Xóa 3 trường: `height Float?`, `weight Float?`, `bodyFat Float?` (chỉ số sức khỏe đã có bảng `BodyMetric`)
- **Lệnh thực thi:**
  ```bash
  cd API
  npx prisma migrate dev --name sprint1_user_identity
  npx prisma generate
  ```

---

## ⚙️ PHẦN 2: TÁI CẤU TRÚC BACKEND API (EXPRESS)

### Task 2.1: Sửa route người dùng `API/src/routes/user.route.ts`
- **File:** `API/src/routes/user.route.ts`
- **Thay đổi logic:**
  1. `POST /`:
     - Nhận thêm `avatarUrl` từ `req.body`.
     - Lưu trực tiếp `avatarUrl` vào `prisma.user.create({ data: { ..., avatarUrl } })`.
     - **Sửa điều kiện tạo profile con:**
       + `memberProfile: role === 'MEMBER' ? { create: {} } : undefined`
       + `trainerProfile: role === 'PT' ? { create: { specialization: specialization || 'General' } } : undefined`
       + *(Tuyệt đối không tạo `memberProfile` rác cho `ADMIN` hay `RECEPTIONIST`)*.
  2. `PATCH /:id`:
     - Nhận thêm `avatarUrl` để cho phép cập nhật thông tin chung kèm ảnh đại diện trong 1 request.
  3. `PATCH /:id/profile`:
     - Đơn giản hóa: Cập nhật `avatarUrl` trực tiếp lên bảng `User`. Nếu user có `role === 'MEMBER'` và có gửi `fingerprintId`, mới cập nhật `fingerprintId` trên `MemberProfile`.
  4. `GET /`:
     - Giữ nguyên quan hệ `include: { memberProfile: true, trainerProfile: true }` để các module khác không bị gãy.

### Task 2.2: Sửa route huấn luyện viên `API/src/routes/trainer.route.ts`
- **File:** `API/src/routes/trainer.route.ts`
- **Thay đổi logic:**
  1. `PUT /profile`:
     - Bỏ nhận `height, weight, bodyFat`.
     - Cập nhật `fullName` và `avatarUrl` trên bảng `User`:
       ```typescript
       await prisma.user.update({
         where: { id: ptId },
         data: { fullName, avatarUrl }
       });
       ```
     - Cập nhật `specialization, bio` trên bảng `TrainerProfile`:
       ```typescript
       await prisma.trainerProfile.update({
         where: { userId: ptId },
         data: { specialization, bio }
       });
       ```

### Task 2.3: Chuẩn hóa dữ liệu mẫu `API/prisma/seed.ts`
- **File:** `API/prisma/seed.ts`
- **Thay đổi:**
  - Chuyển `avatarUrl` của các user mẫu (`admin`, `receptionist`, `pt1`, `pt2`, `member1`...) vào thẳng model `User`.
  - Loại bỏ việc gán `height, weight, bodyFat` trong `trainerProfile`.
  - Thực thi: `npx prisma db seed` để làm mới CSDL kiểm thử sạch.

---

## 💻 PHẦN 3: TÁI CẤU TRÚC ADMIN WEB (PATTERN TÁC GIẢ + WARM EDITORIAL)

### Task 3.1: Định nghĩa Types chuẩn (`src/types/user.ts`)
- **File:** `admin-web/src/types/user.ts` (thay thế file cũ import `@prisma/client`)
- **Định nghĩa đầy đủ 4 interfaces:**
  1. `Role`: `'ADMIN' | 'RECEPTIONIST' | 'PT' | 'MEMBER'`
  2. `User`: Entity hiển thị đầy đủ (`id`, `fullName`, `phone`, `role`, `avatarUrl`, `isActive`, `createdAt`, `updatedAt`, `memberProfile?`, `trainerProfile?`)
  3. `CreateUserDto`: `{ fullName: string; phone: string; password?: string; role: Role; avatarUrl?: string; specialization?: string }`
  4. `UpdateUserDto`: `Partial<CreateUserDto> & { isActive?: boolean }`
  5. `UserQueryParams`: `{ page?: number; limit?: number; role?: string; keyword?: string; isActive?: boolean }`
- **Re-export:** trong `admin-web/src/types/index.ts`.

### Task 3.2: Tầng Service (`src/services/userService.ts`)
- **File:** `admin-web/src/services/userService.ts`
- **Cập nhật phương thức:**
  - `getUsers(params?: UserQueryParams)`
  - `getUserById(id: number)`
  - `createUser(data: CreateUserDto)` (gửi kèm `avatarUrl` luôn trong 1 request)
  - `updateUser(id: number, data: UpdateUserDto)`
  - `deleteUser(id: number)`

### Task 3.3: Tầng Hook SWR (`src/hooks/useUser.ts`)
- **File mới:** `admin-web/src/hooks/useUser.ts`
- **Đặc tính:**
  - Sử dụng `useSWR` với key `/users` + query parameters.
  - Cấu hình cache `dedupingInterval: 10000` (10 giây).
  - Tích hợp sẵn các mutation functions (`createUser`, `updateUser`, `deleteUser`).
  - Tự động gọi `showToast` khi thành công/thất bại và gọi `mutate()` để cập nhật bảng tức thì.

### Task 3.4: Tầng Layout Doanh Nghiệp Mẫu (`src/layout/`)
- Xây dựng bộ khung layout theo đúng chuẩn `e:/datn`:
  - `src/layout/SidebarContext.tsx`: Context điều khiển đóng/mở sidebar (collapse 90px / expand 290px / mobile drawer).
  - `src/layout/AppSidebar.tsx`: Sidebar màu trắng ngà `bg-[#FFFFFF]`, viền `#E4E4E0`, logo Titan Gym, hover mượt mà.
  - `src/layout/AppHeader.tsx`: Thanh header Warm Alabaster, avatar người dùng, tên vai trò, nút collapse sidebar.
  - `src/layout/Backdrop.tsx`: Lớp mờ khi mở drawer trên tablet/mobile.
  - `src/layout/CoreLayout.tsx`: Khung bọc `max-w-[1920px]` áp dụng cho toàn bộ các trang nội bộ.

### Task 3.5: Tái cấu trúc Giao diện Quản lý Nhân sự (`src/components/Staff/`)
- **Bỏ monolith cũ**, chia thành các component con chuẩn:
  - `src/components/Staff/StaffTable.tsx`: Khối container thống nhất chỉ gọi hook `useUser` và render.
  - `src/components/Staff/StaffTableHeader.tsx`: Thanh tiêu đề, nút "Thêm nhân viên", ô tìm kiếm, filter vai trò.
  - `src/components/Staff/StaffTableRow.tsx`: Hàng bảng hiển thị Avatar tròn, Họ tên (`font-bold text-[#18181B]`), SĐT (`font-mono`), Badge vai trò, Badge trạng thái (`bg-emerald-50 text-[#15803D]`), Action buttons.
  - `src/components/Staff/ModalCreateStaff.tsx`: Modal thêm nhân sự có tích hợp ô tải ảnh avatar xem trước realtime.
  - `src/components/Staff/ModalEditStaff.tsx`: Modal cập nhật thông tin và trạng thái nhân sự.
- **Áp dụng bảng màu Warm Editorial:**
  - Nền trang: `#F7F7F5`
  - Thẻ card / Bảng: `#FFFFFF` với viền `#E4E4E0`
  - Font tiêu đề: `Plus Jakarta Sans`
  - Font số liệu / SĐT: `JetBrains Mono`
  - Màu nút chính: Electric Tangerine `#EA580C`

---

## 📱 PHẦN 4: TÁI CẤU TRÚC MOBILE APP (HIGH-PERFORMANCE KINETIC DARK)

### Task 4.1: Cập nhật Tokens màu sắc (`mobile-app/constants/Colors.ts`)
- **File:** `mobile-app/constants/Colors.ts`
- Cập nhật palette chuẩn:
  - `background`: `#0E100F` (Obsidian Black)
  - `surface`: `#1A1D1B` (Carbon Gray)
  - `textPrimary`: `#F4F5F0` (Crisp Off-White)
  - `textMuted`: `#8E9490` (Ash Gray)
  - `accentPrimary`: `#C8F135` (Kinetic Volt)
  - `accentSecondary`: `#FF5A36` (Signal Coral)

### Task 4.2: Tái cấu trúc Màn hình Hồ sơ PT (`mobile-app/app/(trainer)/profile.tsx`)
- **File:** `mobile-app/app/(trainer)/profile.tsx`
- **Thay đổi:**
  - Xóa bỏ hoàn toàn 3 trường nhập liệu `height, weight, bodyFat`.
  - Hiển thị thông tin sạch: Họ tên, Chuyên môn (`specialization`), Giới thiệu (`bio`), SĐT.
  - Đổi avatar: Chọn ảnh từ máy và lưu thẳng vào `user.avatarUrl`.
  - Áp dụng toàn bộ giao diện Obsidian Black (`#0E100F`), thẻ Carbon Gray (`#1A1D1B`), nút lưu/bật sửa Kinetic Volt (`#C8F135`), nút đăng xuất Signal Coral (`#FF5A36`).

### Task 4.3: Hiển thị Avatar & Profile Hội viên (`mobile-app/app/(member)/index.tsx`)
- **File:** `mobile-app/app/(member)/index.tsx`
- **Thay đổi:**
  - Thêm ảnh Avatar của Hội viên ngay trên thanh Header cạnh họ tên (đọc từ `me?.avatarUrl`).
  - Cập nhật theme thẻ E-card sang tông Kinetic Dark chuẩn.

---

## 🧪 PHẦN 5: KIỂM THỬ & NGHIỆM THU (ACCEPTANCE CRITERIA)

| Mục kiểm thử | Hành động kiểm tra | Kết quả mong đợi |
| :--- | :--- | :--- |
| **1. Database Cleanliness** | Tạo 1 tài khoản Lễ tân (`RECEPTIONIST`) mới qua API/Admin Web. | Bảng `User` có dữ liệu; Bảng `MemberProfile` **hoàn toàn không có bản ghi** nào của user này (`userId` = null). |
| **2. Avatar Single Source of Truth** | Upload/cập nhật avatar cho Admin, PT, Member. | Dữ liệu được ghi thẳng vào cột `User.avatarUrl`. Cả Admin Web và Mobile App lập tức hiển thị avatar đồng nhất. |
| **3. PT Clean Metrics** | Mở form sửa hồ sơ PT trên Mobile App. | Không còn hiển thị các ô nhập Chiều cao, Cân nặng, Mỡ thừa tĩnh. Lưu hồ sơ thành công mượt mà. |
| **4. Web UX & Layout** | Mở trang `/staff` trên Admin Web. | Sidebar collapse 90px/290px mượt mà; Bảng nhân sự phong cách Warm Editorial sáng dịu, rõ nét, không còn viền tím/xanh neon AI rập khuôn. |
| **5. Build Verification** | Chạy `npm run build` trên `admin-web`. | Biên dịch thành công 100%, không phát sinh bất kỳ lỗi TypeScript hay xung đột build. |
