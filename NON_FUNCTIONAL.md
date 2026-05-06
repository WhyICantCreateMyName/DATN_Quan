# KHIẾM KHUYẾT VÀ YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements & Coding Standards)

Tài liệu này định nghĩa các tiêu chuẩn kỹ thuật, quy tắc viết code và kiến trúc thư mục bắt buộc phải tuân thủ cho toàn bộ dự án (bao gồm Web Next.js và App React Native Expo).

## 1. Kiến Trúc Phân Lớp (Layered Architecture)
Tất cả các module chức năng (Feature) đều phải tuân thủ quy trình gọi dữ liệu một chiều nghiêm ngặt theo mô hình:
**`Types` ↔ `Services` ↔ `Hooks` → `Components` → `Page / Screen`**

### 🎯 Phân tách Trách nhiệm (Separation of Concerns)
1. **Thư mục `types/` (Data Definition)**
   - Nơi định nghĩa toàn bộ Type/Interface của TypeScript.
   - Định nghĩa DTO (Data Transfer Objects) cho Action API (Body request) và dữ liệu trả về (Response) từ các lệnh GET.
   - *Quy tắc 1:* Ở phía Backend API, bắt buộc phải trả về dữ liệu dựa trên Type/Interface được trích xuất từ Prisma (Ví dụ: `Prisma.UserGetPayload`) để đảm bảo đồng bộ với Database.
   - *Quy tắc 2:* Lớp trừu tượng Phân trang bắt buộc được khai báo tại đây:
     ```typescript
     interface PaginationResponse<T> {
       data: T[];
       page: number;
       total: number;
       limit: number;
     }
     ```
   - *Quy tắc 3:* Không chứa logic, chỉ chứa khai báo cấu trúc.
   - *Quy tắc 4 (Namespace Export):* Bắt buộc phải có file `index.ts` làm Root Exporter để phân phối các type theo không gian tên riêng biệt (gom nhóm).
     Ví dụ trong `index.ts`: `export * as MemberType from "./member.ts";`
     Cách sử dụng ở Service/Hook: `import { MemberType } from "@/types"; const data: MemberType.List = ...`

2. **Thư mục `services/` (Data Fetching)**
   - Đảm nhận duy nhất việc gọi API ra bên ngoài.
   - Sử dụng một (và chỉ một) **Axios Instance** (`apiClient.ts`) đã được cấu hình sẵn Interceptor, Header và Base URL.
   - *Quy tắc 1:* File service không được phép gọi lệnh thay đổi UI (Không dùng `Alert`, `Toast`, `Router` ở đây). Chỉ ném lỗi (throw error) hoặc trả về `res.data` nếu get, và `res.status` nếu body request.
   - *Quy tắc 2 (Strict Typing):* Frontend bắt buộc phải gắn kiểu (Type) ngay tại hàm gọi Service để minh bạch các Properties khi truy cập.
     Ví dụ: `const getMembers = (): Promise<PaginationResponse<MemberProfile>> => apiClient.get('/members?page=1&limit=10').then(res => res.data);`
   - *Quy tắc 3 (Phân trang):* Mọi API lấy danh sách đều phải thiết kế dạng GET kèm Query Params `?page=x&limit=y` và tuân thủ định dạng trả về `PaginationResponse<T>`.

3. **Thư mục `hooks/` (Business Logic & State)**
   - Chứa logic xử lý ở giao diện (Custom Hooks, ví dụ: `useAuth`, `useInbody`).
   - Kết nối trực tiếp với `services` để lấy dữ liệu.
   - Quản lý các trạng thái `loading`, `error`, `success` trước khi đẩy ra UI.
   - *Quy tắc:* Toàn bộ code xử lý logic phức tạp, gọi API phải nằm ở Hook, không viết thẳng vào Component.

4. **Thư mục `components/` (UI Elements & Page Modules)**
   - Chứa các khối giao diện tái sử dụng và các **Page Modules** (khối logic giao diện lớn theo từng màn hình).
   - *Cấu trúc:* Lưu dưới dạng thư mục (Folder-based). File chính đặt tên là `index.tsx`, các component con phục vụ riêng cho module đó đặt cùng trong thư mục này.
     Ví dụ: `components/Catalog/index.tsx`, `components/Catalog/PlanCard.tsx`, ...
   - *Quy tắc:* Nhận dữ liệu thông qua `props` từ Hook hoặc Page. Càng "ngu" (Dumb component) càng tốt, hạn chế chứa logic gọi API độc lập.

5. **`pages/` (Web) hoặc `screens/` (Mobile App)**
   - Là tầng bao bọc ngoài cùng (Container), gộp các Components lại để hiển thị thành một màn hình hoàn chỉnh.
   - Gọi các `hooks` để lấy State truyền xuống Component.
   - ⚠️ **Web Specific:** Các file `page.tsx` trong Next.js bắt buộc phải cấu hình `metadata` (SEO: Title, Description, OpenGraph) chuẩn chỉ.

6. **Thư mục `libs/` (Core Utilities & Helpers)**
   - Nơi tập trung toàn bộ các hàm tiện ích dùng chung không dính dáng đến logic giao diện hay Call API.
   - Chứa các biểu thức chính quy (Regex) kiểm tra dữ liệu đầu vào (Số điện thoại, Email, CCCD).
   - Chứa các hàm định dạng hiển thị (Formatters) như: Chuyển đổi giá trị tiền tệ sang chuẩn VND (`formatCurrency`), định dạng ngày tháng.
   - *Quy tắc:* Phải Export dưới dạng các hàm độc lập (Pure Functions) thông qua alias `@/libs` để dễ dàng tái sử dụng và viết Unit Test (Ví dụ: `import { formatVND, isValidPhone } from "@/libs/utils"`).

## 2. Tiêu chuẩn Thiết kế (Design & UI/UX)
- **Styling:** Tuân thủ 100% việc sử dụng **Tailwind CSS** (Web) và **NativeWind v4** (Mobile). Không viết file `.css` tách rời trừ `global.css`.
- **Theme:** Đồng bộ hệ thống biến màu sắc trong `tailwind.config.js` (Ví dụ: `ptPrimary`, `memberPrimary`).
- **Responsive:** Web phải đảm bảo xem tốt trên Mobile/Tablet. App phải sử dụng `SafeAreaView` và `KeyboardAvoidingView` để tránh lỗi màn hình tai thỏ/bàn phím che khuất.
- **Feedback:** Thao tác gọi API bắt buộc phải có hiệu ứng Loading (Spinner/Skeleton) và phản hồi kết quả bằng Context (Ví dụ: `ToastContext` góc phải màn hình, không dùng mặc định của trình duyệt).

## 3. Tiêu chuẩn Mã nguồn & Hiệu suất (Clean Code & Performance)
- Lược bỏ hoàn toàn các `console.log()` khi đẩy lên môi trường Production.
- Sử dụng `useCallback` và `useMemo` đối với các biểu đồ dữ liệu lớn (như Inbody Radar Chart) hoặc danh sách cuộn vô hạn để tối ưu khung hình.
- Bảo mật thông tin: Token truy cập bắt buộc lưu bằng `expo-secure-store` (App) và `HttpOnly Cookies` (Web), tuyệt đối không lưu JWT trong LocalStorage của Web.
