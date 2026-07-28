# Thông Tin Kết Nối Cơ Sở Dữ Liệu MySQL (Clever Cloud)

Tài liệu này lưu trữ các thông số kết nối của Database MySQL trực tuyến được tạo trên dịch vụ Clever Cloud để phục vụ dự án `quan_ly_phong_tro`.

---

## 🔑 Thông số kết nối chi tiết

| Thông số | Giá trị |
| :--- | :--- |
| **Hệ quản trị CSDL** | MySQL (Phiên bản 8.0) |
| **Host** | `bqqb4uoiexfwj136jwlj-mysql.services.clever-cloud.com` |
| **Port** | `3306` |
| **Database Name** | `bqqb4uoiexfwj136jwlj` |
| **Username** | `utbctfsznkcuuf2` |
| **Password** | `IwDljZootbFfujOd3NOY` |

---

## 🔗 Chuỗi kết nối (Connection Strings)

### 1. Connection URI (Dùng cho các công cụ như DBeaver, MySQL Workbench)
```text
mysql://utbctfsznkcuuf2:IwDljZootbFfujOd3NOY@bqqb4uoiexfwj136jwlj-mysql.services.clever-cloud.com:3306/bqqb4uoiexfwj136jwlj
```

### 2. Spring Boot Datasource URL (Dùng cho application.properties)
```properties
spring.datasource.url=jdbc:mysql://bqqb4uoiexfwj136jwlj-mysql.services.clever-cloud.com:3306/bqqb4uoiexfwj136jwlj?autoReconnect=true&useSSL=false&allowPublicKeyRetrieval=true&characterEncoding=utf8
```

---

> [!WARNING]
> Không chia sẻ file này hoặc mật khẩu này lên GitHub công khai để tránh bị kẻ xấu quét dữ liệu hoặc tấn công phá hoại Database.
