# 📋 SPRINT 3: ĐỐI CHIẾU & AUDIT NGHIỆP VỤ (POS, KHO & HÓA ĐƠN)

## 1. Mục Tiêu Sprint 3
Chuẩn hóa toàn diện chu trình bán hàng tại quầy (POS), quản trị tồn kho hàng hóa lẻ (`Product`), phát hành hóa đơn (`Invoice`, `InvoiceItem`) và ghi nhận doanh thu tự động từ cả POS và cổng thanh toán trực tuyến MoMo.

---

## 2. Đối Chiếu Code Hiện Tại Với Nghiệp Vụ Thực Tế (`Nghiệp_vụ.txt`)

### A. Phân Hệ Hóa Đơn & Chi Tiết Hóa Đơn (`Invoice`, `InvoiceItem`)
| Yêu cầu nghiệp vụ (`Nghiệp_vụ.txt`) | Thực trạng Schema & Code | Đánh giá & Rủi ro |
| :--- | :--- | :--- |
| Hóa đơn ghi nhận đầy đủ người lập (`cashierId`), khách mua (`memberId`), tổng tiền (`totalAmount`), hình thức thanh toán (`paymentMethod`). | Schema `Invoice` có đủ các trường này. | **Đạt** |
| Chi tiết hóa đơn (`InvoiceItem`) phải lưu đơn giá tại thời điểm bán (`unitPrice`), số lượng (`quantity`), thành tiền (`subTotal`). | `InvoiceItem` trong `schema.prisma` chỉ có `quantity` và `subTotal`, **hoàn toàn thiếu cột `unitPrice`**! | **LỖI NGHIÊM TRỌNG:** Nếu giá niêm yết của sản phẩm thay đổi sau này, toàn bộ lịch sử kế toán sẽ bị sai lệch, không thể đối soát giá vốn và đơn giá xuất kho. |

### B. Nghiệp Vụ Bán Hàng Tại Quầy (`pos.route.ts`)
| Yêu cầu nghiệp vụ | Thực trạng trong `pos.route.ts` | Đánh giá & Rủi ro |
| :--- | :--- | :--- |
| Khi bán sản phẩm lẻ (nước, whey, phụ kiện), hệ thống phải kiểm tra tồn kho (`stock >= quantity`) và **tự động trừ tồn kho** `Product.stock`. | Trong `router.post('/invoice')`: Code chỉ tạo bản ghi `Invoice` và `InvoiceItem`, **hoàn toàn KHÔNG trừ `Product.stock`**! | **LỖI LOGIC NẶNG:** Bán bao nhiêu hàng thì tồn kho trong DB vẫn giữ nguyên, dẫn đến âm kho và sai lệch tài sản kiểm kê. |
| Nếu khách hàng mua thẻ tập tại quầy, hệ thống tự động kích hoạt gói và **cộng dồn số buổi PT vào ví của hội viên** (`MemberProfile.remainingPtSessions`). | Đã hỗ trợ tạo `MemberSubscription` và tăng `remainingPtSessions` trong Sprint 2. | **Cần gộp toàn bộ vào 1 Transaction ACID** để đảm bảo nếu trừ kho lỗi thì không tạo hóa đơn dở dang. |
| Cập nhật doanh số vào KPI nhân viên và tính hoa hồng bán hàng. | Đã có logic cập nhật `StaffKPI` và `CommissionLog`. | **Cần chuẩn hóa trong Transaction.** |

### C. Ghi Nhận Doanh Thu Từ Cổng Thanh Toán Trực Tuyến MoMo (`payment.route.ts` & `stats.route.ts`)
| Yêu cầu nghiệp vụ | Thực trạng trong `payment.route.ts` | Đánh giá & Rủi ro |
| :--- | :--- | :--- |
| Khi hội viên thanh toán gói tập thành công qua MoMo (IPN callback), hệ thống phải **tạo ngay Hóa Đơn (`Invoice`)** với `paymentMethod: 'MOMO'`. | Trong `payment.route.ts`: Webhook chỉ tạo `MemberSubscription` và nạp buổi PT, **hoàn toàn KHÔNG tạo `Invoice`**! | **LỖI THẤT THOÁT DOANH THU:** Mọi thống kê doanh thu trong `stats.route.ts` đều dựa trên `prisma.invoice.findMany()`. Khi MoMo không sinh hóa đơn, toàn bộ doanh thu online bị bốc hơi khỏi báo cáo kế toán (doanh thu = 0đ)! |

### D. Giao Diện Quản Trị Admin Web (`/pos` & `/inventory`)
- Màn hình POS [admin-web/src/components/POS/index.tsx](file:///E:/DATN_Quan/admin-web/src/components/POS/index.tsx):
  - Dùng giao diện tối màu xám đen với màu neon `#39FF14`, lệch chuẩn nhận diện Warm Editorial.
  - Mã nguồn 1 file đơn thể cồng kềnh, không chia component giỏ hàng, lưới sản phẩm, tìm kiếm khách hàng.
  - Chưa hỗ trợ phím tắt và tìm kiếm/lọc sản phẩm theo danh mục.
- Màn hình Quản lý Kho [admin-web/src/components/Inventory/index.tsx](file:///E:/DATN_Quan/admin-web/src/components/Inventory/index.tsx):
  - Dùng raw `axiosClient`, trộn lẫn Gói tập và Hàng hóa bán lẻ.
  - Thiếu phân trang, thiếu cảnh báo hàng sắp hết kho, thiếu quản lý ảnh sản phẩm chuyên nghiệp.

---

## 3. Kết Luận & Hướng Xử Lý Sprint 3
1. **Schema:** Thêm `unitPrice Float @default(0)` vào `InvoiceItem`.
2. **Backend POS:** Đưa toàn bộ quy trình: Kiểm tra kho -> Trừ kho `Product.stock` -> Tạo Hóa đơn (`unitPrice`, `subTotal`) -> Kích hoạt gói/ví PT -> Cập nhật KPI/Hoa hồng vào một khối **`prisma.$transaction`** duy nhất.
3. **Backend Payment:** Tự động phát hành `Invoice` + `InvoiceItem` khi MoMo IPN trả về thành công.
4. **Frontend UI:**
   - Xây dựng lại màn hình POS theo phong cách Warm Editorial: Lưới hàng hóa trực quan bên trái, Giỏ hàng chốt đơn & khóa khách hàng bên phải.
   - Xây dựng lại màn hình Quản lý kho hàng `/inventory` chuẩn mực: Danh sách sản phẩm, cảnh báo tồn kho, modal nhập hàng & chỉnh sửa giá.
