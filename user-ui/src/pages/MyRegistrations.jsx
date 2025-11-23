import React, { useState } from 'react';
import { Form, Input, Button, Card, Table, message, Typography, Tag, Space, Alert } from 'antd';
import { SearchOutlined, QrcodeOutlined } from '@ant-design/icons';
import { getMyRegistrations } from '../api/user';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const STATUS_MAP = {
  1: { color: 'gold', text: '未发布' },
  2: { color: 'lime', text: '未开始报名' },
  3: { color: 'green', text: '报名中' },
  4: { color: 'cyan', text: '未开始' },
  5: { color: 'blue', text: '进行中' },
  6: { color: 'default', text: '已结束' },
};

const MyRegistrationsPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleSearch = async (values) => {
    const phone = values.phone;
    if (!phone) {
      message.warning('请输入手机号');
      return;
    }

    setLoading(true);
    try {
      const res = await getMyRegistrations(phone, pagination.current, pagination.pageSize);
      if (res.code === 1) {
        const data = res.data || {};
        setDataSource(data.list || []);
        setPagination({
          current: data.pageNum || 1,
          pageSize: data.pageSize || 10,
          total: data.total || 0,
        });
      } else {
        message.error(res.msg || '查询失败');
        setDataSource([]);
      }
    } catch (error) {
      message.error('请求失败');
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    const phone = form.getFieldValue('phone');
    if (!phone) return;

    setPagination(newPagination);
    setLoading(true);
    getMyRegistrations(phone, newPagination.current, newPagination.pageSize)
      .then((res) => {
        if (res.code === 1) {
          const data = res.data || {};
          setDataSource(data.list || []);
          setPagination({
            current: data.pageNum || newPagination.current,
            pageSize: data.pageSize || newPagination.pageSize,
            total: data.total || 0,
          });
        }
      })
      .catch(() => message.error('请求失败'))
      .finally(() => setLoading(false));
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
      width: 200,
    },
    {
      title: '活动状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = STATUS_MAP[status] || { color: 'default', text: '未知' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '活动地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '活动时间',
      key: 'activityTime',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            {record.activityStart ? dayjs(record.activityStart).format('YYYY-MM-DD HH:mm') : '-'}
          </Text>
          <Text type="secondary">至</Text>
          <Text>
            {record.activityEnd ? dayjs(record.activityEnd).format('YYYY-MM-DD HH:mm') : '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '报名时间',
      key: 'registrationTime',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            {record.registrationStart ? dayjs(record.registrationStart).format('YYYY-MM-DD HH:mm') : '-'}
          </Text>
          <Text type="secondary">至</Text>
          <Text>
            {record.registrationEnd ? dayjs(record.registrationEnd).format('YYYY-MM-DD HH:mm') : '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/registration/${record.id}`)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: 'auto' }}>
      <Card>
        <Title level={2}>活动管理系统 - 我的报名</Title>
        
        <Alert
          message="如何报名活动？"
          description={
            <Space direction="vertical">
              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>方式1：</Text> 扫描活动组织者提供的报名二维码
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>方式2：</Text> 点击活动组织者分享的报名链接
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                <Text strong>方式3：</Text> 直接访问 /registration/活动ID
              </Paragraph>
              <Paragraph style={{ marginBottom: 8, marginTop: 8 }}>
                填写报名信息（姓名、手机号、学院）提交后，即可在此页面查询报名记录。
              </Paragraph>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, marginTop: 16 }}
        />

        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 24, marginTop: 24 }}
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input placeholder="请输入报名时使用的手机号" style={{ width: 280 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
              查询
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          locale={{ emptyText: '暂无报名记录，请先输入手机号查询' }}
        />
      </Card>
    </div>
  );
};

export default MyRegistrationsPage;
