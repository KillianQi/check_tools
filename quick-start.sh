#!/bin/bash

# 服务器批量巡检工具 - 快速启动脚本

set -e

echo "🚀 服务器批量巡检工具 - 快速启动"
echo "=================================="

# 检查系统环境
check_environment() {
    echo "🔍 检查系统环境..."
    
    # 检查Python
    if command -v python3 &> /dev/null; then
        python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
        echo "✅ Python: $python_version"
    else
        echo "❌ Python3 未安装"
        return 1
    fi
    
    # 检查Docker
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        echo "✅ Docker: $(docker --version)"
        echo "✅ Docker Compose: $(docker-compose --version)"
        DOCKER_AVAILABLE=true
    else
        echo "⚠️  Docker 未安装或不可用"
        DOCKER_AVAILABLE=false
    fi
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        echo "✅ Node.js: $(node --version)"
        NODE_AVAILABLE=true
    else
        echo "⚠️  Node.js 未安装"
        NODE_AVAILABLE=false
    fi
}

# 显示部署选项
show_options() {
    echo ""
    echo "📋 请选择部署方式:"
    echo "1) Docker部署 (推荐) - 一键部署，包含所有依赖"
    echo "2) 本地部署 - 手动安装依赖，适合开发环境"
    echo "3) 仅后端 - 只启动后端API服务"
    echo "4) 配置Docker镜像源 - 解决镜像拉取问题"
    echo "5) 退出"
    echo ""
}

# Docker部署
docker_deploy() {
    echo "🐳 使用Docker部署..."
    
    # 检查Docker镜像源问题
    echo "🔍 检查Docker镜像源..."
    if ! docker pull hello-world:latest &> /dev/null; then
        echo "⚠️  Docker镜像拉取失败，可能需要配置镜像源"
        echo "   运行: ./setup-docker.sh"
        return 1
    fi
    
    # 清理旧容器
    echo "🧹 清理旧容器..."
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # 构建并启动
    echo "🔨 构建并启动容器..."
    docker-compose up --build -d
    
    echo "✅ Docker部署完成！"
    echo "📱 Web界面: http://localhost:3000"
    echo "🔧 API接口: http://localhost:8000"
    echo "📊 监控面板: http://localhost"
}

# 本地部署
local_deploy() {
    echo "🔧 本地部署..."
    
    # 安装Python依赖
    echo "📦 安装Python依赖..."
    pip3 install -r requirements.txt
    
    # 启动后端
    echo "🚀 启动后端服务..."
    python3 server/main.py &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    
    echo "✅ 本地部署完成！"
    echo "🔧 API接口: http://localhost:8000"
    echo "📋 管理命令:"
    echo "  停止服务: kill $BACKEND_PID"
    echo "  查看日志: tail -f logs/*.log"
}

# 仅后端部署
backend_only() {
    echo "🔧 仅启动后端服务..."
    
    # 安装Python依赖
    echo "📦 安装Python依赖..."
    pip3 install -r requirements.txt
    
    # 启动后端
    echo "🚀 启动后端服务..."
    python3 server/main.py
}

# 配置Docker镜像源
setup_docker_mirrors() {
    echo "🔧 配置Docker镜像源..."
    ./setup-docker.sh
}

# 主函数
main() {
    check_environment
    
    while true; do
        show_options
        read -p "请输入选项 (1-5): " choice
        
        case $choice in
            1)
                if [ "$DOCKER_AVAILABLE" = true ]; then
                    docker_deploy
                    break
                else
                    echo "❌ Docker不可用，请选择其他选项"
                fi
                ;;
            2)
                local_deploy
                break
                ;;
            3)
                backend_only
                break
                ;;
            4)
                setup_docker_mirrors
                ;;
            5)
                echo "👋 退出"
                exit 0
                ;;
            *)
                echo "❌ 无效选项，请重新选择"
                ;;
        esac
    done
    
    echo ""
    echo "🎉 部署完成！"
    echo "📖 查看文档: 访问Web界面的'文档'页面"
    echo "💡 使用帮助: python3 cli.py --help"
}

# 运行主函数
main
