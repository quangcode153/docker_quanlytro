# 🏗️ Architecture — Smart Room Rental

---

## Luồng Request (Full Stack)

```
User Action (React Component)
    │
    ▼
AuthContext.check() → Có quyền không?
    │
    ▼
Axios Instance (api.js)
    │
    ├── Request Interceptor: đọc localStorage → gắn Authorization: Bearer <token>
    │
    ▼
Spring Security Filter
    ├── JwtAuthenticationFilter: giải mã token → lấy userId + role
    └── isAccountNonLocked() → nếu bị khóa → 403 ngay
    │
    ▼
Controller → validate DTO (@Valid)
    │
    ▼
Service → xử lý nghiệp vụ, @Transactional
    │
    ▼
Repository → JPA query, tối ưu N+1
    │
    ▼
MySQL Database
    │
    ▼  (response ngược lại)
DTO → JSON → Axios → React State → Re-render UI
```

---

## Backend Layers

| Layer | Trách nhiệm | Quy tắc |
|---|---|---|
| **Controller** | Nhận request, validate DTO, trả response | Không chứa logic nghiệp vụ |
| **DTO** | Shape dữ liệu vào/ra | Không bao giờ expose Entity trực tiếp |
| **Service** | Logic nghiệp vụ, tính toán, orchestration | @Transactional cho thao tác ghi phức tạp |
| **Repository** | JPA query, custom JPQL | Dùng Projection để tránh N+1 |
| **Entity** | Mapping DB table, quan hệ JPA | Không sửa trực tiếp, dùng migration |

---

## Authentication Flow

```
1. POST /api/tai-khoan/login { username, password }
2. Spring Security xác thực UserDetailsService
3. Kiểm tra is_locked → 403 nếu bị khóa
4. Tạo JWT (payload: userId, role, exp)
5. Trả { token } về FE
6. FE: localStorage.setItem('token', token)
7. FE: GET /api/tai-khoan/me → lấy full user object
8. FE: AuthContext.loginSuccess(token, userData) → cập nhật global state
9. Mọi request sau: Interceptor tự gắn Authorization: Bearer <token>
```

> ⚠️ **Known Issue #1:** Interceptor đọc từ localStorage đồng bộ, nhưng React state (user) load bất đồng bộ. Nếu component render trước khi fetchMe() hoàn thành → request gửi đi không có token.
> **Hướng fix:** Dùng `isLoadingAuth` làm gate — không render AppContent cho đến khi `isLoadingAuth === false`.

---

## WebSocket / Chat Flow

```
1. ChatBox mount: khởi tạo SockJS → /ws
2. STOMP handshake thành công → setIsConnected(true)
3. Subscribe: /topic/chat/{currentUserId}
4. Gửi: STOMP publish → /app/chat.send { nguoiGuiId, nguoiNhanId, noiDung }
5. Backend broadcast → /topic/chat/{nguoiNhanId}
6. FE nhận → kiểm tra duplicate (id hoặc noiDung+thoiGian) → append
7. Optimistic UI: tin nhắn hiện ngay (opacity 0.65) trước khi server xác nhận
```

---

## Database Schema

```
tai_khoan (id PK, username, password_hash, role, is_locked)
    │
    ├── (1:1) khach_thue (ho_ten, so_cccd, sdt, email, dia_chi)
    │         @MapsId → dùng chung PK với tai_khoan
    │
    └── (1:N) phong_tro (ten_phong, gia_phong[BigDecimal], trang_thai)
                  │
                  └── (1:N) hop_dong (khach_id, ngay_bat_dau, trang_thai, tien_coc[BigDecimal])
                                │
                                └── (1:N) chi_so_dien_nuoc (thang, nam, chi_so_dau, chi_so_cuoi)
                                              │
                                              └── (1:1) hoa_don (tien_dien, tien_nuoc, tong[BigDecimal], trang_thai_tt)

tin_nhan (id, nguoi_gui_id, nguoi_nhan_id, noi_dung, thoi_gian)
khieu_nai (id, nguoi_gui_id, tieu_de, noi_dung, trang_thai)
thong_bao (id, chu_tro_id, tieu_de, noi_dung, ngay_dang)
```

### Quan hệ chính

| Quan hệ | Kiểu | Ghi chú |
|---|---|---|
| `tai_khoan` ↔ `khach_thue` | OneToOne @MapsId | Chung PK, không sinh ID thừa |
| `phong_tro` → `tai_khoan` | ManyToOne | chuTroId |
| `hop_dong` → `phong_tro` | ManyToOne | |
| `hop_dong` → `khach_thue` | ManyToOne | |
| `chi_so` → `hop_dong` | ManyToOne | |
| `hoa_don` ↔ `chi_so` | OneToOne | |

---

## Design Patterns

| Pattern | Ứng dụng |
|---|---|
| MVC | Cấu trúc tổng thể BE |
| DTO | Tách schema DB khỏi API contract, bảo mật |
| Repository | Tách query logic khỏi business logic |
| Singleton | Spring Beans, Axios instance |
| Optimistic UI | Chat — hiện tin nhắn ngay mà không chờ server |
| Lazy Loading | React pages — chỉ tải sau khi đăng nhập |
