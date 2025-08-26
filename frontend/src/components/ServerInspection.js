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
  message
} from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ServerInspection = () => {
  const [form] = Form.useForm();
  const [isInspecting, setIsInspecting] = useState(false);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const wsRef = useRef(null);

  const checkOptions = [
    { label: '系统信息', value: 'system' },
    { label: 'CPU信息', value: 'cpu' },
    { label: '内存信息', value: 'memory' },
    { label: '磁盘信息', value: 'disk' },
    { label: '网络信息', value: 'network' },
    { label: '进程信息', value: 'process' },
    { label: '服务信息', value: 'service' },
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
        break;
      case 'server_start':
        addLog('info', `开始巡检服务器: ${data.host}`);
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
        break;
      case 'pong':
        // 心跳响应
        break;
      default:
        console.log('未知消息类型:', data);
    }
  };

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { type, message, timestamp }]);
  };

  const startInspection = async (values) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      // 等待连接建立
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          sendInspectionRequest(values);
        } else {
          message.error('WebSocket连接失败');
        }
      }, 1000);
    } else {
      sendInspectionRequest(values);
    }
  };

  const sendInspectionRequest = (values) => {
    const servers = values.servers.split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        const parts = line.split(':');
        return {
          host: parts[0],
          port: parseInt(parts[1]) || 22,
          username: parts[2] || 'root',
          password: parts[3] || values.password,
          key_path: parts[3]?.startsWith('/') ? parts[3] : null
        };
      });

    const request = {
      type: 'inspect',
      servers: servers,
      checks: values.checks
    };

    wsRef.current.send(JSON.stringify(request));
    setIsInspecting(true);
    setProgress(0);
    setResults([]);
    setLogs([]);
    addLog('info', `开始巡检 ${servers.length} 台服务器`);
  };

  const stopInspection = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsInspecting(false);
    setProgress(0);
    addLog('warning', '巡检已停止');
  };

  const renderSystemInfo = (system) => (
    <Descriptions column={2} size="small">
      <Descriptions.Item label="操作系统">{system.os_name}</Descriptions.Item>
      <Descriptions.Item label="版本">{system.os_version}</Descriptions.Item>
      <Descriptions.Item label="内核版本">{system.kernel_version}</Descriptions.Item>
      <Descriptions.Item label="主机名">{system.hostname}</Descriptions.Item>
      <Descriptions.Item label="运行时间">{system.uptime}</Descriptions.Item>
      <Descriptions.Item label="启动时间">{system.boot_time}</Descriptions.Item>
    </Descriptions>
  );

  const renderCPUInfo = (cpu) => (
    <Descriptions column={2} size="small">
      <Descriptions.Item label="CPU核心数">{cpu.cpu_count}</Descriptions.Item>
      <Descriptions.Item label="CPU使用率">
        <Progress percent={cpu.cpu_usage} size="small" />
      </Descriptions.Item>
      <Descriptions.Item label="负载平均值">
        {cpu.load_average.join(', ')}
      </Descriptions.Item>
      <Descriptions.Item label="CPU型号">{cpu.cpu_model}</Descriptions.Item>
    </Descriptions>
  );

  const renderMemoryInfo = (memory) => (
    <Descriptions column={2} size="small">
      <Descriptions.Item label="总内存">
        {(memory.total / (1024**3)).toFixed(1)} GB
      </Descriptions.Item>
      <Descriptions.Item label="已使用">
        {(memory.used / (1024**3)).toFixed(1)} GB ({memory.usage_percent.toFixed(1)}%)
      </Descriptions.Item>
      <Descriptions.Item label="可用内存">
        {(memory.available / (1024**3)).toFixed(1)} GB
      </Descriptions.Item>
      <Descriptions.Item label="交换分区">
        {(memory.swap_total / (1024**3)).toFixed(1)} GB
      </Descriptions.Item>
    </Descriptions>
  );

  const renderDiskInfo = (disks) => (
    <Table
      dataSource={disks}
      columns={[
        { title: '挂载点', dataIndex: 'mountpoint', key: 'mountpoint' },
        { title: '设备', dataIndex: 'device', key: 'device' },
        { title: '文件系统', dataIndex: 'filesystem', key: 'filesystem' },
        { 
          title: '使用率', 
          dataIndex: 'usage_percent', 
          key: 'usage_percent',
          render: (value) => <Progress percent={value} size="small" />
        },
        { 
          title: '类型', 
          dataIndex: 'disk_type', 
          key: 'disk_type',
          render: (value) => <Tag color={value === 'root' ? 'red' : value === 'data' ? 'blue' : 'default'}>{value}</Tag>
        }
      ]}
      pagination={false}
      size="small"
    />
  );

  const renderNetworkInfo = (network) => (
    <div>
      <h4>网络接口</h4>
      {network.interfaces.map((iface, index) => (
        <div key={index} className={`network-interface ${iface.status === 'UP' ? 'interface-up' : 'interface-down'}`}>
          <div><strong>{iface.name}</strong> ({iface.interface_type})</div>
          {iface.ip_address && <div>IP: {iface.ip_address}/{iface.netmask}</div>}
          {iface.mac_address && <div>MAC: {iface.mac_address}</div>}
          {iface.speed && <div>速度: {iface.speed} Mbps</div>}
        </div>
      ))}
      
      {network.bonds.length > 0 && (
        <>
          <h4>Bond接口</h4>
          {network.bonds.map((bond, index) => (
            <div key={index}>
              <Tag color="blue">{bond.name}</Tag> 模式{bond.mode}, 状态: {bond.status}
            </div>
          ))}
        </>
      )}
      
      {network.vips.length > 0 && (
        <>
          <h4>虚拟IP</h4>
          {network.vips.map((vip, index) => (
            <div key={index}>
              <Tag color="green">{vip.ip}</Tag> ({vip.type})
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderResult = (result) => {
    if (result.error) {
      return <Alert message="巡检失败" description={result.error} type="error" showIcon />;
    }

    return (
      <Collapse>
        {result.result.system && (
          <Panel header="系统信息" key="system">
            {renderSystemInfo(result.result.system)}
          </Panel>
        )}
        {result.result.cpu && (
          <Panel header="CPU信息" key="cpu">
            {renderCPUInfo(result.result.cpu)}
          </Panel>
        )}
        {result.result.memory && (
          <Panel header="内存信息" key="memory">
            {renderMemoryInfo(result.result.memory)}
          </Panel>
        )}
        {result.result.disks && (
          <Panel header="磁盘信息" key="disks">
            {renderDiskInfo(result.result.disks)}
          </Panel>
        )}
        {result.result.network && (
          <Panel header="网络信息" key="network">
            {renderNetworkInfo(result.result.network)}
          </Panel>
        )}
      </Collapse>
    );
  };

  return (
    <div>
      <Title level={2}>服务器巡检</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="巡检配置" extra={<CloudServerOutlined />}>
            <Form
              form={form}
              layout="vertical"
              onFinish={startInspection}
              initialValues={{
                checks: ['system', 'cpu', 'memory', 'disk', 'network']
              }}
            >
              <Form.Item
                label="服务器列表"
                name="servers"
                rules={[{ required: true, message: '请输入服务器列表' }]}
                extra="格式: host:port:username:password，每行一个服务器"
              >
                <Input.TextArea
                  rows={6}
                  placeholder="请输入服务器列表，格式：host:port:username:password 或 host:port:username:/path/to/key"
                />
              </Form.Item>

              <Form.Item
                label="默认密码"
                name="password"
                extra="如果服务器列表中没有指定密码，将使用此默认密码"
              >
                <Input.Password placeholder="默认SSH密码" />
              </Form.Item>

              <Form.Item
                label="巡检项目"
                name="checks"
              >
                <Checkbox.Group options={checkOptions} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={isInspecting}
                    htmlType="submit"
                  >
                    开始巡检
                  </Button>
                  <Button
                    icon={<StopOutlined />}
                    onClick={stopInspection}
                    disabled={!isInspecting}
                  >
                    停止巡检
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setResults([]);
                      setLogs([]);
                      setProgress(0);
                    }}
                  >
                    清空结果
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="巡检进度" extra={<CheckCircleOutlined />}>
            <Progress percent={progress} status={isInspecting ? 'active' : 'normal'} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">
                {isInspecting ? '正在巡检中...' : '等待开始巡检'}
              </Text>
            </div>
          </Card>

          <Card title="巡检日志" style={{ marginTop: 16 }}>
            <div className="log-container">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry log-${log.type}`}>
                  [{log.timestamp}] {log.message}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="巡检结果">
        {results.map((result, index) => (
          <Card
            key={index}
            type="inner"
            title={
              <Space>
                <Text code>{result.host}</Text>
                {result.error ? (
                  <Tag color="red" icon={<CloseCircleOutlined />}>失败</Tag>
                ) : (
                  <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>
                )}
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {renderResult(result)}
          </Card>
        ))}
        
        {results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            暂无巡检结果
          </div>
        )}
      </Card>
    </div>
  );
};

export default ServerInspection;
