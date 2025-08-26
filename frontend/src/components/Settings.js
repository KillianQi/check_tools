import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, InputNumber, Space, Typography, Divider, Alert } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // 模拟保存设置
    setTimeout(() => {
      console.log('保存设置:', values);
      setLoading(false);
    }, 1000);
  };

  const resetSettings = () => {
    form.resetFields();
  };

  return (
    <div>
      <Title level={2}>设置</Title>
      
      <Alert
        message="设置说明"
        description="这些设置将影响巡检工具的行为。修改后需要重启服务才能生效。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="连接设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            ssh_timeout: 30,
            command_timeout: 10,
            max_concurrent: 5,
            enable_retry: true,
            retry_count: 3,
            retry_delay: 5
          }}
        >
          <Form.Item
            label="SSH连接超时时间"
            name="ssh_timeout"
            extra="SSH连接的最大等待时间（秒）"
          >
            <InputNumber min={5} max={300} />
          </Form.Item>

          <Form.Item
            label="命令执行超时时间"
            name="command_timeout"
            extra="单个命令执行的最大等待时间（秒）"
          >
            <InputNumber min={1} max={60} />
          </Form.Item>

          <Form.Item
            label="最大并发连接数"
            name="max_concurrent"
            extra="同时巡检的最大服务器数量"
          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Divider />

          <Form.Item
            label="启用重试机制"
            name="enable_retry"
            valuePropName="checked"
            extra="连接失败时是否自动重试"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="重试次数"
            name="retry_count"
            extra="连接失败时的最大重试次数"
          >
            <InputNumber min={1} max={10} />
          </Form.Item>

          <Form.Item
            label="重试间隔"
            name="retry_delay"
            extra="重试之间的等待时间（秒）"
          >
            <InputNumber min={1} max={60} />
          </Form.Item>

          <Divider />

          <Form.Item
            label="日志级别"
            name="log_level"
            extra="日志记录的详细程度"
          >
            <Input.Group compact>
              <Button.Group>
                <Button>DEBUG</Button>
                <Button type="primary">INFO</Button>
                <Button>WARNING</Button>
                <Button>ERROR</Button>
              </Button.Group>
            </Input.Group>
          </Form.Item>

          <Form.Item
            label="日志文件路径"
            name="log_file"
            extra="日志文件的保存路径"
          >
            <Input placeholder="/var/log/server-inspector.log" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                htmlType="submit"
              >
                保存设置
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetSettings}
              >
                重置设置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="高级设置" style={{ marginTop: 16 }}>
        <Form layout="vertical">
          <Form.Item
            label="自定义SSH选项"
            name="ssh_options"
            extra="额外的SSH连接选项（JSON格式）"
          >
            <Input.TextArea
              rows={4}
              placeholder='{"compression": true, "keepalive": 60}'
            />
          </Form.Item>

          <Form.Item
            label="代理设置"
            name="proxy"
            extra="HTTP代理服务器地址（可选）"
          >
            <Input placeholder="http://proxy.example.com:8080" />
          </Form.Item>

          <Form.Item
            label="自定义命令"
            name="custom_commands"
            extra="巡检时执行的自定义命令（每行一个）"
          >
            <Input.TextArea
              rows={4}
              placeholder="echo 'Custom check'&#10;ps aux | grep important_process"
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
