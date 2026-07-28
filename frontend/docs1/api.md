# 🔌 API Reference — Smart Room Rental

**Base URL:** `http://localhost:8080/api`
**Auth Header:** `Authorization: Bearer <JWT_TOKEN>`
**Response format chuẩn:** `{ "message": "...", "data": {} | [] }`

### HTTP Status Codes

| Code | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 400 | Dữ liệu không hợp lệ (validate fail) |
| 401 | Token hết hạn / chưa đăng nhập |
| 403 | Không đủ quyền / tài khoản bị khóa |
| 404 | Không tìm thấy |
| 409 | Conflict (VD: phòng đã có người thuê) |
| 500 | Lỗi server |

---

## 1. Auth — `/tai-khoan`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/tai-khoan/login` | ❌ | Đăng nhập → trả JWT |
| POST | `/tai-khoan/register` | ❌ | Đăng ký tài khoản |
| GET | `/tai-khoan/me` | ✅ Any | Profile của user hiện tại |
| GET | `/tai-khoan/chu-tro` | ❌ | Danh sách chủ trọ (trang tìm phòng) |
| GET | `/tai-khoan/admin` | ✅ User | Thông tin Admin (dùng cho chat CSKH) |
| GET | `/tai-khoan/admin/danh-sach-tai-khoan` | ✅ Admin | Toàn bộ tài khoản |
| PUT | `/tai-khoan/admin/khoa/{id}` | ✅ Admin | Khóa tài khoản |
| PUT | `/tai-khoan/admin/mo-khoa/{id}` | ✅ Admin | Mở khóa tài khoản |

---

## 2. Phòng trọ — `/phong-tro`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/phong-tro` | ✅ Landlord | Thêm phòng mới |
| PUT | `/phong-tro/{id}` | ✅ Landlord | Sửa thông tin phòng |
| PUT | `/phong-tro/{id}/trang-thai` | ✅ Landlord | Đổi trạng thái phòng |
| DELETE | `/phong-tro/{id}` | ✅ Landlord | Xóa phòng (cascade) |
| GET | `/phong-tro/search` | ❌ | API Tìm kiếm & Lọc phòng trọ cho trang chủ |
| GET | `/phong-tro/chu-tro/{id}` | ❌ | Danh sách phòng theo chủ trọ |

### 💡 Hướng dẫn Frontend ghép API `/phong-tro/search` (Tìm kiếm & Lọc)

API này dùng để thiết kế **Thanh tìm kiếm (Search Bar)** và **Bộ lọc (Filter)** bên trái/trên cùng của màn hình danh sách phòng.

**1. Cấu trúc gọi API (Tham số Query - truyền trên thanh URL):**
Tất cả các tham số đều là **Tùy chọn (Optional)**. Frontend có thể gửi 1 tham số, nhiều tham số hoặc không gửi gì cả.
- `?tenPhong=abc`: Khi user nhập từ khóa vào ô input tìm kiếm.
- `?giaToiThieu=1000000&giaToiDa=3000000`: Khi user kéo thanh slider giá, hoặc nhập min/max giá (VND).
- `?trangThai=TRONG`: Khi user tích vào checkbox trạng thái (Gửi string `"TRONG"`, `"DA_THUE"`, `"DANG_BAO_TRI"`).

*Ví dụ Axios:*
```javascript
const response = await axios.get('/api/phong-tro/search', {
  params: {
    tenPhong: searchKeyword, // vd: "Cao Cấp"
    giaToiThieu: minPrice,   // vd: 2000000
    giaToiDa: maxPrice       // vd: 5000000
  }
});
```

### 💡 Cấu trúc Dữ liệu JSON Trả về / Gửi đi (Dành cho thiết kế UI/Form)

Khi GET danh sách, hoặc khi POST/PUT để tạo/sửa phòng, Frontend sẽ làm việc với Object JSON sau. 
*(UI Note: Cần thiết kế Form thêm phòng có các Input tương ứng).*

```json
{
  "id": 1,
  "tenPhong": "Phòng Trọ Cao Cấp Số 1",   // UI: Input text (Bắt buộc)
  "giaPhong": 2500000,                    // UI: Input number, hiển thị VND (Bắt buộc)
  "giaDien": 3500,                        // UI: Input number, VND/Kwh
  "giaNuoc": 25000,                       // UI: Input number, VND/Khối
  "diaChi": "123 Nguyễn Trãi, Q5",        // UI: Input text/textarea
  "dienTich": 25.5,                       // UI: Input number (m2)
  "hinhAnh": "https://img.com/a.jpg",     // UI: Nút Upload ảnh hoặc Input URL
  "moTa": "Có gác lửng, ban công...",     // UI: Textarea
  "trangThai": "TRONG",                   // UI: Select Box (TRONG, DA_THUE, DANG_BAO_TRI)
  "chuTroId": 3                           // (Backend tự lấy từ token, Form không cần gửi)
}
```

> ⚙️ **Auto logic Backend:** Khi HĐ được duyệt (`DA_DUYET`) → phòng tự chuyển thành `Đã thuê`. Khi HĐ kết thúc → phòng tự về `Trống`.

> ⚙️ **Auto logic:** Khi HĐ được duyệt (`DA_DUYET`) → phòng tự chuyển thành `Đã thuê`. Khi HĐ kết thúc → phòng tự về `Trống`.

---

## 3. Hợp đồng — `/hop-dong`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/hop-dong` | ✅ User | Gửi yêu cầu thuê phòng |
| GET | `/hop-dong/chu-tro/{id}` | ✅ Landlord | HĐ theo chủ trọ |
| GET | `/hop-dong/khach/{id}` | ✅ User | HĐ của khách (dùng trong App.jsx polling) |
| GET | `/hop-dong/me` | ✅ User | HĐ hiệu lực hiện tại |
| PUT | `/hop-dong/{id}/trang-thai` | ✅ Landlord | Duyệt / Từ chối |

**Workflow trạng thái:** `CHO_DUYET` → `DA_DUYET` hoặc `TU_CHOI`

> ⚙️ **Race condition guard:** Service kiểm tra `existsByPhongTroIdAndTrangThai(id, CHO_DUYET)` trước khi tạo HĐ mới.

---

## 4. Hồ sơ khách thuê — `/khach-hang`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/khach-hang/ho-so/me` | ✅ User | Hồ sơ của mình |
| PUT | `/khach-hang/ho-so/me` | ✅ User | Cập nhật hồ sơ |
| GET | `/khach-hang/chi-tiet/{id}` | ✅ Landlord | Xem hồ sơ khách khi duyệt HĐ |

---

## 5. Điện nước — `/dien-nuoc`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/dien-nuoc/chot-so` | ✅ Landlord | Nhập chỉ số → tạo hóa đơn tự động |
| GET | `/dien-nuoc/hop-dong/{id}` | ✅ Landlord/User | Lịch sử chỉ số theo HĐ |

**Request body `chot-so`:**
```json
{
  "hopDongId": 1,
  "thang": 5,
  "nam": 2025,
  "chiSoDauDien": 100,
  "chiSoCuoiDien": 145,
  "chiSoDauNuoc": 50,
  "chiSoCuoiNuoc": 58
}
```

---

## 6. Hóa đơn — `/hoa-don`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/hoa-don/me` | ✅ User | Danh sách hóa đơn của khách |
| GET | `/hoa-don/hop-dong/{id}` | ✅ Landlord | Hóa đơn theo HĐ |
| PUT | `/hoa-don/{id}/thanh-toan` | ✅ Landlord | Đánh dấu đã thanh toán |

---

## 7. Tin nhắn — `/tin-nhan`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/tin-nhan/{userId1}/{userId2}` | ✅ Any | Lịch sử chat giữa 2 người |

**Gửi tin:** WebSocket STOMP `→ /app/chat.send`
**Nhận tin:** Subscribe `/topic/chat/{userId}`

---

## 8. Khiếu nại — `/khieu-nai`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/khieu-nai` | ✅ Any | Gửi khiếu nại (người gửi lấy từ JWT) |
| GET | `/khieu-nai` | ✅ Admin | Toàn bộ khiếu nại |
| PUT | `/khieu-nai/{id}/xu-ly` | ✅ Admin | Đánh dấu đã giải quyết |

---

## 9. Thông báo — `/thong-bao`

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/thong-bao` | ✅ Landlord | Đăng thông báo mới |
| GET | `/thong-bao/chu-tro/{id}` | ✅ User | Thông báo từ chủ trọ (bảng tin) |
