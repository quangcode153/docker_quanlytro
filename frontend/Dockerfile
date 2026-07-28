# Bước 1: Build stage (Biên dịch dự án Vite)
FROM node:20-alpine AS build
WORKDIR /app

# Copy các file package để cài đặt dependencies trước (tận dụng Docker cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .

# Set biến môi trường để build Vite ứng dụng dùng relative path cho API
ENV VITE_API_URL=/api

# Biên dịch ứng dụng thành file tĩnh
RUN npm run build

# Bước 2: Run stage (Chạy Nginx để serve static files)
FROM nginx:alpine

# Copy thư mục build static (dist) từ stage build sang thư mục mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cổng mặc định của Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
