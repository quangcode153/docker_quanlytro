# 🧠 Decisions — Quyết định Thiết kế (ADR)

> Ghi lại **lý do** đằng sau mọi lựa chọn kỹ thuật.
> Trước khi thay đổi bất kỳ mục nào, hãy đọc phần "Trade-off" để tránh phá vỡ hệ thống.

---

## 1. JWT Stateless (không dùng Session)

**Quyết định:** Dùng JWT lưu localStorage, không dùng server-side session.

**Lý do:**
- Stateless → dễ scale ngang (horizontal), không tốn RAM server lưu session
- Axios Interceptor đọc token từ localStorage dễ dàng, không cần cookie

**Trade-off:**
- Token không thể revoke ngay lập tức (chỉ hết hạn sau `exp`)
- Hiện tại không có Refresh Token — nếu token hết hạn, user phải login lại

**Hướng mở rộng:** Thêm Refresh Token + Blacklist (Redis) khi cần security cao hơn.

---

## 2. DTO bắt buộc — Không expose Entity

**Quyết định:** Mọi API response/request đều dùng DTO, không bao giờ trả Entity trực tiếp.

**Lý do:**
- Entity chứa `password_hash` và các field nhạy cảm
- Quan hệ JPA 2 chiều gây `StackOverflowError` khi serialize JSON (Circular Reference)
- Thay đổi DB schema không ảnh hưởng API contract

**Quy tắc:** Thêm field mới vào Entity → thêm vào DTO → cập nhật Mapper. Không shortcut.

---

## 3. BigDecimal cho tiền tệ và chỉ số

**Quyết định:** Mọi field liên quan đến tiền, giá, chỉ số điện nước đều dùng `BigDecimal`.

**Lý do:**
- `double` có sai số dấu phẩy động: `0.1 + 0.2 = 0.30000000000000004`
- Với hóa đơn tiền điện, sai số dù 1 đồng cũng không chấp nhận được

**Quy tắc:** Không bao giờ dùng `double` hoặc `float` cho tiền tệ. Không ngoại lệ.

---

## 4. @MapsId cho quan hệ TaiKhoan ↔ KhachThue

**Quyết định:** `KhachThue` dùng `@MapsId` để chia sẻ PK với `TaiKhoan`.

**Lý do:**
- Tránh sinh ID thừa (không cần cột `id` riêng trong `khach_thue`)
- Simplify join query: `JOIN khach_thue kh ON kh.id = tk.id`

---

## 5. Enum tiếng Anh không dấu (BE Source of Truth)

**Quyết định:** Backend Enum dùng ASCII không dấu (`TRONG`, `DA_THUE`, `CHO_DUYET`).

**Lý do:**
- Tránh lỗi encoding khi lưu vào MySQL (charset mismatch)
- Tránh lỗi so sánh chuỗi trên các hệ điều hành khác nhau

**Trade-off hiện tại:** FE vẫn còn một số chỗ hardcode tiếng Việt có dấu thay vì dùng `constants.js` → cần audit.

---

## 6. Optimistic UI cho Chat

**Quyết định:** Tin nhắn hiện ngay trên UI (opacity thấp) trước khi server xác nhận.

**Lý do:** Cải thiện UX đáng kể, đặc biệt khi mạng chậm. Nếu server fail, tin nhắn sẽ bị rollback.

**Chống duplicate:** So sánh `msg.id` hoặc cặp `(noiDung + thoiGian)` trước khi append vào state.

---

## 7. Lazy Loading cho React Pages

**Quyết định:** Dùng `React.lazy()` + `<Suspense>` cho tất cả page components.

**Lý do:**
- Pages (AdminPage, LandlordPage...) không nên load ở màn `/login`
- Giảm initial bundle size, cải thiện TTI (Time to Interactive)

---

## 8. Polling thay vì WebSocket cho trạng thái HĐ

**Quyết định:** `App.jsx` dùng `setInterval` mỗi 10s để kiểm tra trạng thái HĐ của ROLE_USER.

**Lý do:**
- Đơn giản, không cần thêm WebSocket channel mới
- 10s là trade-off chấp nhận được (UX tốt, không tốn quá nhiều request)

**Hướng nâng cấp:** Thay bằng WebSocket push notification khi implement module Notification.
