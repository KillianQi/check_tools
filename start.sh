#!/bin/bash

# 服务器批量巡检工具启动脚本

set -e

echo "🚀 服务器批量巡检工具启动中..."

# 检查Python版本
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ 错误: 需要Python 3.8或更高版本，当前版本: $python_version"
    exit 1
fi

echo "✅ Python版本检查通过: $python_version"

# 检查Node.js版本
if command -v node &> /dev/null; then
    node_version=$(node --version | cut -d'v' -f2 | cut -d. -f1,2)
    required_node_version="16.0"
    
    if [ "$(printf '%s\n' "$required_node_version" "$node_version" | sort -V | head -n1)" != "$required_node_version" ]; then
        echo "❌ 错误: 需要Node.js 16.0或更高版本，当前版本: $node_version"
        exit 1
    fi
    
    echo "✅ Node.js版本检查通过: $node_version"
else
    echo "⚠️  警告: 未检测到Node.js，将跳过前端构建"
fi

# 检查Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker和Docker Compose已安装"
    USE_DOCKER=true
else
    echo "⚠️  Docker未安装，将使用本地部署模式"
    USE_DOCKER=false
fi

# 创建必要的目录
mkdir -p logs
mkdir -p frontend/build

# 选择部署模式
if [ "$USE_DOCKER" = true ]; then
    echo "🐳 使用Docker Compose部署..."
    
    # 构建并启动Docker容器
    docker-compose up --build -d
    
    echo "✅ 服务启动完成！"
    echo "📱 Web界面: http://localhost:3000"
    echo "🔧 API接口: http://localhost:8000"
    echo "📊 监控面板: http://localhost"
    
    echo ""
    echo "📋 常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    
else
    echo "🔧 使用本地部署模式..."
    
    # 安装Python依赖
    echo "📦 安装Python依赖..."
    pip3 install -r requirements.txt
    
    # 安装前端依赖并构建
    if command -v npm &> /dev/null; then
        echo "📦 安装前端依赖..."
        cd frontend
        npm install
        
        echo "🔨 构建前端应用..."
        npm run build
        cd ..
    fi
    
    # 启动后端服务
    echo "🚀 启动后端服务..."
    python3 server/main.py &
    BACKEND_PID=$!
    
    echo "✅ 服务启动完成！"
    echo "🔧 API接口: http://localhost:8000"
    
    if [ -d "frontend/build" ]; then
        echo "📱 前端文件已构建到 frontend/build/"
    fi
    
    echo ""
    echo "📋 管理命令:"
    echo "  停止后端: kill $BACKEND_PID"
    echo "  查看日志: tail -f logs/*.log"
    
    # 保存PID到文件
    echo $BACKEND_PID > .backend.pid
fi

echo ""
echo "🎉 服务器批量巡检工具启动成功！"
echo "📖 查看文档: 访问Web界面的'文档'页面"
echo "💡 使用帮助: python3 cli.py --help"
