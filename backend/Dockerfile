# Bước 1: Build stage (Biên dịch dự án Java)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy toàn bộ mã nguồn của thư mục backend vào container
COPY . .

# Biên dịch dự án thành file .jar (bỏ qua chạy test để build nhanh hơn)
RUN mvn clean package -DskipTests

# Bước 2: Run stage (Chạy ứng dụng bằng JRE nhẹ)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy file .jar đã được biên dịch từ stage build sang stage chạy
COPY --from=build /app/target/*.jar app.jar

# Cấu hình cổng port chạy ứng dụng
EXPOSE 8080

# Câu lệnh khởi chạy ứng dụng Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
