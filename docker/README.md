# 🐳 Docker Configuration Directory

Thư mục này chứa các cấu hình liên quan đến Docker cho dự án, bao gồm:

- Cấu hình chạy thử nghiệm cục bộ với Docker Compose.
- Các thiết lập cho môi trường Database (PostgreSQL).
- Cấu hình Nginx (nếu cần thiết cho Frontend/Reverse Proxy).
- Các scripts hỗ trợ build và deploy.

## Kế hoạch triển khai Docker:

1. **Frontend Dockerfile**: Tạo Dockerfile cho Frontend (sử dụng Node.js để build và Nginx để serve static files).
2. **Docker Compose**: Tạo file `docker-compose.yml` ở thư mục gốc để liên kết:
   - `db`: Container PostgreSQL làm cơ sở dữ liệu.
   - `backend`: Container Spring Boot kết nối với container `db`.
   - `frontend`: Container Vite/Nginx kết nối với container `backend`.
3. **Environment Variables**: Thiết lập các biến môi trường để chạy mượt mà giữa các container.
