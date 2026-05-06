# 📋 Quy trình Nghiệp vụ: Phân hệ PT & HỘI VIÊN

Tài liệu này chi tiết hóa các bước thực hiện cho từng chức năng của Huấn luyện viên (PT) và Hội viên, dựa trên tài liệu nghiệp vụ cốt lõi.

---

## 1. PHÂN HỆ HUẤN LUYỆN VIÊN (PT APP)

### A. Quản lý Lịch trình & Đặt lịch
1. **Khai báo lịch rảnh (Availability):**
   - PT truy cập vào màn hình "Quản lý lịch rảnh".
   - Chọn các khung giờ (Time slots) có thể dạy trong tuần.
   - Hệ thống lưu vào DB và hiển thị các khung giờ này trên App của Hội viên để họ có thể chọn Booking.
2. **Xử lý Booking:**
   - Khi có Hội viên đặt lịch, PT nhận được thông báo (Push Notification).
   - PT xem chi tiết: Tên học viên, mục tiêu buổi tập, thời gian.
   - PT bấm **Xác nhận** (Confirm) hoặc **Từ chối** (Decline - kèm lý do).
3. **Xem thời khóa biểu:**
   - PT xem lịch dạy tổng quát theo Ngày hoặc Tuần (Dạng Calendar).

### B. Quản lý Chỉ số Hình thể (Inbody Tracking)
1. **Nhập liệu:** PT tiến hành đo chỉ số cho học viên tại phòng tập.
2. PT mở hồ sơ học viên trên App, chọn "Cập nhật Inbody".
3. Nhập các thông số: Cân nặng, % Mỡ, % Cơ, BMI...
4. **Phân tích:** Hệ thống tự động tính toán và vẽ biểu đồ Radar so sánh với lần đo trước đó. PT dựa vào đây để tư vấn lộ trình tiếp theo.

### C. Nhật ký Tập luyện & Dinh dưỡng
1. Sau hoặc trong buổi tập, PT mở "Nhật ký giáo án".
2. Ghi chú các bài tập đã thực hiện (VD: Bench Press 3 hiệp x 12 lần).
3. Đánh giá trạng thái thể lực của học viên (Khỏe/Mệt).
4. (Tùy chọn) Ghi chú thực đơn dinh dưỡng khuyến nghị cho tuần tới.

### D. Xác nhận Buổi dạy (Check-in kép)
1. **Khởi tạo:** Cuối buổi tập, PT bấm "Hoàn thành buổi dạy".
2. **Xác thực:** PT hiển thị mã QR trên App của mình hoặc yêu cầu Hội viên quét khuôn mặt/vân tay.
3. **Trừ buổi:** Hệ thống xác nhận buổi tập hợp lệ -> Tự động trừ 1 buổi trong gói tập của Hội viên.
4. **Ghi nhận:** Hệ thống cộng doanh số/buổi dạy vào báo cáo hiệu suất của PT để tính hoa hồng.

---

## 2. PHÂN HỆ HỘI VIÊN (MEMBER APP)

### A. Dashboard & Thẻ Thành viên điện tử (E-card)
1. **Theo dõi trạng thái:** Hội viên xem ngay tại trang chủ: Ngày hết hạn thẻ, số buổi PT còn lại.
2. **Check-in vào cổng:** 
   - Hội viên bấm vào biểu tượng Thẻ E-card.
   - Hệ thống tạo **Mã QR Động** (tự động thay đổi sau 30-60 giây để chống gian lận).
   - Hội viên quét mã tại cổng từ để vào phòng tập.

### B. Đặt lịch (Booking)
1. **Đặt lớp Group X (Yoga, Zumba...):**
   - Xem thời khóa biểu các lớp công khai.
   - Chọn lớp còn chỗ -> Bấm "Giữ chỗ".
   - Nhận thông báo nhắc lịch trước 30 phút.
2. **Đặt lịch tập với PT:**
   - Chọn PT cá nhân của mình.
   - Xem các khung giờ rảnh của PT -> Chọn giờ phù hợp -> Bấm "Đặt lịch".
   - Chờ PT xác nhận.

### C. Theo dõi Tiến độ Sức khỏe
1. Hội viên vào mục "Sức khỏe cá nhân".
2. Xem biểu đồ tăng trưởng cơ bắp và giảm mỡ qua các tháng.
3. Xem lại lịch sử tập luyện: Ngày nào đã tập, tập bài gì, PT nào dạy.

### D. Gia hạn & Thanh toán trực tuyến
1. Khi gói tập sắp hết hạn, hệ thống gửi thông báo nhắc nhở.
2. Hội viên chọn "Gia hạn gói tập" ngay trên App.
3. Chọn gói tập mới -> Chọn phương thức thanh toán (VNPay / MoMo).
4. **Xử lý:** Sau khi thanh toán thành công, hệ thống tự động cập nhật ngày hết hạn mới vào hồ sơ mà không cần qua quầy lễ tân.

### E. Đánh giá & Phản hồi (Feedback)
1. Sau khi buổi tập PT kết thúc, màn hình đánh giá hiện ra.
2. Hội viên chấm sao (1-5) và để lại nhận xét về chất lượng buổi dạy.
3. Dữ liệu được gửi về cho Quản lý để đánh giá KPI của nhân viên.
