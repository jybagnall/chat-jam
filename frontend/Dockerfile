# 1) build
# Base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
# RUN npm install --legacy-peer-deps
RUN npm ci

# Copy all files
COPY . . 

# Run Vite server
RUN npm run build

# 2) Production 서버 (Nginx + 프록시 설정)
FROM nginx:alpine

# 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 설정 파일 복사
# Nginx 프록시 + SPA 라우팅 설정 작성
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80