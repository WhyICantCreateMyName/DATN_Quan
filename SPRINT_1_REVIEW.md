# 🔍 SPRINT 1 REVIEW: TẦNG MÓNG ĐỊNH DANH & TÀI KHOẢN
> **Đối tượng:** `User`, `MemberProfile`, `TrainerProfile`  
> **Tài liệu căn cứ:** [Nghiệp_vụ.txt](file:///e:/DATN_Quan/Nghiệp_vụ.txt) (Mục QUẢN LÝ - RBAC & LỄ TÂN - Onboarding)  
> **Mã nguồn rà soát:** 
> - Backend: `API/prisma/schema.prisma`, `API/src/routes/user.route.ts`, `API/src/routes/trainer.route.ts`, `API/src/routes/auth.route.ts`  
> - Frontend Web: `admin-web/src/types/user.ts`, `admin-web/src/components/Staff/index.tsx`, `admin-web/src/services/userService.ts`  
> - Mobile App: `mobile-app/app/(trainer)/profile.tsx`, `mobile-app/app/(member)/index.tsx`

---

## 1. ĐỐI CHIẾU NGHIỆP VỤ (BUSINESS LOGIC AUDIT)

### 🚨 Vấn đề 1: Lỗi thiết kế Avatar dẫn đến sinh rác `MemberProfile` cho Quản lý & Lễ tân
- **Nghiệp vụ chuẩn:**
  - Hệ thống gồm 4 vai trò rõ rệt: `ADMIN`, `RECEPTIONIST`, `PT`, `MEMBER`.
  - Mọi người dùng (bất kể vai trò nào) đều có ảnh đại diện (Avatar) để hiển thị trên danh bạ, nhật ký hệ thống (Audit Log), và hồ sơ cá nhân.
  - Chỉ duy nhất người có vai trò `MEMBER` mới sở hữu hồ sơ hội viên (`MemberProfile`) để lưu mã vân tay, liên kết các gói đăng ký (`subscriptions`), và đặt chỗ (`bookings`).
- **Mã nguồn thực tế (Codebase):**
  - Trong [API/prisma/schema.prisma](file:///e:/DATN_Quan/API/prisma/schema.prisma#L13-L49), bảng `User` **không hề có** trường `avatarUrl`. Thay vào đó, trường `avatarUrl` bị đặt riêng lẻ ở cả 2 bảng con: `MemberProfile.avatarUrl` và `TrainerProfile.avatarUrl`.
  - Hậu quả nghiêm trọng tại [API/src/routes/user.route.ts#L68](file:///e:/DATN_Quan/API/src/routes/user.route.ts#L68):
    ```typescript
    memberProfile: (role === 'MEMBER' || role === 'RECEPTIONIST' || role === 'ADMIN' || !role) ? { create: {} } : undefined,
    ```
    Để Admin và Lễ tân có chỗ lưu avatar hoặc do AI trước sinh mã tùy tiện, hệ thống đã tự động tạo một bản ghi `MemberProfile` rỗng cho tất cả Admin và Lễ tân!
  - Tại [API/src/routes/user.route.ts#L109-L123](file:///e:/DATN_Quan/API/src/routes/user.route.ts#L109-L123), endpoint cập nhật avatar `/users/:id/profile` lại tiếp tục `upsert` vào `memberProfile` nếu role không phải là `PT`:
    ```typescript
    profile = await prisma.memberProfile.upsert({
      where: { userId },
      update: { avatarUrl, fingerprintId },
      create: { userId, avatarUrl, fingerprintId }
    });
    ```
- **Hệ lụy vận hành:**
  - CSDL bị ô nhiễm dữ liệu nghiêm trọng: Lễ tân và Quản lý đều xuất hiện trong danh sách hội viên tiềm năng với `remainingPtSessions: 0`.
  - Hàm đếm tổng số hội viên bị sai lệch dữ liệu tài chính và báo cáo thống kê.

---

### 🚨 Vấn đề 2: Dữ liệu rác và trùng lặp ở `TrainerProfile` (`height, weight, bodyFat`)
- **Nghiệp vụ chuẩn:**
  - Theo tài liệu nghiệp vụ mục PT (B & D), chỉ số hình thể sinh trắc học (Inbody: Cân nặng, Chiều cao, Tỷ lệ mỡ, Cơ) là dữ liệu lịch sử y tế biến thiên theo thời gian. Mọi lần đo đều phải được lưu trữ trong bảng `BodyMetric` kèm ngày giờ đo (`recordedAt`) để vẽ biểu đồ tiến trình (Progress Tracking).
  - Bản thân PT nếu muốn theo dõi chỉ số của chính mình thì hệ thống đã hỗ trợ bảng `BodyMetric` với `memberId = null, trainerId = ptProfile.id`.
- **Mã nguồn thực tế (Codebase):**
  - Tại [API/prisma/schema.prisma#L59-L61](file:///e:/DATN_Quan/API/prisma/schema.prisma#L59-L61), bảng `TrainerProfile` lại gán cố định 3 cột:
    ```prisma
    height   Float?
    weight   Float?
    bodyFat  Float?
    ```
  - Tại [API/src/routes/trainer.route.ts#L176-L196](file:///e:/DATN_Quan/API/src/routes/trainer.route.ts#L176-L196) và [mobile-app/app/(trainer)/profile.tsx#L92-L100](file:///e:/DATN_Quan/mobile-app/app/(trainer)/profile.tsx#L92-L100), màn hình cập nhật hồ sơ PT lại ép người dùng nhập 3 chỉ số này vào bảng `TrainerProfile` thay vì ghi vào `BodyMetric`.
- **Hệ lụy vận hành:**
  - 3 cột này hoàn toàn tĩnh, không có lịch sử đo, gây mâu thuẫn dữ liệu với bảng `BodyMetric`.

---

### 🚨 Vấn đề 3: Quy trình Onboarding / Cấp mới nhân viên bị phân mảnh 2 Request
- **Mã nguồn thực tế:**
  - Tại [admin-web/src/components/Staff/index.tsx#L34-L42](file:///e:/DATN_Quan/admin-web/src/components/Staff/index.tsx#L34-L42):
    ```typescript
    const newUser = await userService.createUser({ fullName: form.fullName, phone: form.phone, role: form.role, password: '123' });
    if (form.avatarUrl && newUser.id) {
      await userService.updateProfile(newUser.id, { avatarUrl: form.avatarUrl });
    }
    ```
  - Giao diện phải gọi 2 request mạng nối tiếp nhau: Request 1 tạo User, Request 2 cập nhật Avatar. Nếu request 2 lỗi mạng, nhân viên vừa tạo sẽ không có avatar và rơi vào trạng thái dở dang.
- **Chuẩn hóa:**
  - Payload `POST /api/users` và `PATCH /api/users/:id` phải hỗ trợ trực tiếp `avatarUrl` trong 1 request duy nhất.

---

### 🚨 Vấn đề 4: Phiên đăng nhập & Lấy thông tin tài khoản thiếu nhất quán
- **Mã nguồn thực tế:**
  - Tại [admin-web/src/components/Staff/index.tsx#L60](file:///e:/DATN_Quan/admin-web/src/components/Staff/index.tsx#L60):
    ```typescript
    avatarUrl: member.memberProfile?.avatarUrl || member.trainerProfile?.avatarUrl || ''
    ```
  - Client luôn phải viết code chắp vá kiểm tra xem user thuộc role nào để bới tìm `avatarUrl` trong profile con tương ứng.
- **Chuẩn hóa:**
  - Trả thẳng `user.avatarUrl` từ bảng `User`.

---

## 2. ĐỐI CHIẾU KIẾN TRÚC & DESIGN PATTERN (SO VỚI REPO MẪU E:/DATN)

### ⚠️ Thiếu sót tầng Frontend Types (`src/types/user.ts`)
- **Hiện trạng:** [admin-web/src/types/user.ts](file:///e:/DATN_Quan/admin-web/src/types/user.ts) import trực tiếp `@prisma/client`. Điều này làm phình bundle client-side và vi phạm nguyên tắc độc lập giữa frontend DTO và database schema.
- **Chuẩn hóa theo pattern `e:/datn`:** Tách file `src/types/user.ts` độc lập với 4 interface bắt buộc:
  1. `User` (Entity đầy đủ)
  2. `CreateUserDto`
  3. `UpdateUserDto`
  4. `UserQueryParams` (`page`, `limit`, `role`, `keyword`, `isActive`)

### ⚠️ Thiếu sót tầng Quản lý Trạng thái & Hook (`useUser.ts`)
- **Hiện trạng:** [admin-web/src/components/Staff/index.tsx](file:///e:/DATN_Quan/admin-web/src/components/Staff/index.tsx) dùng hook tổng hợp `useHRM` nhưng lại nhồi nhét xử lý submit form, modal, loading trực tiếp trong component.
- **Chuẩn hóa:** Tách thành Custom Hook `useUser` sử dụng `SWR` với cấu hình deduplication 10s (`dedupingInterval: 10000`), tự động revalidate qua `mutate()` và đẩy thông báo qua `ToastContext`.

### ⚠️ Thiếu sót tầng Layout Doanh Nghiệp
- **Hiện trạng:** `admin-web` dùng `Sidebar.tsx` và `AppLayout.tsx` đơn sơ, chưa có cấu trúc Collapsible Sidebar (90px/290px), thiếu `AppHeader`, `Backdrop` và `SidebarContext`.

---

## 3. ĐỐI CHIẾU HỆ THỐNG THỊ GIÁC (ANTHROPIC FRONTEND DESIGN)

### ❌ Giao diện Admin Web cũ (`/staff`)
- Mang đậm các trope AI lỗi thời: Nền xám đen u tối `bg-gray-900`, chữ xanh neon gắt `text-[#39FF14]`, hiệu ứng đổ bóng phát sáng mờ ảo `shadow-[0_0_20px_rgba(57,255,20,0.2)]`, bo góc quá tròn `rounded-[2.5rem]`.
- **Cải tổ theo bảng màu Admin Dashboard (Warm Editorial / Clean Slate):**
  - **Nền chính:** Warm Alabaster (`#F7F7F5`).
  - **Nền thẻ & Sidebar:** Pure White (`#FFFFFF`), đường viền sắc sảo `#E4E4E0`.
  - **Chữ chính:** Deep Charcoal (`#18181B`).
  - **Chữ phụ:** Slate Gray (`#6E6E77`).
  - **Màu nhấn:** Electric Tangerine (`#EA580C`) cho các nút tương tác chính, Forest Pine (`#15803D`) cho trạng thái hoạt động.
  - **Font chữ:** `Plus Jakarta Sans` cho tiêu đề, `JetBrains Mono` cho số điện thoại/ngày tạo/ID.

### ❌ Giao diện Mobile App cũ (`(trainer)/profile.tsx`)
- Dùng bộ màu tuỳ hứng không ăn nhập (`#020617`, `#0f172a`, `#f59e0b`).
- **Cải tổ theo bảng màu Mobile App (High-Performance Kinetic Dark):**
  - **Nền chính:** Obsidian Black (`#0E100F`).
  - **Thẻ bề mặt:** Carbon Gray (`#1A1D1B`).
  - **Chữ chính:** Crisp Off-White (`#F4F5F0`).
  - **Chữ phụ:** Ash Gray (`#8E9490`).
  - **Màu nhấn:** Kinetic Volt (`#C8F135`) cho nút hành động chính, Signal Coral (`#FF5A36`) cho cảnh báo/đăng xuất.
  - **Font chữ:** `Barlow Condensed` cho số liệu & tiêu đề, `DM Sans` cho nội dung.

---

## 4. BẢNG TỔNG HỢP CÁC ĐIỂM VI PHẠM CẦN KHẮC PHỤC TRONG SPRINT 1

| STT | Vị trí file | Vi phạm logic / thiết kế | Giải pháp chuẩn hoá |
| :---: | :--- | :--- | :--- |
| **1** | `API/prisma/schema.prisma` | Bảng `User` thiếu `avatarUrl`; `MemberProfile` & `TrainerProfile` có `avatarUrl` riêng; `TrainerProfile` chứa 3 trường rác `height, weight, bodyFat`. | Thêm `User.avatarUrl String?`; Xoá `avatarUrl` ở 2 profile con; Xoá 3 trường rác ở `TrainerProfile`. |
| **2** | `API/src/routes/user.route.ts:68` | Tự động tạo dummy `MemberProfile` cho Admin và Lễ tân. | Chỉ tạo `memberProfile` khi `role === 'MEMBER'`. Chỉ tạo `trainerProfile` khi `role === 'PT'`. |
| **3** | `API/src/routes/user.route.ts:100-129` | Endpoint `/profile` ép `upsert` vào profile con để lưu avatar. | Đơn giản hóa: cập nhật thẳng `User.avatarUrl`. Giữ `fingerprintId` cho `MemberProfile`. |
| **4** | `API/src/routes/trainer.route.ts:176-196` | Cập nhật hồ sơ PT nhận 3 trường rác `height, weight, bodyFat` và không cập nhật `avatarUrl` trên User. | Bỏ 3 trường rác, cập nhật `fullName` và `avatarUrl` trên `User`, cập nhật `specialization` và `bio` trên `TrainerProfile`. |
| **5** | `API/prisma/seed.ts` | Dữ liệu mẫu gán avatar vào profile con và có thể sinh rác member profile. | Cập nhật seed đưa `avatarUrl` lên thẳng bản ghi `User`. |
| **6** | `admin-web/src/types/user.ts` | Import `@prisma/client`, thiếu interface chuẩn. | Viết lại theo chuẩn: `User`, `CreateUserDto`, `UpdateUserDto`, `UserQueryParams`. |
| **7** | `admin-web/src/services/userService.ts` & `src/hooks/useUser.ts` | Gọi API rời rạc 2 lần khi tạo user; thiếu hook SWR chuẩn. | Hỗ trợ `avatarUrl` ngay trong `createUser`; viết hook `useUser` tích hợp SWR cache + ToastContext. |
| **8** | `admin-web/src/components/Staff/` | Giao diện monolith 371 dòng, phong cách tím/xanh neon AI rập khuôn. | Tái cấu trúc thành các component con (`Table`, `TableHeader`, `TableRow`, `ModalCreate`, `ModalEdit`) theo bảng màu Warm Alabaster + Electric Tangerine. |
| **9** | `mobile-app/app/(trainer)/profile.tsx` | Nhập liệu `height, weight, bodyFat` trực tiếp trong hồ sơ; màu sắc tuỳ tiện. | Bỏ 3 ô nhập rác; áp dụng bộ màu Kinetic Volt + Obsidian Black. |
