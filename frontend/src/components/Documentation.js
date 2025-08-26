import React from 'react';
import { Card, Typography, Divider, Alert, Space, Tag } from 'antd';
import { BookOutlined, CodeOutlined, ApiOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Documentation = () => {
  return (
    <div>
      <Title level={2}>文档</Title>
      
      <Alert
        message="快速开始"
        description="服务器批量巡检工具是一个功能强大的企业级服务器监控和巡检解决方案。"
        type="info"
        showIcon
        icon={<BookOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Card title="功能特性" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Tag color="blue">🔍 批量巡检</Tag>
            <Text>支持同时巡检多台服务器，提高效率</Text>
          </div>
          <div>
            <Tag color="green">🖥️ 可视化界面</Tag>
            <Text>现代化的Web界面，实时显示巡检结果</Text>
          </div>
          <div>
            <Tag color="orange">💻 命令行工具</Tag>
            <Text>支持命令行方式使用，便于自动化集成</Text>
          </div>
          <div>
            <Tag color="purple">🎯 自定义巡检</Tag>
            <Text>可选择巡检内容，满足不同需求</Text>
          </div>
          <div>
            <Tag color="red">🐳 Docker部署</Tag>
            <Text>支持Docker Compose一键部署</Text>
          </div>
          <div>
            <Tag color="cyan">🔧 跨平台</Tag>
            <Text>支持Windows、Linux、macOS</Text>
          </div>
        </Space>
      </Card>

      <Card title="巡检项目说明" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>系统信息 (system)</Text>
            <br />
            <Text type="secondary">操作系统版本、发行版本、主机名、运行时间、启动时间</Text>
          </div>
          <Divider />
          <div>
            <Text strong>CPU信息 (cpu)</Text>
            <br />
            <Text type="secondary">CPU核心数、使用率、负载平均值、CPU型号</Text>
          </div>
          <Divider />
          <div>
            <Text strong>内存信息 (memory)</Text>
            <br />
            <Text type="secondary">总内存、已使用、可用内存、使用百分比、交换分区</Text>
          </div>
          <Divider />
          <div>
            <Text strong>磁盘信息 (disk)</Text>
            <br />
            <Text type="secondary">文件系统类型、总大小、当前占用、使用百分比、区分根盘和数据盘</Text>
          </div>
          <Divider />
          <div>
            <Text strong>网络信息 (network)</Text>
            <br />
            <Text type="secondary">物理网卡、bond接口、VIP地址、路由表、网络状态</Text>
          </div>
          <Divider />
          <div>
            <Text strong>进程信息 (process)</Text>
            <br />
            <Text type="secondary">Top进程、CPU和内存占用、进程状态</Text>
          </div>
          <Divider />
          <div>
            <Text strong>服务信息 (service)</Text>
            <br />
            <Text type="secondary">系统服务状态、是否启用、服务描述</Text>
          </div>
        </Space>
      </Card>

      <Card title="使用方式" style={{ marginBottom: 16 }}>
        <Title level={4}>Web界面使用</Title>
        <Paragraph>
          1. 打开浏览器访问 <Text code>http://localhost:3000</Text>
          <br />
          2. 在"服务器巡检"页面添加服务器信息
          <br />
          3. 选择要巡检的项目
          <br />
          4. 点击"开始巡检"按钮
          <br />
          5. 实时查看巡检进度和结果
        </Paragraph>

        <Divider />

        <Title level={4}>命令行使用</Title>
        <Paragraph>
          <Text strong>巡检单台服务器：</Text>
          <br />
          <Text code>python cli.py --host 192.168.1.100 --user root --password your_password</Text>
          <br /><br />
          <Text strong>批量巡检多台服务器：</Text>
          <br />
          <Text code>python cli.py --hosts hosts.txt --user root --password your_password</Text>
          <br /><br />
          <Text strong>自定义巡检项目：</Text>
          <br />
          <Text code>python cli.py --host 192.168.1.100 --checks cpu,memory,disk,network</Text>
          <br /><br />
          <Text strong>使用SSH密钥：</Text>
          <br />
          <Text code>python cli.py --host 192.168.1.100 --user root --key-path /path/to/key</Text>
        </Paragraph>
      </Card>

      <Card title="配置文件格式" style={{ marginBottom: 16 }}>
        <Title level={4}>hosts.txt 格式</Title>
        <Paragraph>
          <Text code>
            # 格式: host:port:username:password_or_key_path
            <br />
            192.168.1.100:22:root:password
            <br />
            192.168.1.101:22:root:password
            <br />
            192.168.1.102:22:root:/path/to/private_key
            <br />
            # 注释行以#开头
          </Text>
        </Paragraph>

        <Alert
          message="安全提示"
          description="建议使用SSH密钥而不是密码进行认证，以提高安全性。"
          type="warning"
          showIcon
        />
      </Card>

      <Card title="部署方式" style={{ marginBottom: 16 }}>
        <Title level={4}>Docker Compose 部署</Title>
        <Paragraph>
          <Text code>
            # 克隆项目
            <br />
            git clone &lt;repository-url&gt;
            <br />
            cd check_tools
            <br /><br />
            # 启动服务
            <br />
            docker-compose up -d
            <br /><br />
            # 访问Web界面
            <br />
            # http://localhost:3000
          </Text>
        </Paragraph>

        <Divider />

        <Title level={4}>手动部署</Title>
        <Paragraph>
          <Text code>
            # 安装依赖
            <br />
            pip install -r requirements.txt
            <br /><br />
            # 启动后端服务
            <br />
            python server/main.py
            <br /><br />
            # 启动前端服务
            <br />
            cd frontend && npm install && npm start
          </Text>
        </Paragraph>
      </Card>

      <Card title="API接口" style={{ marginBottom: 16 }}>
        <Title level={4}>REST API</Title>
        <Paragraph>
          <Text strong>批量巡检接口：</Text>
          <br />
          <Text code>POST /api/inspect</Text>
          <br />
          <Text type="secondary">请求体包含服务器列表和巡检项目</Text>
        </Paragraph>

        <Title level={4}>WebSocket API</Title>
        <Paragraph>
          <Text strong>实时通信：</Text>
          <br />
          <Text code>WS /ws</Text>
          <br />
          <Text type="secondary">用于实时接收巡检进度和结果</Text>
        </Paragraph>
      </Card>

      <Card title="常见问题" style={{ marginBottom: 16 }}>
        <Title level={4}>FAQ</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Q: 连接服务器失败怎么办？</Text>
            <br />
            <Text type="secondary">A: 检查SSH服务是否正常运行，确认用户名密码正确，检查防火墙设置。</Text>
          </div>
          <Divider />
          <div>
            <Text strong>Q: 巡检速度很慢怎么办？</Text>
            <br />
            <Text type="secondary">A: 可以调整并发连接数，减少巡检项目，或优化网络连接。</Text>
          </div>
          <Divider />
          <div>
            <Text strong>Q: 如何添加自定义巡检项目？</Text>
            <br />
            <Text type="secondary">A: 可以在设置页面配置自定义命令，或修改后端代码添加新的巡检逻辑。</Text>
          </div>
          <Divider />
          <div>
            <Text strong>Q: 支持哪些操作系统？</Text>
            <br />
            <Text type="secondary">A: 支持所有基于Linux的系统，包括CentOS、Ubuntu、Debian、RedHat等。</Text>
          </div>
        </Space>
      </Card>

      <Card title="技术支持">
        <Paragraph>
          如果您在使用过程中遇到问题，可以通过以下方式获取帮助：
          <br />
          • 查看日志文件获取详细错误信息
          <br />
          • 检查网络连接和SSH配置
          <br />
          • 参考本文档和示例
          <br />
          • 提交Issue到项目仓库
        </Paragraph>
      </Card>
    </div>
  );
};

export default Documentation;
