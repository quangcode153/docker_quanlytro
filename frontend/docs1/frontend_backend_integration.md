# Hướng dẫn Tích hợp Frontend và Backend

Tài liệu này cung cấp các quy tắc chuẩn mực để kết nối Frontend (React/Axios) với Backend (Spring Boot) và liệt kê toàn bộ các API/Chức năng đã được xây dựng. Hãy tham khảo kỹ trước khi thiết kế giao diện (UI) và gọi API.

## 1. Quy Tắc Kết Nối Chung

### 1.1 Cấu hình URL và Axios
- **Base URL Backend:** `http://localhost:8080/api`
- Toàn bộ các lượt gọi API trong frontend cần được thực hiện qua **Axios instance `api`** đã được cấu hình sẵn trong `src/api.js`. Không sử dụng `fetch` hay `axios` trực tiếp để tránh mất cấu hình chung.

### 1.2 Quản lý Token (Authentication)
- **Vị trí lưu trữ:** `localStorage` với key là `token` và `user`.
- **Gắn Token vào Header:** Axios interceptor sẽ tự động lấy token, xóa dấu nháy kép thừa (`replace(/"/g, '')`) và gắn vào header `Authorization` dưới dạng `Bearer {token}` cho mọi request.
- **Xử lý lỗi Token hết hạn (HTTP 401):** Sẽ tự động trigger event `auth-error`.
- **Xử lý lỗi cấm truy cập (HTTP 403):** Nếu backend trả về thông báo có chứa từ "khóa", hệ thống sẽ tự động xóa token, thông báo cho người dùng ("🚫 Phiên làm việc bị hủy...") và chuyển hướng về trang `/login`.

### 1.3 Cấu trúc dữ liệu
- Dữ liệu trao đổi thông qua định dạng **JSON**.
- API thường trả về dạng Object chuẩn hoặc List Object tùy theo endpoint. Nếu có lỗi nghiệp vụ (ví dụ: lỗi chốt số trùng lặp), Backend thường trả về HTTP Code thích hợp (409 Conflict, 400 Bad Request) kèm theo thông báo dạng: `{ "trangThai": "LỖI...", "thongBao": "..." }`.

---

## 2. Danh Sách Các Chức Năng Đã Có (API Endpoints)

Dưới đây là các chức năng đã được backend hỗ trợ, phân loại theo Controller để đội Frontend có thể nắm bắt và thiết kế giao diện phù hợp:

### 2.1. Quản lý Tài Khoản & Phân Quyền (`/api/tai-khoan`)
*Các role hiện có: ADMIN, CHU_TRO (Chủ trọ), NGUOI_THUE (Người thuê).*
- `POST /api/tai-khoan/login`: Đăng nhập hệ thống.
- `POST /api/tai-khoan/register`: Đăng ký tài khoản mới.
- `GET /api/tai-khoan/me`: Lấy thông tin tài khoản đang đăng nhập.
- `GET /api/tai-khoan/chu-tro`: Lấy danh sách tài khoản là Chủ trọ.
- `GET /api/tai-khoan/admin/danh-sach-tai-khoan`: Lấy toàn bộ người dùng (Dành cho Admin).
- `PUT /api/tai-khoan/admin/{id}/toggle-lock`: Khóa / Mở khóa tài khoản (Dành cho Admin).

### 2.2. Quản lý Phòng Trọ (`/api/phong-tro`)
- `GET /api/phong-tro`: Lấy tất cả phòng trọ.
- `POST /api/phong-tro`: Tạo phòng trọ mới.
- `PUT /api/phong-tro/{id}`: Cập nhật thông tin phòng.
- `PUT /api/phong-tro/{id}/trang-thai`: Thay đổi trạng thái phòng (Trống, Đã thuê, Đang sửa chữa...).
- `DELETE /api/phong-tro/{id}`: Xóa phòng trọ.
- `GET /api/phong-tro/chu-tro/{chuTroId}`: Lấy danh sách phòng thuộc sở hữu của một chủ trọ cụ thể.
- `GET /api/phong-tro/tim-kiem` & `GET /api/phong-tro/loc-phong`: Tìm kiếm và lọc danh sách phòng trọ (theo giá, diện tích, vị trí...).

### 2.3. Quản lý Khách Hàng / Người Thuê (`/api/khach-hang`)
- `GET /api/khach-hang`: Lấy danh sách khách hàng.
- `GET /api/khach-hang/ho-so/me`: Lấy hồ sơ cá nhân của khách đang đăng nhập (bao gồm thông tin ngân hàng nếu là Chủ trọ).
- `PUT /api/khach-hang/ho-so/me`: Cập nhật thông tin hồ sơ khách (gồm cả `tenNganHang`, `soTaiKhoan`, `chuTaiKhoan` cho Chủ trọ).
- `GET /api/khach-hang/chi-tiet/{id}`: Xem thông tin chi tiết một khách thuê.
- `GET /api/tai-khoan/chu-tro/{id}/chi-tiet`: Lấy thông tin chi tiết chủ trọ (bao gồm `tenNganHang`, `soTaiKhoan`, `chuTaiKhoan` để tạo mã QR thanh toán).

### 2.4. Quản lý Hợp Đồng (`/api/hop-dong`)
- `GET /api/hop-dong`: Lấy toàn bộ hợp đồng.
- `POST /api/hop-dong`: Tạo hợp đồng cho thuê phòng mới.
- `GET /api/hop-dong/chu-tro/{chuTroId}`: Lấy danh sách hợp đồng của chủ trọ.
- `GET /api/hop-dong/khach/{khachId}`: Lấy danh sách hợp đồng của người thuê.
- `PUT /api/hop-dong/{id}/trang-thai`: Thay đổi trạng thái của hợp đồng (Hiệu lực, Đã hủy, Hết hạn...).

### 2.5. Chốt Số Điện Nước (`/api/dien-nuoc`)
- `POST /api/dien-nuoc/chot-so`: Chốt số điện nước tháng này và tạo phiếu tính tiền.
- `PUT /api/dien-nuoc/cap-nhat/{hoaDonId}`: Cập nhật lại số điện/nước nếu có sai sót.
- `GET /api/dien-nuoc/chi-so`: Lấy chỉ số điện nước theo truy vấn (phongId, tháng, năm).
- `GET /api/dien-nuoc/phong/{phongId}`: Lấy toàn bộ lịch sử ghi điện/nước của một phòng.

### 2.6. Quản lý Hóa Đơn Tính Tiền (`/api/hoa-don`)
- `GET /api/hoa-don/chu-tro/{chuTroId}`: Chủ trọ xem toàn bộ hóa đơn mình đã xuất.
- `GET /api/hoa-don/me`: Người thuê xem danh sách hóa đơn điện nước/tiền phòng của mình.
- `POST /api/hoa-don/{id}/thanh-toan`: Người thuê xác nhận đã thanh toán hóa đơn.

### 2.7. Quản lý Khiếu Nại & Hỗ Trợ (`/api/khieu-nai`)
- `GET /api/khieu-nai`: Lấy danh sách các khiếu nại / yêu cầu sửa chữa.
- `POST /api/khieu-nai`: Người thuê gửi yêu cầu/khiếu nại mới lên chủ trọ.
- `PUT /api/khieu-nai/{id}/xu-ly`: Chủ trọ cập nhật trạng thái đã xử lý cho khiếu nại.

### 2.8. Hệ Thống Thông Báo (`/api/thong-bao`)
- `GET /api/thong-bao/chu-tro/{chuTroId}`: Lấy danh sách thông báo gửi cho chủ trọ.
- `POST /api/thong-bao`: Đẩy thông báo mới trên hệ thống.

### 2.9. Báo Cáo & Thống Kê (`/api/thong-ke`)
- `GET /api/thong-ke/chu-tro/{id}`: Thống kê tổng quan cho chủ trọ (số lượng phòng, doanh thu ước tính, hóa đơn chưa thanh toán, tỷ lệ lấp đầy...).

### 2.10. Chat & Tin Nhắn (`/api/tin-nhan`)
- `GET /api/tin-nhan/{user1}/{user2}`: Truy xuất lịch sử tin nhắn giữa hai người dùng (ví dụ giữa chủ trọ và người thuê).

---

**Ghi chú cho Frontend Team:** 
Khi thiết kế các Component và Page mới, vui lòng nhập khẩu `import api from '../api';` và sử dụng `api.get()`, `api.post()`, `api.put()`, `api.delete()` để tương tác. Hãy bọc các lời gọi API trong thẻ `try...catch` để bắt lỗi phù hợp trên UI nhằm tăng trải nghiệm người dùng.

---

## 3. Quy Tắc Dịch Thuật (i18n - Đa ngôn ngữ)

Hệ thống đã được tích hợp `react-i18next` để hỗ trợ đa ngôn ngữ (Tiếng Việt & Tiếng Anh). 
Khi code giao diện mới hoặc chỉnh sửa Component cũ, **Tuyệt đối không hardcode text tiếng Việt**.

**Cách sử dụng:**
1. Import hook: `import { useTranslation } from 'react-i18next';`
2. Khởi tạo: `const { t } = useTranslation();`
3. Thay thế text tĩnh: `<p>{t('tên_key_dịch_thuật')}</p>`

**Cập nhật từ điển:**
Khi thêm từ vựng mới, hãy khai báo đồng thời vào 2 file:
- Tiếng Việt: `src/locales/vi/translation.json`
- Tiếng Anh: `src/locales/en/translation.json`
