# 使用官方 Node.js 作为基础镜像
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 使用 nginx 作为生产环境服务器
FROM nginx:alpine

# 复制构建后的文件到 nginx 目录
COPY --from=builder /app/build /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
