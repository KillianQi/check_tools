# 服务器批量巡检工具

一个功能强大的服务器批量巡检工具，支持可视化界面和命令行两种使用方式。

## 功能特性

- 🔍 **批量巡检**: 支持同时巡检多台服务器
- 🖥️ **可视化界面**: 现代化的Web界面，实时显示巡检结果
- 💻 **命令行工具**: 支持命令行方式使用，便于自动化集成
- 🎯 **自定义巡检**: 可选择巡检内容，包括但不限于：
  - 操作系统版本和发行版本
  - 系统运行时间
  - CPU和内存使用率
  - 存储使用情况（区分根盘和数据盘）
  - 网络信息（VIP、网卡、bond等）
- 🐳 **Docker部署**: 支持Docker Compose一键部署
- 🔧 **跨平台**: 支持Windows、Linux、macOS

## 快速开始

### 方式一：一键启动（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd check_tools

# 运行快速启动脚本
./quick-start.sh
```

### 方式二：使用Docker Compose部署

```bash
# 克隆项目
git clone <repository-url>
cd check_tools

# 如果遇到镜像拉取问题，先配置镜像源
./setup-docker.sh

# 启动服务
docker-compose up -d

# 访问Web界面
# http://localhost:3000
```

### 方式三：手动部署

```bash
# 安装依赖
pip install -r requirements.txt

# 启动后端服务
python server/main.py

# 启动前端服务
cd frontend && npm install && npm start
```

## 使用方式

### Web界面

1. 打开浏览器访问 `http://localhost:3000`
2. 添加服务器信息（IP、用户名、密码/密钥）
3. 选择巡检项目
4. 点击开始巡检
5. 查看实时巡检结果

### 命令行

```bash
# 巡检单台服务器
python cli.py --host 192.168.1.100 --user root --password your_password

# 批量巡检多台服务器
python cli.py --hosts hosts.txt --user root --password your_password

# 自定义巡检项目
python cli.py --host 192.168.1.100 --checks cpu,memory,disk,network
```

## 巡检项目说明

- `system`: 系统基本信息（OS版本、运行时间等）
- `cpu`: CPU使用率
- `memory`: 内存使用情况
- `disk`: 磁盘使用情况（区分根盘和数据盘）
- `network`: 网络信息（网卡、VIP、bond等）
- `process`: 进程信息
- `service`: 服务状态

## 配置文件

### hosts.txt 格式
```
192.168.1.100:22:root:password
192.168.1.101:22:root:/path/to/key
```

## 故障排除

### Docker镜像拉取失败

如果遇到 `ERROR [backend internal] load metadata for docker.io/library/python:3.11-slim` 等错误：

```bash
# 配置Docker镜像源
./setup-docker.sh

# 重新启动服务
docker-compose up -d
```

### 网络连接问题

如果无法访问Docker Hub，可以：

1. 使用国内镜像源（已在上面的脚本中配置）
2. 配置代理服务器
3. 使用本地部署模式

### 端口冲突

如果端口被占用，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8001:8000"  # 将本地的8001端口映射到容器的8000端口
```

### 权限问题

在Linux系统上可能需要sudo权限：

```bash
sudo ./setup-docker.sh
sudo docker-compose up -d
```

## 许可证

MIT License
# check_tools
