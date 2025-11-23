import React from 'react';
import { Layout, Menu, Button, Popconfirm } from 'antd';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarOutlined,
  UserOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/activity')) return '1';
    if (path.startsWith('/registrations')) return '2';
    if (path.startsWith('/posters')) return '3';
    if (path.startsWith('/settings')) return '4';
    return '1';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible breakpoint="lg" collapsedWidth={0}>
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px' }}>
          活动管理系统
        </div>
        <Menu theme="dark" selectedKeys={[getSelectedKey()]} mode="inline">
          <Menu.Item key="1" icon={<CalendarOutlined />}>
            <Link to="/activity">活动管理</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/registrations">报名管理</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<PictureOutlined />}>
            <Link to="/posters">海报管理</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            <Link to="/settings">账号设置</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            高校活动管理后台
          </div>
          <Popconfirm
            title="确定要退出登录吗？"
            onConfirm={handleLogout}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" icon={<LogoutOutlined />}>
              退出登录
            </Button>
          </Popconfirm>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>高校活动管理系统 ©2025</Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
