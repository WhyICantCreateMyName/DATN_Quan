# 📋 SPRINT 2 PLAN: KẾ HOẠCH CHI TIẾT GÓI TẬP & QUYỀN LỢI HỘI VIÊN

> **Sprint:** 2 / 5  
> **Trọng tâm:** `MembershipPlan`, `MemberSubscription`, `MemberProfile` (Ví số buổi tập)  
> **Căn cứ từ review:** [SPRINT_2_REVIEW.md](file:///E:/DATN_Quan/SPRINT_2_REVIEW.md)  
> **Mục tiêu tối thượng:**
> 1. Đổi tên `MemberSubscription.remainingPtSessions` ➔ `grantedPtSessions` (phản ánh đúng bản chất số buổi cấp theo hợp đồng).
> 2. Khắc phục triệt để lỗi mua gói nhưng không tăng số buổi trong ví: Sử dụng `prisma.$transaction` để luôn cộng dồn (`increment`) số buổi vào ví `MemberProfile.remainingPtSessions`.
> 3. Sửa endpoint Mobile Dashboard đọc số buổi PT chuẩn từ ví hội viên.
> 4. Xây dựng tầng Type & Hook SWR `useMembership` cho Admin Web và thiết kế giao diện theo **Warm Editorial** (Web) + **High-Performance Kinetic Dark** (Mobile).

---

## 🏗️ PHẦN 1: SCHEMA PRISMA & DATABASE MIGRATION

### Task 1.1: Chỉnh sửa `API/prisma/schema.prisma`
- **File:** `API/prisma/schema.prisma`
- **Thay đổi cụ thể:**
  - Trong `model MemberSubscription`:
    ```prisma
    // Đổi tên từ remainingPtSessions thành grantedPtSessions
    grantedPtSessions   Int      @default(0) // Số buổi PT được cấp theo hợp đồng gói tập này
    ```
- **Thực thi đồng bộ CSDL:**
  ```bash
  cd API
  npx prisma db push
  npx prisma generate
  ```

---

## ⚙️ PHẦN 2: TÁI CẤU TRÚC BACKEND API (EXPRESS)

### Task 2.1: Sửa route gói tập `API/src/routes/membership.route.ts`
- **File:** `API/src/routes/membership.route.ts`
- **Cập nhật logic `POST /subscribe`:**
  1. Khi gia hạn cùng phân khúc (`tag` giống nhau):
     ```typescript
     await prisma.$transaction([
       prisma.memberSubscription.update({
         where: { id: existingSub.id },
         data: {
           endDate: newEndDate,
           grantedPtSessions: existingSub.grantedPtSessions + plan.ptSessions
         }
       }),
       prisma.memberProfile.update({
         where: { id: Number(memberId) },
         data: {
           remainingPtSessions: { increment: plan.ptSessions }
         }
       })
     ]);
     ```
  2. Khi mua gói mới khác phân khúc hoặc chưa có gói:
     ```typescript
     await prisma.$transaction([
       prisma.memberSubscription.create({
         data: {
           memberId: Number(memberId),
           planId: Number(planId),
           startDate: new Date(),
           endDate,
           grantedPtSessions: plan.ptSessions,
           status: 'ACTIVE'
         }
       }),
       prisma.memberProfile.update({
         where: { id: Number(memberId) },
         data: {
           remainingPtSessions: { increment: plan.ptSessions }
         }
       })
     ]);
     ```

### Task 2.2: Sửa route bảng tin hội viên `API/src/routes/member.route.ts`
- **File:** `API/src/routes/member.route.ts`
- **Cập nhật `GET /dashboard`:**
  - Truy vấn `memberProfile` để lấy số dư ví thực tế:
    ```typescript
    const profile = await prisma.memberProfile.findUnique({
      where: { id: memberId }
    });
    res.json({
      activeSubscription: activeSub,
      remainingPtSessions: profile?.remainingPtSessions || 0
    });
    ```

### Task 2.3: Cập nhật `API/prisma/seed.ts`
- Cập nhật các câu lệnh tạo `memberSubscription` dùng `grantedPtSessions`.
- Chạy `npx tsx prisma/seed.ts`.

---

## 💻 PHẦN 3: TÁI CẤU TRÚC ADMIN WEB (PATTERN TÁC GIẢ + WARM EDITORIAL)

### Task 3.1: Định nghĩa Types chuẩn (`src/types/membership.ts`)
- **File:** `admin-web/src/types/membership.ts`
- Các interface độc lập:
  - `MembershipPlan`: `{ id, name, description?, price, durationDays, ptSessions, tag?, isActive, createdAt, updatedAt }`
  - `MemberSubscription`: `{ id, memberId, planId, startDate, endDate, grantedPtSessions, status, plan?: MembershipPlan }`
  - `CreatePlanDto`: `{ name, description?, price, durationDays, ptSessions, tag? }`
  - `UpdatePlanDto`: `Partial<CreatePlanDto> & { isActive?: boolean }`
  - `PlanQueryParams`: `{ page?: number; limit?: number; tag?: string; keyword?: string; isActive?: boolean }`

### Task 3.2: Tầng Service (`src/services/membershipService.ts`)
- Cung cấp:
  - `getPlans(params?: PlanQueryParams)`
  - `getPlanById(id: number)`
  - `createPlan(data: CreatePlanDto)`
  - `updatePlan(id: number, data: UpdatePlanDto)`
  - `deletePlan(id: number)`
  - `subscribe(data: { memberId: number; planId: number })`

### Task 3.3: Tầng Hook SWR (`src/hooks/useMembership.ts`)
- Cung cấp:
  - `useMembershipPlans(params?: PlanQueryParams)`: SWR cache 10s (`dedupingInterval: 10000`).
  - `useMembership()`: Các hàm mutation (`createPlan`, `updatePlan`, `deletePlan`) kèm `Toast.show` và `mutate()`.

### Task 3.4: Tái cấu trúc Danh mục Gói tập (`src/components/Catalog/`)
- Tách riêng module Gói tập:
  - `PlanTable.tsx`: Container component
  - `PlanTableHeader.tsx`: Cột TIÊU ĐỀ GÓI, GIÁ NIÊM YẾT, THỜI HẠN, BUỔI PT KÈM THEO, PHÂN HẠNG (TAG), THAO TÁC.
  - `PlanTableRow.tsx`: Hàng bảng phong cách Warm Editorial.
  - `ModalCreatePlan.tsx`: Modal tạo gói tập mới.
  - `ModalEditPlan.tsx`: Modal cập nhật gói tập.

---

## 📱 PHẦN 4: TÁI CẤU TRÚC GIAO DIỆN HỘI VIÊN MOBILE APP

### Task 4.1: Tái cấu trúc Màn hình Gói tập (`mobile-app/app/(member)/membership.tsx`)
- Áp dụng chuẩn **High-Performance Kinetic Dark**:
  - Widget Ví Buổi Tập: Hiển thị nổi bật số buổi PT còn lại trong ví (`remainingPtSessions`).
  - Thẻ Hợp Đồng Hiện Tại: Hiển thị tên gói đang kích hoạt, ngày hết hạn và số ngày còn lại.
  - Danh sách gói tập đăng ký: Phân biệt rõ theo Tag (DIAMOND, GOLD, PT_ADDON), nút đăng ký màu Kinetic Volt (`#C8F135`).

### Task 4.2: Cập nhật Dashboard Hội viên (`mobile-app/app/(member)/index.tsx`)
- Bổ sung thông tin số buổi PT trong ví ngay trên Dashboard chính cạnh thông tin hạn gói tập.

---

## 🧪 PHẦN 5: KIỂM THỬ & NGHIỆM THU (ACCEPTANCE CRITERIA)

| Mục kiểm thử | Hành động kiểm tra | Kết quả mong đợi |
| :--- | :--- | :--- |
| **1. Session Wallet Increment** | Hội viên mua gói Diamond 180 ngày (24 buổi PT) qua `/api/memberships/subscribe`. | CSDL cập nhật: `MemberSubscription.grantedPtSessions = 24` và ví `MemberProfile.remainingPtSessions` tăng thêm đúng 24 buổi! |
| **2. Addon Stacking** | Hội viên đang có 24 buổi mua thêm gói PT Addon 10 buổi. | Ví `MemberProfile.remainingPtSessions` nhảy lên đúng 34 buổi. |
| **3. Mobile Dashboard Accuracy** | Gọi `/api/member/dashboard` cho hội viên trên. | Trả về đúng `remainingPtSessions = 34` (đọc từ ví chứ không bị kẹt ở gói chính). |
| **4. Booking Deduction Safety** | Đặt lịch PT qua `/api/bookings`. | Ví `MemberProfile.remainingPtSessions` giảm từ 34 ➔ 33 thành công mượt mà. |
| **5. Build Verification** | Chạy `npm run build` trên `admin-web` và `npx tsc --noEmit` trên `mobile-app`. | Cả hai dự án biên dịch thành công 100%, 0 lỗi. |
