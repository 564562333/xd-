import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import RegistrationPage from './pages/Registration';
import ResultPage from './pages/Result';
import MyRegistrationsPage from './pages/MyRegistrations';
import CheckinPage from './pages/Checkin';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content>
        <Routes>
          <Route path="/" element={<Navigate to="/my-registrations" replace />} />
          <Route path="/registration/:activityId" element={<RegistrationPage />} />
          <Route path="/checkin/:activityId" element={<CheckinPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/my-registrations" element={<MyRegistrationsPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
