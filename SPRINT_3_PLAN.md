# 🛠️ SPRINT 3: KẾ HOẠCH HÀNH ĐỘNG CHI TIẾT (POS, KHO & HÓA ĐƠN)

## 1. Mục Tiêu Sprint 3
- Bổ sung trường `unitPrice` vào bảng `InvoiceItem` trong database để lưu vết giá bán tại thời điểm lập hóa đơn.
- Chuẩn hóa toàn bộ nghiệp vụ bán hàng tại quầy trong `pos.route.ts`: Kiểm tra tồn kho, tự động trừ `Product.stock`, tạo `InvoiceItem` có `unitPrice`, tự động nạp thẻ tập và số buổi PT vào ví, cập nhật KPI trong 1 Transaction an toàn.
- Khắc phục triệt để lỗ hổng thất thoát doanh thu trong `payment.route.ts`: Tự động lập `Invoice` thanh toán `MOMO` khi nhận IPN thành công.
- Tái thiết kế giao diện POS và Kho hàng trên Admin Web theo phong cách **Warm Editorial / Clean Slate** (`#F7F7F5`, `#FFFFFF`, border `#E4E4E0`, `#18181B`, `#6E6E77`, `#EA580C`, `#15803D`, `JetBrains Mono`).

---

## 2. Chi Tiết Kỹ Thuật Từng Thành Phần

### Bước 3: Logic & Database Schema
1. **Schema Prisma (`API/prisma/schema.prisma`):**
   ```prisma
   model InvoiceItem {
     id           Int      @id @default(autoincrement())
     invoiceId    Int
     invoice      Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
     
     planId       Int?
     plan         MembershipPlan? @relation(fields: [planId], references: [id])
     productId    Int?
     product      Product? @relation(fields: [productId], references: [id])
     
     quantity     Int      @default(1)
     unitPrice    Float    @default(0) // Giá bán đơn vị tại thời điểm giao dịch
     subTotal     Float
   }
   ```
   - Chạy `npx prisma db push --accept-data-loss` và `npx prisma generate`.

2. **Refactor API POS (`API/src/routes/pos.route.ts`):**
   - Viết lại `POST /api/pos/invoice` sử dụng `prisma.$transaction(async (tx) => { ... })`:
     - Duyệt từng item trong giỏ:
       - Nếu là sản phẩm: Kiểm tra tồn kho `prod.stock >= item.quantity`. Nếu không đủ, throw error thông báo rõ số lượng còn lại. Sau đó gọi `tx.product.update` với `stock: { decrement: item.quantity }`. Ghi nhận `unitPrice = prod.price`.
       - Nếu là gói tập: Ghi nhận `unitPrice = plan.price`. Nếu có `memberId`, tự động kích hoạt `MemberSubscription` và `increment` số buổi PT vào `MemberProfile.remainingPtSessions`.
     - Tạo `Invoice` và các `InvoiceItem` (`unitPrice`, `quantity`, `subTotal`).
     - Tự động ghi nhận KPI cho nhân viên thu ngân (`StaffKPI.achievedAmount`) và tính hoa hồng bán hàng (`CommissionLog`).

3. **Refactor MoMo IPN (`API/src/routes/payment.route.ts`):**
   - Khi `resultCode === 0`:
     - Tự động tạo bản ghi `Invoice` với `cashierId` (Admin hệ thống), `memberId`, `totalAmount: plan.price`, `paymentMethod: 'MOMO'`.
     - Tạo `InvoiceItem` chứa `planId: plan.id`, `quantity: 1`, `unitPrice: plan.price`, `subTotal: plan.price`.
     - Kích hoạt gói và nạp số buổi PT vào ví hội viên.
     - Giúp toàn bộ doanh thu online được tính tự động vào bảng doanh thu của phòng gym trong `stats.route.ts`.

4. **Kịch bản Kiểm thử Tự Động (`API/verify_sprint3.ts`):**
   - Kiểm tra bán sản phẩm có trừ tồn kho chính xác không.
   - Kiểm tra mua vượt số lượng tồn kho có bị chặn báo lỗi không.
   - Kiểm tra bán gói tập tại POS có nạp số buổi vào ví hội viên không.
   - Kiểm tra MoMo IPN có sinh hóa đơn và `stats.route.ts` có cộng tiền không.

---

### Bước 4: Tái Cấu Trúc Giao Diện Admin Web
1. **Types (`admin-web/src/types/`):**
   - `admin-web/src/types/product.ts`: `Product`, `CreateProductDto`, `UpdateProductDto`, `ProductQueryParams`.
   - `admin-web/src/types/pos.ts`: `CartItem`, `Invoice`, `InvoiceItem`, `CreateInvoiceDto`.
2. **Services (`admin-web/src/services/`):**
   - `productService.ts`: `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`.
   - `posService.ts`: `createInvoice`, `getInvoices`.
3. **SWR Hooks (`admin-web/src/hooks/`):**
   - `useProducts.ts`: Cache SWR 10s, auto mutate và Toast thông báo.
   - `usePOS.ts`: Quản lý state giỏ hàng, tìm kiếm hội viên, tính tổng tiền, thanh toán với Toast thông báo.
4. **Components POS (`admin-web/src/components/POS/`):**
   - Layout 2 cột Warm Editorial:
     - Cột trái: Bộ lọc phân loại (Tất cả, Thẻ tập, Nước uống, Dinh dưỡng, Phụ kiện), Ô tìm kiếm nhanh, Lưới sản phẩm dạng thẻ với ảnh và tồn kho.
     - Cột phải: Khung tìm kiếm và khóa hội viên (SĐT), Danh sách giỏ hàng kèm tăng/giảm số lượng, Phím chọn hình thức thanh toán (Tiền mặt, Chuyển khoản, MoMo), Nút thanh toán lớn nổi bật màu `#EA580C`.
5. **Components Inventory (`admin-web/src/components/Inventory/`):**
   - Bảng danh sách hàng tồn kho Warm Editorial: Cảnh báo hàng sắp hết (`stock <= 5` màu đỏ, `stock <= 15` màu cam), phân trang, tìm kiếm.
   - Modal Thêm sản phẩm mới kèm upload ảnh.
   - Modal Chỉnh sửa thông tin và cập nhật tồn kho nhanh.
