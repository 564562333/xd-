import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, message, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createActivity, updateActivity, getActivityDetail } from '../api/activity';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ActivityForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getActivityDetail(id)
        .then(res => {
          if (res.code === 1) {
            const activity = res.data;
            form.setFieldsValue({
              activityName: activity.activityName,
              activityDescription: activity.activityDescription,
              location: activity.location,
              latitude: activity.latitude,
              longitude: activity.longitude,
              link: activity.link,
              maxParticipants: activity.maxParticipants,
              activityTime: activity.activityStart && activity.activityEnd
                ? [dayjs(activity.activityStart), dayjs(activity.activityEnd)]
                : undefined,
              registrationTime: activity.registrationStart && activity.registrationEnd
                ? [dayjs(activity.registrationStart), dayjs(activity.registrationEnd)]
                : undefined,
            });
          } else {
            message.error(res.msg || '获取活动详情失败');
          }
        })
        .catch(() => message.error('请求失败'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    setLoading(true);
    const payload = {
      activityName: values.activityName,
      activityDescription: values.activityDescription,
      location: values.location,
      latitude: values.latitude,
      longitude: values.longitude,
      link: values.link,
      maxParticipants: values.maxParticipants,
      activityStart: values.activityTime ? dayjs(values.activityTime[0]).format('YYYY-MM-DDTHH:mm:ss') : undefined,
      activityEnd: values.activityTime ? dayjs(values.activityTime[1]).format('YYYY-MM-DDTHH:mm:ss') : undefined,
      registrationStart: values.registrationTime ? dayjs(values.registrationTime[0]).format('YYYY-MM-DDTHH:mm:ss') : undefined,
      registrationEnd: values.registrationTime ? dayjs(values.registrationTime[1]).format('YYYY-MM-DDTHH:mm:ss') : undefined,
    };

    try {
      const res = isEdit ? await updateActivity(id, payload) : await createActivity(payload);
      if (res.code === 1) {
        message.success(isEdit ? '更新成功' : '创建成功');
        navigate('/activity');
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (error) {
      message.error('请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑活动' : '新建活动'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Form.Item name="activityName" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="activityDescription" label="活动简介">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="location" label="活动地点" rules={[{ required: true, message: '请输入活动地点' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="活动坐标">
          <Input.Group compact>
            <Form.Item
              name="latitude"
              noStyle
              rules={[{ required: true, message: '请输入纬度' }]}
            >
              <InputNumber placeholder="纬度" style={{ width: '50%' }} min={-90} max={90} step={0.000001} />
            </Form.Item>
            <Form.Item
              name="longitude"
              noStyle
              rules={[{ required: true, message: '请输入经度' }]}
            >
              <InputNumber placeholder="经度" style={{ width: '50%' }} min={-180} max={180} step={0.000001} />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item name="activityTime" label="活动时间" rules={[{ required: true }]}>
          <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="registrationTime" label="报名时间" rules={[{ required: true }]}>
          <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="maxParticipants" label="人数上限" rules={[{ required: true, type: 'number', min: 1, message: '请输入人数上限' }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="link" label="相关链接">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '更新' : '创建'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/activity')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ActivityForm;
