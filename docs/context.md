# 🧠 Project Context — Smart Room Rental

> File này là "bộ nhớ dài hạn" của dự án.
> AI hoặc dev mới đọc file này trước tiên để nắm toàn cảnh.

---

## 📌 Source of Truth (Nguồn Chuẩn)

> **Quy tắc vàng:** Backend Enum là nguồn chuẩn duy nhất. Frontend `constants.js` BẮT BUỘC map theo Backend — không làm ngược lại.

| Nguồn | Mô tả |
|---|---|
| `src/constants.js` (FE) | Map từ Backend Enum — đây là file duy nhất chứa constant |
| Entity JPA (BE) | Định nghĩa schema DB — không sửa trực tiếp DB ngoài migration |
| `api.js` (FE) | Axios singleton duy nhất — mọi request đi qua đây |

### Enum chuẩn (Backend → Frontend mapping)

```js
// CONTRACT_STATUS
CHO_DUYET  → 'CHỜ_DUYỆT'
DA_DUYET   → 'ĐÃ_DUYỆT'
TU_CHOI    → 'TỪ_CHỐI'

// ROOM_STATUS  
TRONG      → 'Trống'
DA_THUE    → 'Đã thuê'
BAO_TRI    → 'Đang bảo trì'
```

> ⚠️ **Lỗi hay gặp:** FE vẫn còn chỗ hardcode tiếng Việt có dấu (`'Trống'`) thay vì dùng `ROOM_STATUS.EMPTY` từ `constants.js`. Cần audit toàn bộ.

---

## 🏗️ Tech Stack

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| Backend | Java 17 + Spring Boot 3 | RESTful API |
| ORM | JPA/Hibernate | Lazy loading, @MapsId |
| Security | Spring Security + JWT | Stateless, check isLocked tại Filter |
| Database | MySQL 8 | BigDecimal cho tiền tệ |
| Frontend | React 18 (Vite) | Lazy loading pages |
| HTTP Client | Axios | Singleton + Interceptor |
| Realtime | SockJS + STOMP | WebSocket chat |
| Auth Storage | localStorage | Không dùng Cookie, không có Refresh Token |

---

## ⚠️ Assumptions (Giả định hệ thống)

> Những điều AI / dev KHÔNG được thay đổi trừ khi có thảo luận rõ ràng.

1. **JWT lưu localStorage** — không dùng Cookie, không có Refresh Token (thêm sau nếu cần)
2. **Axios instance là singleton** — khởi tạo 1 lần duy nhất trong `api.js`, không tạo thêm instance mới
3. **BigDecimal bắt buộc** cho mọi field tiền tệ và chỉ số điện nước
4. **DTO bắt buộc** — không bao giờ expose Entity trực tiếp ra API response
5. **Backend Enum là chuẩn** — FE chỉ được đọc/map, không tự định nghĩa giá trị mới
6. **@Transactional** cho mọi thao tác ghi có nhiều bước (tránh partial update)

---

## 📊 Trạng thái hiện tại (Snapshot)

| Module | % | Trạng thái | Ghi chú |
|---|---|---|---|
| Auth + JWT | 100% | ✅ | Login, Register, Role-based |
| Phân quyền UI | 100% | ✅ | ProtectedRoute, lazy load pages |
| CRUD Phòng trọ | 100% | ✅ | Auto-đổi trạng thái khi duyệt HĐ |
| Hợp đồng | 100% | ✅ | Race condition đã xử lý |
| Chat Realtime | 100% | ✅ | Optimistic UI, chống duplicate |
| Hồ sơ cá nhân | 100% | ✅ | Validate trước khi thuê phòng |
| Khiếu nại | 100% | ✅ | Admin đánh dấu đã xử lý |
| Quản lý Users | 100% | ✅ | Khóa/mở khóa tài khoản |
| UI/UX nâng cấp | 100% | ✅ | Design system, inline styles |
| Điện nước BE | 80% | 🔄 | Service + API xong, cần test |
| Điện nước FE | 0% | 🚧 | Chưa có UI form nhập chỉ số |
| Hóa đơn FE | 0% | 🚧 | Chưa có trang xem hóa đơn |
| Dashboard | 0% | ⏭️ | Chưa bắt đầu |
| Notification | 0% | ⏭️ | Chưa bắt đầu |

---

## 🐛 Known Issues

| # | Mức độ | Vấn đề | Trạng thái |
|---|---|---|---|
| 1 | 🔴 High | Token mất sau reload F5 (Interceptor race condition) | Đang điều tra |
| 2 | 🟡 Medium | Còn chỗ hardcode enum tiếng Việt thay vì dùng constants | Cần audit |
| 3 | 🟡 Medium | ID ở bảng Chat/Điện nước dùng `Integer` thay vì `Long` | Ghi nhận |
| 4 | 🟢 Low | `alert()` thô sơ — cần thay bằng toast notification | Backlog |
