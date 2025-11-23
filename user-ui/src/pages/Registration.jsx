import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { registerActivity } from '../api/user';
import { normalizePhone, isValidPhone } from '../utils/phoneUtil';

const { Title } = Typography;

const RegistrationPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 不再获取活动详情，直接允许报名
    setLoading(false);
  }, []);

  const onFinish = async (values) => {
    setSubmitting(true);
    
    // 归一化手机号
    const normalizedPhone = normalizePhone(values.phone);
    
    // 前端二次校验
    if (!isValidPhone(values.phone)) {
      message.error('手机号格式不正确，请输入11位有效手机号');
      setSubmitting(false);
      return;
    }
    
    const payload = {
      activityId: activityId,
      registrationName: values.registrationName,
      college: values.college,
      phone: normalizedPhone,
    };
    try {
      const res = await registerActivity(payload);
      if (res.code === 1) {
        navigate(`/result?status=success&title=${encodeURIComponent('报名成功')}&message=${encodeURIComponent('您已成功报名该活动')}`);
      } else {
        const msg = res.msg || '报名失败';
        // 针对不同错误提供友好提示
        if (msg.includes('手机号') || msg.includes('phone') || msg.includes('格式')) {
          message.error('手机号格式不正确，请输入11位有效手机号');
        } else if (msg.includes('已报名') || msg.includes('重复') || msg.includes('duplicate')) {
          message.warning('您已报名该活动，请勿重复报名');
        } else if (msg.includes('满') || msg.includes('full')) {
          message.warning('活动报名人数已满');
        } else {
          message.error(msg);
        }
      }
    } catch (error) {
      const serverMsg = error?.response?.data?.msg || error?.response?.data?.message || error?.message;
      if (serverMsg && (serverMsg.includes('手机号') || serverMsg.includes('phone'))) {
        message.error('手机号格式不正确，请输入11位有效手机号');
      } else if (serverMsg && (serverMsg.includes('已报名') || serverMsg.includes('重复'))) {
        message.warning('您已报名该活动，请勿重复报名');
      } else {
        message.error('请求失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <Card>
        <Title level={3}>活动报名</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="registrationName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
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
          <Form.Item name="college" label="学院" rules={[{ required: true, message: '请输入学院' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              立即报名
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegistrationPage;

