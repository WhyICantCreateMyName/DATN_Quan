# 🔍 SPRINT 2 REVIEW: GÓI TẬP & QUYỀN LỢI HỘI VIÊN
> **Đối tượng:** `MembershipPlan`, `MemberSubscription`, `MemberProfile` (Ví số buổi)  
> **Tài liệu căn cứ:** [Nghiệp_vụ.txt](file:///e:/DATN_Quan/Nghiệp_vụ.txt) (Mục QUẢN LÝ - Cấu hình gói tập & HỘI VIÊN - Trạm điều khiển & Gói tập)  
> **Mã nguồn rà soát:** 
> - Backend: `API/prisma/schema.prisma`, `API/src/routes/membership.route.ts`, `API/src/routes/member.route.ts`, `API/src/routes/booking.route.ts`  
> - Frontend Web: `admin-web/src/types/membership.ts`, `admin-web/src/components/Catalog/index.tsx`, `admin-web/src/services/membershipService.ts`  
> - Mobile App: `mobile-app/app/(member)/membership.tsx`, `mobile-app/app/(member)/index.tsx`, `mobile-app/hooks/useDashboard.ts`

---

## 1. ĐỐI CHIẾU NGHIỆP VỤ & LỖI LOGIC NGHIÊM TRỌNG

### 🚨 Vấn đề 1: Đứt gãy giữa Hợp đồng gói tập (`MemberSubscription`) và Ví số buổi (`MemberProfile`)
- **Nghiệp vụ chuẩn:**
  - Hội viên có thể sở hữu nhiều hợp đồng gói tập qua các thời kỳ: Gói tập chính (GOLD, DIAMOND) và Gói tập bổ sung (PT_ADDON - mua thêm số buổi kèm PT).
  - Bảng `MemberSubscription` đại diện cho **Hợp đồng thành viên (Membership Contract)**: Ghi nhận ngày bắt đầu (`startDate`), ngày kết thúc (`endDate`), trạng thái gói (`ACTIVE`, `FROZEN`, `EXPIRED`) và **Số buổi PT được cấp theo hợp đồng** đó (`grantedPtSessions`).
  - Bảng `MemberProfile` đại diện cho **Ví số dư thực tế (Session Wallet)** của hội viên: Cột `remainingPtSessions` là nguồn chân lý duy nhất lưu trữ số buổi tập PT còn lại mà hội viên được phép đặt lịch.
  - Mỗi khi hội viên mua mới hoặc gia hạn gói tập, hệ thống **bắt buộc phải cộng dồn** (`increment`) số buổi tập được cấp vào ví `MemberProfile.remainingPtSessions`.
- **Mã nguồn thực tế (Codebase vi phạm):**
  - Tại [API/src/routes/membership.route.ts#L88](file:///e:/DATN_Quan/API/src/routes/membership.route.ts#L88) và [API/src/routes/membership.route.ts#L104](file:///e:/DATN_Quan/API/src/routes/membership.route.ts#L104):
    ```typescript
    // Khi gia hạn cùng tag:
    await prisma.memberSubscription.update({
      where: { id: existingSub.id },
      data: {
        endDate: newEndDate,
        remainingPtSessions: existingSub.remainingPtSessions + plan.ptSessions
      }
    });

    // Khi mua gói mới:
    await prisma.memberSubscription.create({
      data: {
        memberId: Number(memberId),
        planId: Number(planId),
        startDate: new Date(),
        endDate,
        remainingPtSessions: plan.ptSessions,
        status: 'ACTIVE'
      }
    });
    ```
  - Backend chỉ ghi số buổi vào dòng `MemberSubscription`, **hoàn toàn quên cập nhật vào `MemberProfile.remainingPtSessions`**!
  - Trong khi đó, tại [API/src/routes/booking.route.ts#L50](file:///e:/DATN_Quan/API/src/routes/booking.route.ts#L50), endpoint đặt lịch lại kiểm tra ví:
    ```typescript
    if (member.remainingPtSessions <= 0) {
      return res.status(400).json({ error: 'Bạn đã hết số buổi tập PT' });
    }
    ```
- **Hệ lụy vận hành cực kỳ nghiêm trọng:**
  - Khách hàng chi 5.000.000 VNĐ mua gói Diamond kèm 24 buổi PT, giao dịch thành công nhưng mở App đặt lịch PT thì ngay lập tức bị chặn với thông báo "Bạn đã hết số buổi tập PT" vì ví `MemberProfile.remainingPtSessions` vẫn là `0`!

---

### 🚨 Vấn đề 2: Trùng tên cột gây hiểu nhầm tai hại giữa 2 bảng
- **Hiện trạng Schema:**
  - Bảng `MemberSubscription` có cột `remainingPtSessions Int @default(0)`
  - Bảng `MemberProfile` cũng có cột `remainingPtSessions Int @default(0)`
- **Nguyên nhân:**
  - AI phiên bản trước đã đặt 2 cột này trùng tên, khiến người đọc mã nguồn và các đoạn code xử lý API nhầm lẫn giữa hai khái niệm: "Số buổi được cấp theo hợp đồng" và "Số buổi còn lại trong ví của khách hàng".
- **Chuẩn hóa:**
  - Đổi tên `MemberSubscription.remainingPtSessions` ➔ **`grantedPtSessions`** (Số buổi PT được cấp theo hợp đồng).
  - Giữ nguyên `MemberProfile.remainingPtSessions` là Ví số buổi thực tế khả dụng.

---

### 🚨 Vấn đề 3: Mobile Dashboard đọc sai nguồn dữ liệu số buổi
- **Mã nguồn thực tế:**
  - Tại [API/src/routes/member.route.ts#L33-L45](file:///e:/DATN_Quan/API/src/routes/member.route.ts#L33-L45):
    ```typescript
    subscriptions.sort((a: any, b: any) => {
       const priority: any = { 'DIAMOND': 2, 'GOLD': 1 };
       return (priority[b.plan.tag] || 0) - (priority[a.plan.tag] || 0);
    });
    const activeSub = subscriptions.length > 0 ? subscriptions[0] : null;

    res.json({
       activeSubscription: activeSub,
       remainingPtSessions: activeSub ? activeSub.remainingPtSessions : 0
    });
    ```
- **Lỗi logic:**
  - Backend lấy `activeSub.remainingPtSessions` của gói chính đầu tiên trả về cho Mobile App.
  - Nếu khách hàng mua gói Gold (0 buổi PT) và mua thêm gói `PT_ADDON` (10 buổi PT), `activeSub` là gói Gold, dẫn tới Mobile Dashboard báo khách có `0 buổi PT`! Toàn bộ gói bổ sung bị biến mất trên giao diện người dùng.
- **Chuẩn hóa:**
  - Đọc `remainingPtSessions` trực tiếp từ ví `MemberProfile.remainingPtSessions`.

---

### 🚨 Vấn đề 4: Thiếu Prisma Transaction khi thực hiện Subscribe
- **Hiện trạng:**
  - Các thao tác cập nhật `MemberSubscription` và ví `MemberProfile` đang thực hiện rời rạc, không bọc trong `prisma.$transaction`. Nếu có lỗi xảy ra ở giữa, dữ liệu hợp đồng và số dư ví sẽ bị lệch nhau vĩnh viễn.
- **Chuẩn hóa:**
  - Bọc toàn bộ thao tác trong `prisma.$transaction([...])`.

---

## 2. ĐỐI CHIẾU KIẾN TRÚC & DESIGN PATTERN FRONTEND

### ⚠️ Thiếu sót tầng Frontend Types (`src/types/membership.ts`)
- **Hiện trạng:** File `admin-web/src/types/membership.ts` chỉ có 4 dòng, phụ thuộc `@prisma/client`.
- **Chuẩn hóa:** Tách thành các interface chuẩn độc lập:
  1. `MembershipPlan`
  2. `MemberSubscription`
  3. `CreatePlanDto`
  4. `UpdatePlanDto`
  5. `SubscribeDto`
  6. `PlanQueryParams`

### ⚠️ Thiếu sót tầng Hook SWR (`useMembership.ts`)
- **Hiện trạng:** Quản lý gói tập đang gộp chung trong hook monolithic `useCatalog` cùng với Lớp học và Sản phẩm, gọi `alert()` khi lỗi, không có SWR cache 10s và ToastContext toàn cục.
- **Chuẩn hóa:** Tách riêng Custom Hook `useMembershipPlans` và `useMembership` với SWR cache, mutation `createPlan`, `updatePlan`, `deletePlan`, `subscribePlan` tự động revalidate và báo Toast chuẩn.

### ⚠️ Cấu trúc Module Quản lý Gói tập Admin Web (`/catalog`)
- **Hiện trạng:** File `admin-web/src/components/Catalog/index.tsx` dài 376 dòng, phong cách tối u ám.
- **Chuẩn hóa:** Tách module Gói tập thành các khối con độc lập (`PlanTable`, `PlanTableHeader`, `PlanTableRow`, `ModalCreatePlan`, `ModalEditPlan`) áp dụng chuẩn hệ màu **Warm Editorial / Clean Slate**.

---

## 3. ĐỐI CHIẾU GIAO DIỆN HỘI VIÊN MOBILE APP

### ❌ Giao diện Mua gói & Thẻ Hội Viên cũ
- `mobile-app/app/(member)/membership.tsx` đang dùng màu xanh da trời cũ `#0ea5e9`, nền `#020617`, chưa hiển thị ví số buổi tập khả dụng, các thẻ gói tập bố cục đơn điệu.
- **Chuẩn hóa theo High-Performance Kinetic Dark:**
  - Nền Obsidian Black (`#0E100F`), Thẻ Carbon Gray (`#1A1D1B`), Viền `#272B28`.
  - Hiển thị rõ nét thẻ E-Card: Tên gói chính, Hạn dùng, Số ngày còn lại, và **Ví số buổi PT trong tài khoản (`remainingPtSessions`)**.
  - Danh sách gói tập có Badge phân hạng (GOLD, DIAMOND, PT_ADDON) sắc nét với nút đăng ký màu Kinetic Volt (`#C8F135`).

---

## 4. BẢNG TỔNG HỢP CÁC ĐIỂM VI PHẠM CẦN KHẮC PHỤC TRONG SPRINT 2

| STT | Vị trí file | Vi phạm logic / thiết kế | Giải pháp chuẩn hoá |
| :---: | :--- | :--- | :--- |
| **1** | `API/prisma/schema.prisma` | Cột `MemberSubscription.remainingPtSessions` trùng tên gây hiểu nhầm lớn. | Đổi tên thành `MemberSubscription.grantedPtSessions`. |
| **2** | `API/src/routes/membership.route.ts:80-115` | Đăng ký/gia hạn gói không cộng buổi vào `MemberProfile.remainingPtSessions`. | Dùng Transaction: vừa tạo/cập nhật subscription, vừa `increment` số buổi vào `MemberProfile.remainingPtSessions`. |
| **3** | `API/src/routes/member.route.ts:40-45` | Dashboard hội viên đọc số buổi PT từ `activeSub[0]` thay vì ví tổng. | Đọc `remainingPtSessions` từ `MemberProfile.remainingPtSessions`. |
| **4** | `admin-web/src/types/membership.ts` | Import `@prisma/client`, thiếu DTO chuẩn. | Viết lại đầy đủ interface DTO chuẩn theo pattern `e:/datn`. |
| **5** | `admin-web/src/hooks/useMembership.ts` | Thiếu hook SWR độc lập cho gói tập. | Xây dựng `useMembershipPlans` và `useMembership` (cache 10s, Toast, mutate). |
| **6** | `admin-web/src/components/Catalog/` | Monolith 376 dòng, UI tối đen AI cũ. | Tách khối quản lý Gói tập chuẩn hóa theo bảng màu Warm Editorial. |
| **7** | `mobile-app/app/(member)/membership.tsx` | UI cũ xanh dương, thiếu widget hiển thị số dư ví PT. | Tái cấu trúc theo High-Performance Kinetic Dark + hiển thị ví buổi tập. |
