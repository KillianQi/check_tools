import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Typography } from 'antd';
import { 
  CloudServerOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  DesktopOutlined,
  HddOutlined,
  WifiOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalServers: 0,
    onlineServers: 0,
    offlineServers: 0,
    inspectingServers: 0,
  });

  const [recentResults, setRecentResults] = useState([]);
  const [systemOverview, setSystemOverview] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
  });

  useEffect(() => {
    // 初始化空数据
    setStats({
      totalServers: 0,
      onlineServers: 0,
      offlineServers: 0,
      inspectingServers: 0,
    });

    setRecentResults([]);
    setSystemOverview({
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
    });
  }, []);

  const columns = [
    {
      title: '服务器',
      dataIndex: 'host',
      key: 'host',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'online' ? 'green' : 'red'}>
          {status === 'online' ? '在线' : '离线'}
        </Tag>
      ),
    },
    {
      title: 'CPU使用率',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (value) => (
        <Progress 
          percent={value} 
          size="small" 
          status={value > 80 ? 'exception' : value > 60 ? 'active' : 'normal'}
        />
      ),
    },
    {
      title: '内存使用率',
      dataIndex: 'memory',
      key: 'memory',
      render: (value) => (
        <Progress 
          percent={value} 
          size="small" 
          status={value > 80 ? 'exception' : value > 60 ? 'active' : 'normal'}
        />
      ),
    },
    {
      title: '磁盘使用率',
      dataIndex: 'disk',
      key: 'disk',
      render: (value) => (
        <Progress 
          percent={value} 
          size="small" 
          status={value > 80 ? 'exception' : value > 60 ? 'active' : 'normal'}
        />
      ),
    },
    {
      title: '最后检查时间',
      dataIndex: 'lastCheck',
      key: 'lastCheck',
    },
  ];

  return (
    <div>
      <Title level={2}>仪表板</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总服务器数"
              value={stats.totalServers}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线服务器"
              value={stats.onlineServers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="离线服务器"
              value={stats.offlineServers}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正在巡检"
              value={stats.inspectingServers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="CPU使用率" extra={<DesktopOutlined />}>
            <Progress 
              type="dashboard" 
              percent={systemOverview.cpuUsage} 
              format={percent => `${percent}%`}
            />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">平均使用率</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="内存使用率" extra={<HddOutlined />}>
            <Progress 
              type="dashboard" 
              percent={systemOverview.memoryUsage} 
              format={percent => `${percent}%`}
            />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">平均使用率</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="磁盘使用率" extra={<WifiOutlined />}>
            <Progress 
              type="dashboard" 
              percent={systemOverview.diskUsage} 
              format={percent => `${percent}%`}
            />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">平均使用率</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近巡检结果 */}
      <Card title="最近巡检结果">
        <Table 
          columns={columns} 
          dataSource={recentResults} 
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
