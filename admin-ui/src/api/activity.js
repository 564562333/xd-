import apiClient from './client';

// ========== 活动管理 ==========

// 查询或搜索活动（分页）
export const getActivityList = (params) => {
  return apiClient.get('/activity', { params });
};

// 创建活动
export const createActivity = (data) => {
  return apiClient.post('/activity', data);
};

// 更新活动
export const updateActivity = (id, data) => {
  return apiClient.put(`/activity/${id}`, data);
};

// 删除活动
export const deleteActivity = (id) => {
  return apiClient.delete(`/activity/${id}`);
};

// 获取活动详情
export const getActivityDetail = (id) => {
  return apiClient.get(`/activity/${id}`);
};

// 生成活动二维码（宣传用）
export const getActivityQRCode = (id, params = {}) => {
  return apiClient.get(`/activity/${id}/qrcode`, { params });
};

// ========== 报名管理 ==========

// 查询报名记录（管理员查看某手机号的报名记录）
export const getRegistrationList = (params) => {
  return apiClient.get('/registration', { params });
};

// 管理员代用户报名
export const createRegistration = (data) => {
  return apiClient.post('/registration', data);
};

// 生成报名二维码（用户扫码报名）
export const getRegistrationQRCode = (id, params = {}) => {
  return apiClient.get(`/registration/${id}/registration/qrcode`, { params });
};

// 生成签到二维码（用户扫码签到）
export const getCheckinQRCode = (id, params = {}) => {
  return apiClient.get(`/registration/${id}/checkin/qrcode`, { params });
};

// ========== 签到管理 ==========

// 管理员代用户签到
export const createCheckin = (data) => {
  return apiClient.post('/registration/checkin', data);
};

// ========== 海报管理 ==========

// 查询海报模板列表
export const getPosterTemplates = () => {
  return apiClient.get('/poster/templates');
};

// 合成海报
export const combinePoster = (params) => {
  return apiClient.get('/poster/combine', { params });
};

// 查询活动海报列表
export const getActivityPosters = (id) => {
  return apiClient.get('/poster', { params: { id } });
};

// 管理员取消报名（根据 activityId 和 phone）
export const deleteRegistration = (data) => {
  // axios delete with body requires the data field
  return apiClient.delete('/registration', { data });
};
