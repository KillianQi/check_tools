import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  InputNumber,
  Select,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Alert,
  message,
  Tabs,
  Tag
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  KeyOutlined,
  GlobalOutlined as GlobalIcon,
  ToolOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('设置已保存');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('设置已重置');
  };

  const connectionTab = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={{
        sshTimeout: 30,
        commandTimeout: 60,
        maxConcurrency: 5,
        retryCount: 3,
        retryDelay: 5,
        keepAlive: true,
        compression: true,
      }}
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                SSH连接超时（秒）
              </span>
            }
            name="sshTimeout"
            rules={[{ required: true, message: '请输入SSH连接超时时间' }]}
          >
            <InputNumber
              min={5}
              max={300}
              style={{ width: '100%' }}
              placeholder="30"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                命令执行超时（秒）
              </span>
            }
            name="commandTimeout"
            rules={[{ required: true, message: '请输入命令执行超时时间' }]}
          >
            <InputNumber
              min={10}
              max={600}
              style={{ width: '100%' }}
              placeholder="60"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <GlobalOutlined style={{ marginRight: '8px' }} />
                最大并发数
              </span>
            }
            name="maxConcurrency"
            rules={[{ required: true, message: '请输入最大并发数' }]}
          >
            <InputNumber
              min={1}
              max={20}
              style={{ width: '100%' }}
              placeholder="5"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <ReloadOutlined style={{ marginRight: '8px' }} />
                重试次数
              </span>
            }
            name="retryCount"
            rules={[{ required: true, message: '请输入重试次数' }]}
          >
            <InputNumber
              min={0}
              max={10}
              style={{ width: '100%' }}
              placeholder="3"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                重试延迟（秒）
              </span>
            }
            name="retryDelay"
            rules={[{ required: true, message: '请输入重试延迟时间' }]}
          >
            <InputNumber
              min={1}
              max={60}
              style={{ width: '100%' }}
              placeholder="5"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <GlobalOutlined style={{ marginRight: '8px' }} />
                连接保持
              </span>
            }
            name="keepAlive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={
              <span style={{ fontWeight: '500' }}>
                <GlobalOutlined style={{ marginRight: '8px' }} />
                启用压缩
              </span>
            }
            name="compression"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const securityTab = (
    <>
      <Alert
        message="安全配置"
        description="配置SSH连接的安全选项和认证方式"
        type="info"
        showIcon
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      />

      <Form layout="vertical">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <KeyOutlined style={{ marginRight: '8px' }} />
                  默认SSH密钥路径
                </span>
              }
            >
              <Input
                placeholder="/home/user/.ssh/id_rsa"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <SecurityScanOutlined style={{ marginRight: '8px' }} />
                  SSH算法优先级
                </span>
              }
            >
              <Select
                placeholder="选择SSH算法"
                style={{ borderRadius: '8px' }}
                defaultValue="default"
              >
                <Option value="default">默认（推荐）</Option>
                <Option value="modern">现代算法</Option>
                <Option value="legacy">传统算法</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <SecurityScanOutlined style={{ marginRight: '8px' }} />
                  禁用已知主机检查
                </span>
              }
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <SecurityScanOutlined style={{ marginRight: '8px' }} />
                  启用严格主机检查
                </span>
              }
            >
              <Switch defaultChecked />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );

  const loggingTab = (
    <>
      <Alert
        message="日志配置"
        description="配置系统日志记录和输出选项"
        type="info"
        showIcon
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      />

      <Form layout="vertical">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  日志级别
                </span>
              }
            >
              <Select
                placeholder="选择日志级别"
                style={{ borderRadius: '8px' }}
                defaultValue="info"
              >
                <Option value="debug">调试</Option>
                <Option value="info">信息</Option>
                <Option value="warning">警告</Option>
                <Option value="error">错误</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  日志文件路径
                </span>
              }
            >
              <Input
                placeholder="/var/log/server-inspector.log"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  启用文件日志
                </span>
              }
            >
              <Switch defaultChecked />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  启用控制台日志
                </span>
              }
            >
              <Switch defaultChecked />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  日志轮转大小（MB）
                </span>
              }
            >
              <InputNumber
                min={1}
                max={1000}
                style={{ width: '100%' }}
                placeholder="100"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  保留日志文件数
                </span>
              }
            >
              <InputNumber
                min={1}
                max={50}
                style={{ width: '100%' }}
                placeholder="10"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );

  const advancedTab = (
    <>
      <Alert
        message="高级配置"
        description="配置高级选项和自定义参数"
        type="info"
        showIcon
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      />

      <Form layout="vertical">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <GlobalOutlined style={{ marginRight: '8px' }} />
                  代理服务器
                </span>
              }
            >
              <Input
                placeholder="http://proxy.example.com:8080"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <ToolOutlined style={{ marginRight: '8px' }} />
                  自定义SSH选项
                </span>
              }
            >
              <Input.TextArea
                rows={3}
                placeholder="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <ToolOutlined style={{ marginRight: '8px' }} />
                  自定义命令前缀
                </span>
              }
            >
              <Input
                placeholder="sudo"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span style={{ fontWeight: '500' }}>
                  <ToolOutlined style={{ marginRight: '8px' }} />
                  启用调试模式
                </span>
              }
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );

  const items = [
    {
      key: 'connection',
      label: (
        <span>
          <GlobalOutlined />
          连接设置
        </span>
      ),
      children: connectionTab,
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined />
          安全设置
        </span>
      ),
      children: securityTab,
    },
    {
      key: 'logging',
      label: (
        <span>
          <FileTextOutlined />
          日志设置
        </span>
      ),
      children: loggingTab,
    },
    {
      key: 'advanced',
      label: (
        <span>
          <ToolOutlined />
          高级设置
        </span>
      ),
      children: advancedTab,
    },
  ];

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
          <SettingOutlined style={{ marginRight: '12px' }} />
          系统设置
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
          配置服务器巡检工具的各项参数和选项
        </Text>
      </div>

      <Card
        hoverable
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Tabs defaultActiveKey="connection" size="large" items={items} />

        <Divider />

        {/* 操作按钮 */}
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              onClick={() => form.submit()}
              style={{
                borderRadius: '8px',
                height: '40px',
                padding: '0 32px'
              }}
            >
              保存设置
            </Button>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={handleReset}
              style={{
                borderRadius: '8px',
                height: '40px',
                padding: '0 32px'
              }}
            >
              重置设置
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
