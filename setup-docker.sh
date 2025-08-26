#!/bin/bash

# Docker镜像源配置脚本

echo "🔧 配置Docker镜像源..."

# 创建Docker配置目录
sudo mkdir -p /etc/docker

# 配置Docker镜像源
cat << EOF | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ],
  "insecure-registries": [],
  "debug": false,
  "experimental": false
}
EOF

# 重启Docker服务
echo "🔄 重启Docker服务..."
if command -v systemctl &> /dev/null; then
    sudo systemctl daemon-reload
    sudo systemctl restart docker
elif command -v service &> /dev/null; then
    sudo service docker restart
else
    echo "⚠️  请手动重启Docker服务"
fi

echo "✅ Docker镜像源配置完成！"
echo "📋 配置的镜像源:"
echo "   - 中科大镜像源: https://docker.mirrors.ustc.edu.cn"
echo "   - 网易镜像源: https://hub-mirror.c.163.com"
echo "   - 百度镜像源: https://mirror.baidubce.com"
echo "   - 腾讯云镜像源: https://ccr.ccs.tencentyun.com"

echo ""
echo "🚀 现在可以重新运行启动脚本:"
echo "   ./start.sh"
