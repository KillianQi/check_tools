import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Tag, Typography, Empty, Spin } from 'antd';
import { 
  CloudServerOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  DesktopOutlined,
  HddOutlined,
  WifiOutlined,
  TrophyOutlined,
  RocketOutlined,
  SafetyOutlined
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
  const [loading, setLoading] = useState(false);

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
      render: (text) => <Text code style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'online' ? 'success' : 'error'}
          style={{ 
            borderRadius: '12px', 
            padding: '2px 8px',
            fontWeight: '500'
          }}
        >
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
          strokeColor={value > 80 ? '#ff4d4f' : value > 60 ? '#faad14' : '#52c41a'}
          showInfo={false}
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
          strokeColor={value > 80 ? '#ff4d4f' : value > 60 ? '#faad14' : '#52c41a'}
          showInfo={false}
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
          strokeColor={value > 80 ? '#ff4d4f' : value > 60 ? '#faad14' : '#52c41a'}
          showInfo={false}
        />
      ),
    },
    {
      title: '最后检查时间',
      dataIndex: 'lastCheck',
      key: 'lastCheck',
      render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>,
    },
  ];

  const getStatusColor = (type) => {
    switch (type) {
      case 'total':
        return { color: '#1890ff', backgroundColor: '#e6f7ff' };
      case 'online':
        return { color: '#52c41a', backgroundColor: '#f6ffed' };
      case 'offline':
        return { color: '#ff4d4f', backgroundColor: '#fff2f0' };
      case 'inspecting':
        return { color: '#faad14', backgroundColor: '#fffbe6' };
      default:
        return { color: '#1890ff', backgroundColor: '#e6f7ff' };
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面标题 */}
      <div style={{ 
        marginBottom: '24px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          <TrophyOutlined style={{ marginRight: '12px' }} />
          服务器巡检仪表板
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
          实时监控服务器状态和系统资源使用情况
        </Text>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>总服务器数</span>}
              value={stats.totalServers}
              prefix={<CloudServerOutlined style={{ fontSize: '24px', color: getStatusColor('total').color }} />}
              valueStyle={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: getStatusColor('total').color 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>在线服务器</span>}
              value={stats.onlineServers}
              prefix={<CheckCircleOutlined style={{ fontSize: '24px', color: getStatusColor('online').color }} />}
              valueStyle={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: getStatusColor('online').color 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>离线服务器</span>}
              value={stats.offlineServers}
              prefix={<CloseCircleOutlined style={{ fontSize: '24px', color: getStatusColor('offline').color }} />}
              valueStyle={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: getStatusColor('offline').color 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: '500' }}>正在巡检</span>}
              value={stats.inspectingServers}
              prefix={<ClockCircleOutlined style={{ fontSize: '24px', color: getStatusColor('inspecting').color }} />}
              valueStyle={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: getStatusColor('inspecting').color 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <DesktopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                CPU使用率
              </span>
            }
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Progress 
              type="dashboard" 
              percent={systemOverview.cpuUsage} 
              format={percent => `${percent}%`}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              size={120}
            />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>平均使用率</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <HddOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                内存使用率
              </span>
            }
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Progress 
              type="dashboard" 
              percent={systemOverview.memoryUsage} 
              format={percent => `${percent}%`}
              strokeColor={{
                '0%': '#52c41a',
                '100%': '#faad14',
              }}
              size={120}
            />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>平均使用率</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <WifiOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                磁盘使用率
              </span>
            }
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Progress 
              type="dashboard" 
              percent={systemOverview.diskUsage} 
              format={percent => `${percent}%`}
              strokeColor={{
                '0%': '#722ed1',
                '100%': '#eb2f96',
              }}
              size={120}
            />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>平均使用率</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近巡检结果 */}
      <Card 
        title={
          <span style={{ fontSize: '18px', fontWeight: '600' }}>
            <RocketOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            最近巡检结果
          </span>
        }
        hoverable
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {recentResults.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={recentResults} 
            pagination={false}
            size="middle"
            rowKey="key"
            style={{ borderRadius: '8px' }}
          />
        ) : (
          <Empty 
            description="暂无巡检数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '40px 0' }}
          >
            <Text type="secondary">开始您的第一次服务器巡检吧！</Text>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
