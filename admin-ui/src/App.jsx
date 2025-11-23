import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/Login';
import ActivityListPage from './pages/ActivityList';
import ActivityForm from './pages/ActivityForm';
import RegistrationManagePage from './pages/RegistrationManage';
import PosterManagePage from './pages/PosterManage';
import AdminSettingsPage from './pages/AdminSettings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/activity" />} />
        <Route path="activity" element={<ActivityListPage />} />
        <Route path="activity/new" element={<ActivityForm />} />
        <Route path="activity/edit/:id" element={<ActivityForm />} />
        <Route path="registrations" element={<RegistrationManagePage />} />
        <Route path="posters" element={<PosterManagePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default App;
