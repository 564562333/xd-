import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Space, Divider } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { updatePassword, updateUsername, logout } from '../api/admin';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [passwordForm] = Form.useForm();
  const [usernameForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 修改密码
  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (res.code === 1) {
        message.success('密码修改成功，请重新登录');
        passwordForm.resetFields();
        
        // 延迟跳转到登录页
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 1500);
      } else {
        message.error(res.msg || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 修改账号
  const handleUsernameChange = async (values) => {
    setLoading(true);
    try {
      const res = await updateUsername({
        userName: values.userName,
      });

      if (res.code === 1) {
        message.success('账号修改成功');
        usernameForm.resetFields();
      } else {
        message.error(res.msg || '账号修改失败');
      }
    } catch (error) {
      message.error('账号修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      message.success('已登出');
      navigate('/login');
    } catch (error) {
      // 即使请求失败也清除本地token
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={3}>账号设置</Title>

        {/* 修改密码 */}
        <div style={{ marginBottom: 40 }}>
          <Title level={4}>
            <LockOutlined /> 修改密码
          </Title>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              name="oldPassword"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password placeholder="请输入旧密码" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password placeholder="请输入新密码（至少6位）" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Divider />

        {/* 修改账号 */}
        <div style={{ marginBottom: 40 }}>
          <Title level={4}>
            <UserOutlined /> 修改账号
          </Title>
          <Form
            form={usernameForm}
            layout="vertical"
            onFinish={handleUsernameChange}
          >
            <Form.Item
              name="userName"
              label="新账号"
              rules={[
                { required: true, message: '请输入新账号' },
                { min: 3, message: '账号至少3位' },
              ]}
            >
              <Input placeholder="请输入新账号（至少3位）" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改账号
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Divider />

        {/* 登出 */}
        <div>
          <Title level={4}>退出登录</Title>
          <Text type="secondary">退出当前账号</Text>
          <div style={{ marginTop: 16 }}>
            <Button danger onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
