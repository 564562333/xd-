import apiClient from './client';

// 登录
export const login = (data) => {
  return apiClient.post('/admin/login', data);
};

// 登出
export const logout = () => {
  return apiClient.post('/admin/logout');
};

// 验证令牌
export const checkAuthorization = () => {
  return apiClient.get('/admin/authorization');
};

// 修改密码
export const updatePassword = (data) => {
  return apiClient.put('/admin/password', data);
};

// 修改账号
export const updateUsername = (data) => {
  return apiClient.put('/admin/username', data);
};

// 获取管理员信息
export const getAdminInfo = () => {
  return apiClient.get('/admin/info');
};

