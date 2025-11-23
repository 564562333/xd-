import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Space, Typography, message, Spin, Alert } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getActivityList } from '../api/user';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const STATUS_MAP = {
  1: { color: 'gold', text: '未发布' },
  2: { color: 'lime', text: '未开始报名' },
  3: { color: 'green', text: '报名中' },
  4: { color: 'cyan', text: '未开始' },
  5: { color: 'blue', text: '进行中' },
  6: { color: 'default', text: '已结束' },
};

const ActivityBrowsePage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await getActivityList({ pageNum: 1, pageSize: 100 });
      if (res.code === 1) {
        const data = res.data || {};
        const list = data.list || [];
        setActivities(list);
        setIsUnauthorized(list.length === 0);
      } else {
        message.error(res.msg || '获取活动列表失败');
        setActivities([]);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setIsUnauthorized(true);
        message.warning('未登录，无法获取活动列表');
      } else {
        message.error('请求失败');
      }
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (activityId) => {
    navigate(`/registration/${activityId}`);
  };

  const getStatusInfo = (status, registrationEnd, currentParticipants, maxParticipants) => {
    const isFull = currentParticipants >= maxParticipants;
    const isExpired = dayjs().isAfter(dayjs(registrationEnd));
    
    if (isFull) return { text: '已满员', color: 'red', disabled: true };
    if (isExpired) return { text: '报名已截止', color: 'default', disabled: true };
    if (status === 3) return { text: '立即报名', color: 'green', disabled: false };
    if (status === 2) return { text: '未开始', color: 'orange', disabled: true };
    if (status === 6) return { text: '已结束', color: 'default', disabled: true };
    return { text: '报名', color: 'blue', disabled: false };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: 'auto' }}>
      <Card>
        <Title level={2}>活动浏览</Title>
        <Paragraph type="secondary">
          浏览并报名感兴趣的活动，或扫描活动二维码快速报名
        </Paragraph>

        {isUnauthorized && (
          <Alert
            message="提示"
            description="活动列表接口需要登录权限，请通过扫描活动二维码或输入活动链接进行报名。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <List
          itemLayout="vertical"
          size="large"
          dataSource={activities}
          renderItem={(activity) => {
            const statusConfig = STATUS_MAP[activity.status] || { color: 'default', text: '未知' };
            const actionInfo = getStatusInfo(
              activity.status,
              activity.registrationEnd,
              activity.currentParticipants,
              activity.maxParticipants
            );

            return (
              <List.Item
                key={activity.id}
                actions={[
                  <Button
                    type="primary"
                    onClick={() => handleRegister(activity.id)}
                    disabled={actionInfo.disabled}
                  >
                    {actionInfo.text}
                  </Button>,
                ]}
                extra={
                  <div style={{ width: 200, textAlign: 'center' }}>
                    <Tag color={statusConfig.color} style={{ marginBottom: 8 }}>
                      {statusConfig.text}
                    </Tag>
                    <div>
                      <UserOutlined /> {activity.currentParticipants} / {activity.maxParticipants}
                    </div>
                  </div>
                }
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 18 }}>
                        {activity.activityName}
                      </Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>{activity.activityDescription}</Text>
                      <Space wrap>
                        <Text type="secondary">
                          <EnvironmentOutlined /> {activity.location}
                        </Text>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {activity.activityStart}
                        </Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        报名截止：{activity.registrationEnd}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default ActivityBrowsePage;
