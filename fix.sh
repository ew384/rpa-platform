#!/bin/bash

# 修复Docker卷挂载问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 创建必要的目录
create_directories() {
    print_message $BLUE "📁 创建必要的数据目录..."
    
    local dirs=(
        "data"
        "data/postgres"
        "data/redis"
        "data/prometheus"
        "data/elasticsearch"
        "data/traefik"
        "logs"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_message $GREEN "✅ 创建目录: $dir"
        else
            print_message $YELLOW "⚠️  目录已存在: $dir"
        fi
    done
    
    # 设置正确的权限
    chmod 755 data
    chmod 755 data/*
    chmod 755 logs
    
    print_message $GREEN "🎉 目录创建完成！"
}

# 创建简化的docker-compose.yml
create_simple_compose() {
    print_message $BLUE "📝 创建简化的docker-compose.yml..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # 前端应用服务
  flow-rpa-web:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: flow-rpa-platform
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - REACT_APP_NAME=龙行RPA平台
      - REACT_APP_VERSION=1.0.0
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - rpa-network
    
    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

# 网络配置
networks:
  rpa-network:
    driver: bridge

# 如果需要数据库，取消下面的注释
# volumes:
#   postgres_data:
EOF

    print_message $GREEN "✅ 已创建简化的docker-compose.yml"
}

# 创建完整的docker-compose.yml（带数据库）
create_full_compose() {
    print_message $BLUE "📝 创建完整的docker-compose.yml（包含数据库）..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # 前端应用服务
  flow-rpa-web:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: flow-rpa-platform
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - REACT_APP_NAME=龙行RPA平台
      - REACT_APP_VERSION=1.0.0
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - rpa-network
    depends_on:
      - database
      - redis
    
    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Redis缓存服务
  redis:
    image: redis:7-alpine
    container_name: flow-rpa-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - rpa-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 5s
      retries: 3

  # PostgreSQL数据库服务
  database:
    image: postgres:15-alpine
    container_name: flow-rpa-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: rpa_platform
      POSTGRES_USER: rpa_user
      POSTGRES_PASSWORD: rpa_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rpa-network
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rpa_user -d rpa_platform"]
      interval: 30s
      timeout: 5s
      retries: 3

# 网络配置
networks:
  rpa-network:
    driver: bridge

# 数据卷配置（使用Docker管理的卷）
volumes:
  postgres_data:
  redis_data:
EOF

    print_message $GREEN "✅ 已创建完整的docker-compose.yml"
}

# 清理Docker资源
cleanup_docker() {
    print_message $BLUE "🧹 清理Docker资源..."
    
    # 停止并删除容器
    docker-compose down -v 2>/dev/null || true
    
    # 删除相关镜像
    docker rmi flow-rpa-platform 2>/dev/null || true
    docker rmi rpa-platform_flow-rpa-web 2>/dev/null || true
    
    # 清理未使用的卷
    docker volume prune -f 2>/dev/null || true
    
    print_message $GREEN "✅ Docker资源清理完成"
}

# 测试Docker启动
test_docker() {
    print_message $BLUE "🧪 测试Docker启动..."
    
    if docker-compose up -d; then
        print_message $GREEN "✅ Docker启动成功！"
        print_message $BLUE "📊 查看容器状态:"
        docker-compose ps
        print_message $BLUE "🌐 应用访问地址: http://localhost"
    else
        print_message $RED "❌ Docker启动失败"
        return 1
    fi
}

# 显示帮助
show_help() {
    cat << EOF
🐳 Docker卷挂载修复工具

使用方法: $0 [选项]

选项:
  simple    创建简化版本（仅前端应用）
  full      创建完整版本（包含数据库）
  clean     清理Docker资源
  test      测试Docker启动
  help      显示帮助信息

示例:
  $0 simple  # 创建简化版本
  $0 full    # 创建完整版本
  $0 clean   # 清理资源

EOF
}

# 主函数
main() {
    print_message $BLUE "🐳 Docker卷挂载修复工具"
    echo ""
    
    local action=${1:-simple}
    
    case $action in
        "simple")
            create_directories
            create_simple_compose
            print_message $GREEN "🎉 简化版本配置完成！"
            print_message $BLUE "💡 现在可以运行: docker-compose up --build"
            ;;
        "full")
            create_directories
            create_full_compose
            print_message $GREEN "🎉 完整版本配置完成！"
            print_message $BLUE "💡 现在可以运行: docker-compose up --build"
            ;;
        "clean")
            cleanup_docker
            ;;
        "test")
            test_docker
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_message $RED "❌ 未知选项: $action"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"