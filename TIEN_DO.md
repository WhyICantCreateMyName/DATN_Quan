# 📊 Bảng Theo Dõi Tiến Độ Nghiệp Vụ (Master Checklist)

Dựa trên tài liệu `Nghiệp_vụ.txt` và kiến trúc hệ thống hiện tại, đây là bức tranh toàn cảnh về tiến độ dự án. Các tính năng có dấu `[x]` là những phần chúng ta đã hoàn thiện phần lớn cấu trúc cốt lõi.

## 1. Ứng Dụng DI ĐỘNG (Member & PT Unified App)
- [x] **Hệ thống Điều hướng Role-based:** Tự động chuyển hướng giao diện theo Role (Hội viên/PT) sau khi đăng nhập.

### 🟢 Nghiệp vụ HỘI VIÊN (Member Features)
- [x] **Trạm điều khiển:** Xem Gói tập đang hoạt động, Số buổi PT, ngày hết hạn.
- [x] **Thẻ điện tử (E-card):** Tạo QR Code động để check-in cổng từ.
- [x] **Theo dõi Sức khỏe:** Biểu đồ Radar Inbody và lịch sử tập luyện.
- [x] **Xem Lịch tập:** Danh sách buổi hẹn PT và lớp Group X.
- [x] **Đặt lịch (Booking):** Đặt lịch PT hoặc giữ chỗ lớp Yoga/Zumba.
- [x] **Thanh toán trực tuyến:** Gia hạn gói tập hoặc mua dịch vụ trên App.

### 🔵 Nghiệp vụ HUẤN LUYỆN VIÊN (Trainer Features)
- [x] **Hồ sơ chuyên môn:** Cập nhật Avatar, Bio và chứng chỉ.
- [x] **Quản lý Học viên:** Nhập chỉ số Inbody và theo dõi tiến độ khách hàng.
- [x] **Thời khóa biểu PT:** Quản lý danh sách các buổi dạy trong ngày.
- [x] **Quản lý lịch rảnh (Availability):** Khai báo giờ rảnh để khách đặt lịch.
- [x] **Nhật ký giáo án:** Ghi chú bài tập chi tiết cho từng học viên (Đã đồng bộ sang Member App).
- [x] **Xác nhận buổi tập:** Cơ chế quét mã xác nhận trừ buổi của khách.

## 3. Phân hệ LANDING PAGE (Public - Gộp vào Admin Web)
- [x] **Giao diện Giới thiệu:** Khám phá cơ sở vật chất, Đội ngũ PT và giá trị cốt lõi.
- [x] **Tra cứu Lịch học:** Xem Public các lớp Group X để khách tham khảo.
- [x] **Thông tin Gói tập & Ưu đãi:** Bảng giá công khai và các chương trình khuyến mãi.
- [x] **Chỉ dẫn Đăng ký:** Hướng dẫn khách hàng đến trực tiếp phòng tập để làm thủ tục.

## 4. Phân Hệ LỄ TÂN & BÁN HÀNG (Admin Web / POS)
- [x] **Khởi tạo dữ liệu cơ bản:** Database đã sẵn sàng cấu trúc User và Invoice.
- [x] **Đón tiếp & Check-in:** Màn hình thu thập mã QR từ Hội viên để mở cổng.
- [x] **Bán hàng & Thu ngân (POS):** Lập hóa đơn bán Gói tập / Nước / Whey.
- [x] **Quản lý Hồ sơ (Onboarding):** Form thêm khách mới, chụp ảnh.
- [x] **Quản lý Locker:** Check-in cấp phát tủ đồ.

## 5. Phân Hệ QUẢN LÝ TỔNG (Admin Back-office)
- [x] **Database & Kiến trúc:** Hệ thống DB phân quyền rõ ràng 4 Role (Admin, Receptionist, PT, Member).
- [x] **Quản lý Danh mục:** Giao diện thêm/sửa Gói tập, Lớp học, Hàng hóa.
- [ ] **Báo cáo Chiến lược:** Dashboard doanh thu, heatmap khung giờ cao điểm.
- [x] **Quản lý Nhân sự & KPI:** Setup hoa hồng cho PT, theo dõi lịch trực lễ tân.

## 6. Kiến Trúc & Tiêu Chuẩn Kỹ Thuật (Non-Functional Rules)
- [x] **Cấu trúc Thư mục:** Đã phân rã toàn bộ logic theo mô hình `types` ↔ `services` ↔ `hooks` → `components` → `pages/screens`.
- [x] **Namespace Export:** Khởi tạo `types/index.ts` và gom nhóm Type (VD: `MemberType`, `AuthType`).
- [x] **Chuẩn hóa API & Phân trang:** Áp dụng Type đồng bộ với Prisma và đóng gói danh sách vào `PaginationResponse<T>`.
- [x] **Core Utilities:** Tách toàn bộ Regex (SĐT, Email) và Formatter (Tiền tệ, Ngày tháng) thành Pure Functions trong thư mục `@/libs`.
