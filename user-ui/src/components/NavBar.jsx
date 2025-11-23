import React from 'react';
import { Layout, Menu } from 'antd';
import { UnorderedListOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/activities',
      icon: <UnorderedListOutlined />,
      label: '活动浏览',
    },
    {
      key: '/my-registrations',
      icon: <FileTextOutlined />,
      label: '我的报名',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 根据当前路径确定选中项
  const getSelectedKey = () => {
    if (location.pathname.startsWith('/activities') || location.pathname === '/') {
      return '/activities';
    }
    if (location.pathname.startsWith('/my-registrations')) {
      return '/my-registrations';
    }
    return '/activities';
  };

  return (
    <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginRight: 40, marginLeft: 20 }}>
          活动管理系统
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>
    </Header>
  );
};

export default NavBar;
