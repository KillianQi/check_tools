import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Space, Button, message } from 'antd';
import {
  DashboardOutlined,
  CloudServerOutlined,
  SettingOutlined,
  BookOutlined,
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import ServerInspection from './components/ServerInspection';
import Settings from './components/Settings';
import Documentation from './components/Documentation';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: 'inspection',
      icon: <CloudServerOutlined />,
      label: '服务器巡检',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: 'docs',
      icon: <BookOutlined />,
      label: '文档',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'inspection':
        return <ServerInspection />;
      case 'settings':
        return <Settings />;
      case 'docs':
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? '12px' : '16px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'SI' : '服务器巡检'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              {menuItems.find(item => item.key === selectedKey)?.label}
            </Title>
          </Space>
          <Space>
            <span style={{ color: '#666' }}>
              服务器批量巡检工具 v1.0.0
            </span>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f5f5f5' }}>
          <div className="site-layout-content">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
