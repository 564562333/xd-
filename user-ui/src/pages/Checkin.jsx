import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { checkinActivity, getActivityDetail } from '../api/user';
import apiClient from '../api/client';
import { normalizePhone, isValidPhone } from '../utils/phoneUtil';

const { Title, Paragraph } = Typography;

const CheckinPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [position, setPosition] = useState(null);
  const [activity, setActivity] = useState(null);
  const [checking, setChecking] = useState(false);

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      message.error('当前浏览器不支持定位功能');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ latitude, longitude });
        message.success('位置信息获取成功');
        setLocating(false);
      },
      (error) => {
        message.error(`获取位置信息失败：${error.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getActivityDetail(activityId);
        if (res.code === 1) {
          setActivity(res.data);
        }
      } catch (e) {
        // ignore
      }
    };
    if (activityId) fetchActivity();
  }, [activityId]);

  const onFinish = async (values) => {
    if (!position) {
      message.error('请先获取当前位置后再尝试签到');
      return;
    }
    
    // 归一化手机号
    const normalizedPhone = normalizePhone(values.phone);
    
    // 前端二次校验
    if (!isValidPhone(values.phone)) {
      message.error('手机号格式不正确，请输入11位有效手机号');
      return;
    }
    
    setSubmitting(true);
    // 根据接口文档，后端期望的参数名是 id（可以是活动ID或报名记录ID）
    const payload = {
      id: activityId, // 使用活动ID作为id参数
      phone: normalizedPhone,
      latitude: position.latitude,
      longitude: position.longitude,
    };
    try {
      const attemptCheckin = async (payload, retries = 3, delay = 5000) => {
        for (let i = 0; i <= retries; i++) {
          try {
            setChecking(true);
            // 后端 manage5 使用 activityId 字段，而非 id
            const requestData = {
              activityId: String(payload.id),
              phone: String(payload.phone),
              latitude: String(payload.latitude),
              longitude: String(payload.longitude),
            };

            const res = await apiClient.post('/registration/checkin', requestData);
            if (res.code === 1) return res;
            // 后端返回这条提示，说明该手机号未处于签到集合或已签到
            if (res.code === 0 && res.msg && res.msg.includes('请进入正确的活动')) {
              if (i < retries) {
                message.info(`签到尚未可用，正在重试（${i + 1}/${retries}）`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
              }
            }
            return res;
          } finally {
            setChecking(false);
          }
        }
      };

      const res = await attemptCheckin(payload, 3, 5000);
      if (res.code === 1) {
        navigate(`/result?status=success&title=签到成功&message=您已成功签到！`);
      } else {
        const msg = res.msg || '签到失败';
        // 针对不同错误提供友好提示
        if (msg.includes('手机号') || msg.includes('phone')) {
          message.error('手机号格式不正确或未报名');
        } else if (msg.includes('未报名') || msg.includes('不存在')) {
          message.warning('您尚未报名该活动');
        } else if (msg.includes('已签到') || msg.includes('重复')) {
          message.warning('您已签到，请勿重复签到');
        } else {
          message.error(msg);
        }
      }
    } catch (error) {
      const serverMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.message;
      if (serverMsg && (serverMsg.includes('手机号') || serverMsg.includes('phone'))) {
        message.error('手机号格式不正确或未报名');
      } else if (serverMsg && (serverMsg.includes('未报名') || serverMsg.includes('不存在'))) {
        message.warning('您尚未报名该活动');
      } else {
        message.error('请求失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSign = useMemo(() => {
    if (!activity) return true; // allow submit to show clearer error; but block based on checking
    const now = new Date();
    const start = activity.activityStart ? new Date(activity.activityStart) : null;
    const end = activity.activityEnd ? new Date(activity.activityEnd) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }, [activity]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>活动签到</Title>
        <div style={{ marginBottom: 16 }}>
          <Paragraph>
            当前定位：{position ? `纬度 ${position.latitude.toFixed(6)}，经度 ${position.longitude.toFixed(6)}` : '尚未获取定位'}
          </Paragraph>
          {activity && (
            <div style={{ marginTop: 12 }}>
              <div>活动时间：{activity.activityStart ? dayjs(activity.activityStart).format('YYYY-MM-DD HH:mm') : '-'} 至 {activity.activityEnd ? dayjs(activity.activityEnd).format('YYYY-MM-DD HH:mm') : '-'}</div>
            </div>
          )}
          <Button onClick={requestLocation} loading={locating} block>
            重新获取位置
          </Button>
        </div>
        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item 
            name="phone" 
            label="手机号" 
            rules={[
              { required: true, message: '请输入您报名时使用的手机号' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.reject();
                  if (!isValidPhone(value)) {
                    return Promise.reject(new Error('请输入11位有效手机号'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            normalize={(value) => normalizePhone(value)}
          >
            <Input 
              placeholder="请输入11位手机号，支持 +86/空格/短横线" 
              maxLength={20}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting || checking} disabled={!canSign} block>
              {checking ? '签到中...' : '确认签到'}
            </Button>
            {!canSign && (
              <div style={{ color: '#f50', marginTop: 8 }}>活动尚未开始或已结束，无法签到。</div>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CheckinPage;
