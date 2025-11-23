import apiClient from './client';

// ========== 用户报名(无需认证) ==========

// 报名活动
export const registerActivity = (data) => {
  return apiClient.post('/registration', data);
};

// 查询我的报名记录
export const getMyRegistrations = (phone, pageNum = 1, pageSize = 10) => {
  return apiClient.get('/registration', {
    params: { phone, pageNum, pageSize },
  });
};

// ========== 用户签到(无需认证) ==========

// 签到确认
export const checkinActivity = (data) => {
  return apiClient.post('/registration/checkin', data);
};

// 获取活动详情（用于签到页显示活动时间/判断是否允许签到）
export const getActivityDetail = (id) => {
  return apiClient.get(`/activity/${id}`);
};
