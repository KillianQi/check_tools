import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  Alert,
  Progress,
  Collapse,
  Tag,
  Descriptions,
  Table,
  message,
  Steps,
  Badge,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

const ServerInspection = () => {
  const [form] = Form.useForm();
  const [isInspecting, setIsInspecting] = useState(false);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const wsRef = useRef(null);

  const checkOptions = [
    { label: '系统信息', value: 'system', icon: <SettingOutlined /> },
    { label: 'CPU信息', value: 'cpu', icon: <ThunderboltOutlined /> },
    { label: '内存信息', value: 'memory', icon: <SafetyOutlined /> },
    { label: '磁盘信息', value: 'disk', icon: <FileTextOutlined /> },
    { label: '网络信息', value: 'network', icon: <CloudServerOutlined /> },
    { label: '进程信息', value: 'process', icon: <EyeOutlined /> },
    { label: '服务信息', value: 'service', icon: <ClockCircleOutlined /> },
  ];

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket连接已建立');
      addLog('info', 'WebSocket连接已建立');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      addLog('error', 'WebSocket连接错误');
    };

    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
      addLog('info', 'WebSocket连接已关闭');
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'inspection_start':
        addLog('info', data.message);
        setCurrentStep(1);
        break;
      case 'server_start':
        addLog('info', `开始巡检服务器: ${data.host}`);
        setCurrentStep(2);
        break;
      case 'server_result':
        addLog('success', `服务器 ${data.host} 巡检完成`);
        setResults(prev => [...prev, { host: data.host, result: data.result }]);
        break;
      case 'server_error':
        addLog('error', `服务器 ${data.host} 巡检失败: ${data.message}`);
        setResults(prev => [...prev, { host: data.host, error: data.message }]);
        break;
      case 'inspection_complete':
        addLog('success', data.message);
        setIsInspecting(false);
        setProgress(100);
        setCurrentStep(3);
        break;
      case 'pong':
        // 心跳响应
        break;
      default:
        addLog('info', data.message || '收到未知消息');
    }
  };

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, timestamp }]);
  };

  const handleStartInspection = async (values) => {
    if (!values.servers || !values.servers.trim()) {
      message.error('请输入服务器列表');
      return;
    }

    if (!values.checks || values.checks.length === 0) {
      message.error('请选择至少一个巡检项目');
      return;
    }

    setIsInspecting(true);
    setProgress(0);
    setResults([]);
    setLogs([]);
    setCurrentStep(0);

    // 连接WebSocket
    connectWebSocket();

    try {
      const response = await fetch('/api/inspect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servers: values.servers,
          checks: values.checks,
          default_password: values.defaultPassword || '',
        }),
      });

      if (!response.ok) {
        throw new Error('巡检请求失败');
      }

      const result = await response.json();
      message.success('巡检任务已启动');
    } catch (error) {
      console.error('巡检启动失败:', error);
      message.error('巡检启动失败: ' + error.message);
      setIsInspecting(false);
    }
  };

  const handleStopInspection = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsInspecting(false);
    setProgress(0);
    message.info('巡检已停止');
  };

  const handleClearResults = () => {
    setResults([]);
    setLogs([]);
    setProgress(0);
    setCurrentStep(0);
    message.success('结果已清空');
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'info':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return '#f6ffed';
      case 'error':
        return '#fff2f0';
      case 'info':
        return '#e6f7ff';
      default:
        return '#fafafa';
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspection_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('结果已导出');
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
          <CloudServerOutlined style={{ marginRight: '12px' }} />
          服务器巡检
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
          批量检查服务器系统状态和资源使用情况
        </Text>
      </div>

      {/* 巡检步骤 */}
      <Card 
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Steps current={currentStep} size="small">
          <Step title="配置巡检" description="设置服务器和检查项目" />
          <Step title="开始巡检" description="启动巡检任务" />
          <Step title="执行中" description="正在检查服务器" />
          <Step title="完成" description="巡检任务完成" />
        </Steps>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 左侧配置区域 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <SettingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                巡检配置
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
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStartInspection}
              initialValues={{
                checks: ['system', 'cpu', 'memory', 'disk', 'network'],
              }}
            >
              <Form.Item
                label={
                  <span style={{ fontWeight: '500' }}>
                    <CloudServerOutlined style={{ marginRight: '8px' }} />
                    服务器列表
                  </span>
                }
                name="servers"
                rules={[{ required: true, message: '请输入服务器列表' }]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="请输入服务器列表，格式：host:port:username:password 或 host:port:username:/path/to/key"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ fontWeight: '500' }}>
                    <SafetyOutlined style={{ marginRight: '8px' }} />
                    默认密码（可选）
                  </span>
                }
                name="defaultPassword"
              >
                <Input.Password 
                  placeholder="如果服务器列表中没有指定密码，将使用此默认密码"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={{ fontWeight: '500' }}>
                    <FileTextOutlined style={{ marginRight: '8px' }} />
                    巡检项目
                  </span>
                }
                name="checks"
                rules={[{ required: true, message: '请选择巡检项目' }]}
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row gutter={[16, 8]}>
                    {checkOptions.map(option => (
                      <Col span={12} key={option.value}>
                        <Checkbox value={option.value}>
                          <Space>
                            {option.icon}
                            {option.label}
                          </Space>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item>
                <Space size="middle">
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    size="large"
                    htmlType="submit"
                    loading={isInspecting}
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      padding: '0 24px'
                    }}
                  >
                    开始巡检
                  </Button>
                  <Button
                    danger
                    icon={<StopOutlined />}
                    size="large"
                    onClick={handleStopInspection}
                    disabled={!isInspecting}
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      padding: '0 24px'
                    }}
                  >
                    停止巡检
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    size="large"
                    onClick={handleClearResults}
                    style={{ 
                      borderRadius: '8px',
                      height: '40px',
                      padding: '0 24px'
                    }}
                  >
                    清空结果
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧进度和日志区域 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                巡检进度
              </span>
            }
            hoverable
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none',
              marginBottom: '16px'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Progress 
              percent={progress} 
              status={isInspecting ? 'active' : 'normal'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ marginBottom: '16px' }}
            />
            <div style={{ 
              height: '200px', 
              overflowY: 'auto',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              padding: '12px',
              background: '#fafafa'
            }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>等待巡检开始...</div>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      background: getLogColor(log.type),
                      border: `1px solid ${getLogColor(log.type).replace('0.1', '0.2')}`,
                    }}
                  >
                    <Space>
                      {getLogIcon(log.type)}
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {log.timestamp}
                      </Text>
                      <Text>{log.message}</Text>
                    </Space>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 巡检结果 */}
      {results.length > 0 && (
        <Card 
          title={
            <Space>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>
                <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                巡检结果
              </span>
              <Badge count={results.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          extra={
            <Button 
              icon={<DownloadOutlined />} 
              onClick={exportResults}
              style={{ borderRadius: '8px' }}
            >
              导出结果
            </Button>
          }
          hoverable
          style={{ 
            marginTop: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Collapse 
            ghost
            style={{ background: 'transparent' }}
          >
            {results.map((result, index) => (
              <Panel
                key={index}
                header={
                  <Space>
                    <CloudServerOutlined />
                    <Text strong>{result.host}</Text>
                    {result.error ? (
                      <Tag color="error">巡检失败</Tag>
                    ) : (
                      <Tag color="success">巡检成功</Tag>
                    )}
                  </Space>
                }
                style={{ 
                  marginBottom: '8px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  background: 'white'
                }}
              >
                {result.error ? (
                  <Alert
                    message="巡检失败"
                    description={result.error}
                    type="error"
                    showIcon
                    style={{ borderRadius: '8px' }}
                  />
                ) : (
                  <Descriptions 
                    bordered 
                    size="small" 
                    column={1}
                    style={{ borderRadius: '8px' }}
                  >
                    {result.result && Object.entries(result.result).map(([key, value]) => (
                      <Descriptions.Item 
                        key={key} 
                        label={
                          <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                            {key}
                          </span>
                        }
                      >
                        <pre style={{ 
                          margin: 0, 
                          whiteSpace: 'pre-wrap',
                          fontSize: '12px',
                          background: '#f5f5f5',
                          padding: '8px',
                          borderRadius: '4px'
                        }}>
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                )}
              </Panel>
            ))}
          </Collapse>
        </Card>
      )}
    </div>
  );
};

export default ServerInspection;
