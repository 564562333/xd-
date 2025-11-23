import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Popconfirm, Drawer } from 'antd';
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

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/activity')) return '1';
    if (path.startsWith('/registrations')) return '2';
    if (path.startsWith('/posters')) return '3';
    if (path.startsWith('/settings')) return '4';
    return '1';
  };

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const MenuContent = (
    <>
      <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255,255,255,0.06)', textAlign: 'center', color: 'white', lineHeight: '32px' }}>
        活动管理系统
      </div>
      <Menu theme="dark" selectedKeys={[getSelectedKey()]} mode="inline" style={{ fontFamily: 'inherit' }}>
        <Menu.Item key="1" icon={<CalendarOutlined />} style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/activity"><span style={{ display: 'inline-block', letterSpacing: 0 }}>活动管理</span></Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />} style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/registrations"><span style={{ display: 'inline-block', letterSpacing: 0 }}>报名管理</span></Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<PictureOutlined />} style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/posters"><span style={{ display: 'inline-block', letterSpacing: 0 }}>海报管理</span></Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<SettingOutlined />} style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/settings"><span style={{ display: 'inline-block', letterSpacing: 0 }}>账号设置</span></Link>
        </Menu.Item>
      </Menu>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider collapsible breakpoint="lg" collapsedWidth={0} width={220}>
          {MenuContent}
        </Sider>
      )}

      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button type="text" onClick={openDrawer} style={{ fontSize: 20 }} aria-label="打开菜单">☰</Button>
            )}
            <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: 0 }}>
              高校活动管理后台
            </div>
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

      {isMobile && (
        <Drawer placement="left" onClose={closeDrawer} visible={drawerVisible} bodyStyle={{ padding: 0 }}>
          {MenuContent}
        </Drawer>
      )}
    </Layout>
  );
};

export default MainLayout;
