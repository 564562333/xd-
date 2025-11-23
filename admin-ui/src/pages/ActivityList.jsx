import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Form,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  message,
  Popconfirm,
  Image,
  Card,
  Typography,
} from 'antd';
import { PlusOutlined, QrcodeOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getActivityList, deleteActivity, getRegistrationQRCode, getCheckinQRCode, getActivityPosters } from '../api/activity';
import dayjs from 'dayjs';


const { Option } = Select;

const STATUS_MAP = {
  1: { color: 'gold', text: '未发布' },
  2: { color: 'lime', text: '未开始报名' },
  3: { color: 'green', text: '报名中' },
  4: { color: 'cyan', text: '未开始' },
  5: { color: 'blue', text: '进行中' },
  6: { color: 'default', text: '已结束' },
};

const formatDateTime = (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

const ActivityListPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [qrCodeModal, setQrCodeModal] = useState({ visible: false, url: '', type: '' });
  const [posterModal, setPosterModal] = useState({
    visible: false,
    activityName: '',
    posters: [],
    loading: false,
  });
  const [isMobile, setIsMobile] = useState(false);

  const fetchActivities = async (pageNum = pagination.current, pageSize = pagination.pageSize, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        pageNum,
        pageSize,
        ...currentFilters,
      };
      const res = await getActivityList(params);
      if (res.code === 1) {
        const data = res.data || {};
        setActivities(data.list || []);
        setPagination({
          current: data.pageNum || pageNum,
          pageSize: data.pageSize || pageSize,
          total: data.total || 0,
        });
      } else {
        message.error(res.msg || '获取活动列表失败');
      }
    } catch (error) {
      message.error('请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, pagination.pageSize, {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleTableChange = (newPagination) => {
    fetchActivities(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (values) => {
    const processedFilters = {
      activityName: values.activityName || undefined,
      status: values.status,
      location: values.location || undefined,
      isFull: values.isFull === undefined ? undefined : values.isFull === 'true',
    };
    setFilters(processedFilters);
    fetchActivities(1, pagination.pageSize, processedFilters);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({});
    fetchActivities(1, pagination.pageSize, {});
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteActivity(id);
      if (res.code === 1) {
        message.success('删除成功');
        fetchActivities();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      message.error('请求失败');
    }
  };

  const handleShowQrCode = async (id, type) => {
    try {
      let res;
      if (type === 'registration') {
        res = await getRegistrationQRCode(id, { width: 300, height: 300 });
      } else if (type === 'checkin') {
        res = await getCheckinQRCode(id, { width: 300, height: 300 });
      } else {
        message.error('未知的二维码类型');
        return;
      }
      
      if (res.code === 1) {
        setQrCodeModal({ 
          visible: true, 
          url: res.data, 
          type: type === 'registration' ? '报名' : '签到' 
        });
      } else {
        message.error(res.msg || '获取二维码失败');
      }
    } catch (error) {
      message.error('请求失败');
    }
  };

  const handleShowPosters = async (id, activityName) => {
    setPosterModal({ visible: true, activityName, posters: [], loading: true });
    try {
      const res = await getActivityPosters(id);
      if (res.code === 1) {
        setPosterModal((prev) => ({
          ...prev,
          posters: res.data || [],
          loading: false,
        }));
      } else {
        message.error(res.msg || '获取海报失败');
        setPosterModal({ visible: false, activityName: '', posters: [], loading: false });
      }
    } catch (error) {
      message.error('请求失败');
      setPosterModal({ visible: false, activityName: '', posters: [], loading: false });
    }
  };

  const handleDownloadPoster = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `poster_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { title: '活动名称', dataIndex: 'activityName', key: 'activityName' },
    { title: '活动简介', dataIndex: 'activityDescription', key: 'activityDescription', render: (text) => text || '-' },
    { title: '报名时间', key: 'registrationTime', render: (_, record) => `${formatDateTime(record.registrationStart)} ~ ${formatDateTime(record.registrationEnd)}` },
    { title: '活动时间', key: 'activityTime', render: (_, record) => `${formatDateTime(record.activityStart)} ~ ${formatDateTime(record.activityEnd)}` },
    { title: '活动地点', dataIndex: 'location', key: 'location', render: (text) => text || '-' },
    { title: '报名情况', key: 'quota', render: (_, record) => {
        const current = record.currentParticipants ?? 0;
        const max = record.maxParticipants ?? 0;
        return `${current} / ${max}`;
      } },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status) => {
        const config = STATUS_MAP[status] || {};
        return <Tag color={config.color}>{config.text || '未知'}</Tag>;
      } },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/activity/edit/${record.id}`)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
          <Button type="link" icon={<QrcodeOutlined />} onClick={() => handleShowQrCode(record.id, 'registration')}>
            报名码
          </Button>
          <Button type="link" icon={<QrcodeOutlined />} onClick={() => handleShowQrCode(record.id, 'checkin')}>
            签到码
          </Button>
          <Button type="link" icon={<PictureOutlined />} onClick={() => handleShowPosters(record.id, record.activityName)}>
            查看海报
          </Button>
        </Space>
      ),
    },
  ];

  const { Paragraph, Text } = Typography;

  return (
    <div>
      <Form form={form} onFinish={handleSearch} layout="vertical" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="activityName" label="活动名称">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="活动状态">
              <Select placeholder="请选择" allowClear>
                {Object.entries(STATUS_MAP).map(([value, item]) => (
                  <Option key={value} value={Number(value)}>{item.text}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isFull" label="是否已满">
              <Select placeholder="请选择" allowClear>
                <Option value="true">已满</Option>
                <Option value="false">未满</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="location" label="活动地点">
              <Input placeholder="请输入" allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">搜索</Button>
            <Button style={{ margin: '0 8px' }} onClick={handleReset}>重置</Button>
          </Col>
        </Row>
      </Form>

      <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/activity/new')} style={{ marginBottom: 16 }}>
        新建活动
      </Button>

      {!isMobile ? (
        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {activities.map((record) => (
            <Card key={record.id} size="small" bordered>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{record.activityName}</div>
                  <Paragraph ellipsis={{ rows: 2 }}>{record.activityDescription || '-'}</Paragraph>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <div>报名：{formatDateTime(record.registrationStart)} ~ {formatDateTime(record.registrationEnd)}</div>
                    <div>活动：{formatDateTime(record.activityStart)} ~ {formatDateTime(record.activityEnd)}</div>
                    <div>地点：{record.location || '-'}</div>
                    <div>报名：{(record.currentParticipants ?? 0)} / {(record.maxParticipants ?? 0)}</div>
                    <div style={{ marginTop: 6 }}><Tag color={(STATUS_MAP[record.status] || {}).color}>{(STATUS_MAP[record.status] || {}).text || '未知'}</Tag></div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Space wrap>
                  <Button size="small" onClick={() => navigate(`/activity/edit/${record.id}`)}>编辑</Button>
                  <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
                    <Button size="small" danger>删除</Button>
                  </Popconfirm>
                  <Button size="small" icon={<QrcodeOutlined />} onClick={() => handleShowQrCode(record.id, 'registration')}>报名码</Button>
                  <Button size="small" icon={<QrcodeOutlined />} onClick={() => handleShowQrCode(record.id, 'checkin')}>签到码</Button>
                  <Button size="small" icon={<PictureOutlined />} onClick={() => handleShowPosters(record.id, record.activityName)}>海报</Button>
                </Space>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={`${qrCodeModal.type}二维码`}
        open={qrCodeModal.visible}
        onCancel={() => setQrCodeModal({ visible: false, url: '', type: '' })}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {qrCodeModal.url ? (
            <>
              <Image src={qrCodeModal.url} alt="二维码" width={300} />
              <p style={{ marginTop: 10 }}>请使用手机扫描二维码</p>
            </>
          ) : (
            <p>暂无二维码</p>
          )}
        </div>
      </Modal>

      <Modal
        title={`${posterModal.activityName} - 活动海报`}
        open={posterModal.visible}
        onCancel={() => setPosterModal({ visible: false, activityName: '', posters: [], loading: false })}
        footer={null}
        width={800}
        centered
      >
        <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '20px' }}>
          {posterModal.loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
          ) : posterModal.posters.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {posterModal.posters.map((posterUrl, index) => (
                <div key={index} style={{ border: '1px solid #f0f0f0', borderRadius: '8px', padding: '12px', background: '#fafafa' }}>
                  <Image
                    src={posterUrl}
                    alt={`海报 ${index + 1}`}
                    style={{ width: '100%', borderRadius: '4px' }}
                    preview={{
                      mask: '预览',
                    }}
                  />
                  <Button
                    type="primary"
                    size="small"
                    block
                    style={{ marginTop: '8px' }}
                    onClick={() => handleDownloadPoster(posterUrl)}
                  >
                    下载海报
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无海报</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ActivityListPage;
