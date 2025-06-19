#!/bin/bash

# 虎步RPA平台启动脚本
# 使用方法: ./start.sh [选项]
# 选项:
#   dev     - 开发模式
#   build   - 构建生产版本
#   docker  - Docker容器模式
#   help    - 显示帮助信息

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查Node.js和npm是否安装
check_prerequisites() {
    print_message $BLUE "🔍 检查系统环境..."
    
    if ! command -v node &> /dev/null; then
        print_message $RED "❌ Node.js 未安装。请先安装Node.js (推荐版本 >= 16.0.0)"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_message $RED "❌ npm 未安装。请先安装npm"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    local npm_version=$(npm --version)
    
    print_message $GREEN "✅ Node.js 版本: v$node_version"
    print_message $GREEN "✅ npm 版本: $npm_version"
}

# 安装依赖
install_dependencies() {
    print_message $BLUE "📦 安装项目依赖..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_message $GREEN "✅ 依赖安装完成"
    else
        print_message $YELLOW "⚠️  node_modules 已存在，跳过安装。如需重新安装，请删除 node_modules 文件夹"
    fi
}

# 开发模式
start_dev() {
    print_message $BLUE "🚀 启动开发服务器..."
    print_message $YELLOW "📝 开发服务器将在 http://localhost:3210 启动"
    print_message $YELLOW "📝 测试账号: admin/admin 或 user/user"
    
    # 设置环境变量
    export BROWSER=none  # 阻止自动打开浏览器
    export GENERATE_SOURCEMAP=true
    
    npm start
}

# 构建生产版本
build_production() {
    print_message $BLUE "🏗️  构建生产版本..."
    
    # 清理之前的构建
    if [ -d "build" ]; then
        rm -rf build
        print_message $YELLOW "🧹 清理旧的构建文件"
    fi
    
    # 设置生产环境变量
    export NODE_ENV=production
    export GENERATE_SOURCEMAP=false
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ 构建完成！构建文件位于 ./build 目录"
        print_message $BLUE "💡 您可以使用以下命令预览生产版本:"
        print_message $BLUE "   npm run preview"
    else
        print_message $RED "❌ 构建失败"
        exit 1
    fi
}

# Docker模式
start_docker() {
    print_message $BLUE "🐳 启动Docker容器..."
    
    # 检查Docker是否安装
    if ! command -v docker &> /dev/null; then
        print_message $RED "❌ Docker 未安装。请先安装Docker"
        exit 1
    fi
    
    # 检查docker-compose是否安装
    if ! command -v docker compose &> /dev/null; then
        print_message $RED "❌ docker-compose 未安装。请先安装docker-compose"
        exit 1
    fi
    
    print_message $YELLOW "📝 正在构建Docker镜像..."
    docker compose up --build -d
    
    if [ $? -eq 0 ]; then
        print_message $GREEN "✅ Docker容器启动成功！"
        print_message $BLUE "🌐 应用已在 http://localhost 启动"
        print_message $BLUE "📊 查看容器状态: docker-compose ps"
        print_message $BLUE "📋 查看日志: docker-compose logs -f"
        print_message $BLUE "⏹️  停止容器: docker-compose down"
    else
        print_message $RED "❌ Docker容器启动失败"
        exit 1
    fi
}

# 预览生产版本
preview_production() {
    print_message $BLUE "👀 预览生产版本..."
    
    if [ ! -d "build" ]; then
        print_message $YELLOW "⚠️  未找到构建文件，正在构建..."
        build_production
    fi
    
    # 检查serve是否安装
    if ! command -v npx &> /dev/null; then
        print_message $RED "❌ npx 未找到"
        exit 1
    fi
    
    print_message $GREEN "🌐 预览服务器将在 http://localhost:3210 启动"
    npx serve -s build -l 3210
}

# 清理项目
clean_project() {
    print_message $BLUE "🧹 清理项目文件..."
    
    # 清理构建文件
    if [ -d "build" ]; then
        rm -rf build
        print_message $GREEN "✅ 已删除 build 目录"
    fi
    
    # 清理依赖
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_message $GREEN "✅ 已删除 node_modules 目录"
    fi
    
    # 清理日志文件
    if [ -d "logs" ]; then
        rm -rf logs
        print_message $GREEN "✅ 已删除 logs 目录"
    fi
    
    print_message $GREEN "🎉 项目清理完成！"
}

# 显示帮助信息
show_help() {
    cat << EOF
🐅 虎步RPA平台启动脚本

使用方法: $0 [选项]

选项:
  dev       启动开发服务器 (默认端口: 3210)
  build     构建生产版本
  preview   预览生产版本
  docker    使用Docker启动 (端口: 80)
  clean     清理项目文件
  help      显示此帮助信息

示例:
  $0 dev      # 开发模式
  $0 build    # 构建生产版本
  $0 docker   # Docker模式

环境要求:
  - Node.js >= 16.0.0
  - npm >= 8.0.0
  - Docker (可选，用于容器化部署)

测试账号:
  - 管理员: admin/admin
  - 普通用户: user/user

访问地址:
  - 开发模式: http://localhost:3210
  - Docker模式: http://localhost

EOF
}

# 显示系统信息
show_system_info() {
    print_message $BLUE "📋 系统信息:"
    echo "操作系统: $(uname -s)"
    echo "架构: $(uname -m)"
    if command -v node &> /dev/null; then
        echo "Node.js: $(node --version)"
    fi
    if command -v npm &> /dev/null; then
        echo "npm: $(npm --version)"
    fi
    if command -v docker &> /dev/null; then
        echo "Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    fi
    echo ""
}

# 主函数
main() {
    # 显示欢迎信息
    cat << "EOF"
    
           RPA - 电商自动化管理平台
           
EOF

    show_system_info
    
    # 检查参数
    if [ $# -eq 0 ]; then
        print_message $YELLOW "⚠️  未指定操作模式，启动开发服务器..."
        echo ""
        MODE="dev"
    else
        MODE=$1
    fi
    
    # 根据参数执行相应操作
    case $MODE in
        "dev"|"development")
            check_prerequisites
            install_dependencies
            start_dev
            ;;
        "build"|"production")
            check_prerequisites
            install_dependencies
            build_production
            ;;
        "preview"|"serve")
            preview_production
            ;;
        "docker"|"container")
            start_docker
            ;;
        "clean"|"clear")
            clean_project
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_message $RED "❌ 未知的选项: $MODE"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 捕获中断信号
trap 'print_message $YELLOW "\n⚠️  操作被用户中断"; exit 130' INT

# 运行主函数
main "$@"
