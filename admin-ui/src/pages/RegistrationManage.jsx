import React, { useState } from 'react';
import { Form, Input, Button, Card, Table, message, Typography, Space, Modal, Select } from 'antd';
import { SearchOutlined, PlusOutlined, QrcodeOutlined } from '@ant-design/icons';
import { getRegistrationList, createRegistration, createCheckin, deleteRegistration } from '../api/activity';
import { getActivityList } from '../api/activity';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const RegistrationManagePage = () => {
  const [searchForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [checkinForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchedPhone, setSearchedPhone] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  
  const [activities, setActivities] = useState([]);

  const loadActivities = async () => {
    try {
      const res = await getActivityList({ pageNum: 1, pageSize: 100 });
      if (res.code === 1) {
        setActivities(res.data?.list || []);
      }
    } catch (error) {
      console.error('加载活动列表失败', error);
    }
  };

  React.useEffect(() => {
    loadActivities();
  }, []);

  // 搜索报名记录
  const handleSearch = async (values) => {
    if (!values.phone) {
      message.warning('请输入手机号');
      return;
    }

    setLoading(true);
    try {
      const res = await getRegistrationList({
        phone: values.phone,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
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
      }
    } catch (error) {
      message.error('查询失败');
    } finally {
      setLoading(false);
    }
    setSearchedPhone(values.phone || '');
  };

  const handleRegister = async (values) => {
    try {
      const res = await createRegistration(values);
      if (res.code === 1) {
        message.success('报名成功');
        setRegisterModalVisible(false);
        registerForm.resetFields();
        if (searchForm.getFieldValue('phone')) {
          handleSearch(searchForm.getFieldsValue());
        }
      } else {
        message.error(res.msg || '报名失败');
      }
    } catch (error) {
      message.error('报名失败');
    }
  };

  const handleCheckin = async (values) => {
    try {
      if (!navigator.geolocation) {
        message.error('浏览器不支持定位');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const data = {
            activityId: values.id,
            phone: values.phone,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          const res = await createCheckin(data);
          if (res.code === 1) {
            message.success('签到成功');
            setCheckinModalVisible(false);
            checkinForm.resetFields();
          } else {
            message.error(res.msg || '签到失败');
          }
        },
        () => {
          message.error('获取位置失败');
        }
      );
    } catch (error) {
      message.error('签到失败');
    }
  };

  // 取消报名
  const handleCancelRegistration = async (record) => {
    const phone = searchedPhone || searchForm.getFieldValue('phone');
    if (!phone) {
      message.warning('取消报名需要先输入手机号进行查询');
      return;
    }
    Modal.confirm({
      title: `确认取消 ${record.activityName} 的报名吗?`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteRegistration({ activityId: record.id, phone });
          if (res.code === 1) {
            message.success('取消报名成功');
            handleSearch({ phone });
          } else {
            message.error(res.msg || '取消报名失败');
          }
        } catch (e) {
          message.error('取消报名失败');
        }
      }
    });
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: (val) => val || '-',
    },
    {
      title: '报名',
      dataIndex: 'registrationStart',
      key: 'registrationStart',
      render: (val, record) => (
        <div>
          <div>{val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}</div>
          <div style={{ color: '#888' }}>{record.registrationEnd ? dayjs(record.registrationEnd).format('YYYY-MM-DD HH:mm') : '-'}</div>
        </div>
      ),
    },
    {
      title: '活动时间',
      dataIndex: 'activityStart',
      key: 'activityStart',
      render: (val, record) => (
        <div>
          <div>{val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}</div>
          <div style={{ color: '#888' }}>{record.activityEnd ? dayjs(record.activityEnd).format('YYYY-MM-DD HH:mm') : '-'}</div>
        </div>
      ),
    },
    // 人数列已移除，应由后端提供精确的报名明细时再显示
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val) => {
        switch (val) {
          case 1: return '未发布';
          case 2: return '未开始报名';
          case 3: return '报名中';
          case 4: return '未开始';
          case 5: return '进行中';
          case 6: return '已结束';
          default: return `${val}`;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          disabled={!searchedPhone}
          onClick={() => handleCancelRegistration(record)}
        >
          取消报名
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>报名管理</Title>
        <div style={{ marginBottom: 10, color: '#888' }}>
          注：管理员可以代用户报名和签到，或查询报名记录。
        </div>
        
        <Form form={searchForm} layout="inline" onFinish={handleSearch} style={{ marginBottom: 20 }}>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setRegisterModalVisible(true)}>
                代用户报名
              </Button>
              <Button icon={<QrcodeOutlined />} onClick={() => setCheckinModalVisible(true)}>
                代用户签到
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
              const phone = searchForm.getFieldValue('phone');
              if (phone) {
                handleSearch({ phone });
              }
            },
          }}
        />
      </Card>

      <Modal
        title="代用户报名"
        open={registerModalVisible}
        onCancel={() => {
          setRegisterModalVisible(false);
          registerForm.resetFields();
        }}
        footer={null}
      >
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item name="activityId" label="活动" rules={[{ required: true, message: '请选择活动' }]}>
            <Select placeholder="请选择活动">
              {activities.map(act => (
                <Option key={act.id} value={act.id}>{act.activityName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="registrationName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="college" label="学院" rules={[{ required: true, message: '请输入学院' }]}>
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认报名
              </Button>
              <Button onClick={() => {
                setRegisterModalVisible(false);
                registerForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="代用户签到"
        open={checkinModalVisible}
        onCancel={() => {
          setCheckinModalVisible(false);
          checkinForm.resetFields();
        }}
        footer={null}
      >
        <Form form={checkinForm} layout="vertical" onFinish={handleCheckin}>
          <Form.Item name="id" label="活动ID" rules={[{ required: true, message: '请输入活动ID' }]}>
            <Input placeholder="请输入活动ID" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认签到
              </Button>
              <Button onClick={() => {
                setCheckinModalVisible(false);
                checkinForm.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationManagePage;
