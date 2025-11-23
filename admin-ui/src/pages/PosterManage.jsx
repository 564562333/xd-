import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Select, Form, Space, message, Image, Row, Col, Spin } from 'antd';
import { PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import { getPosterTemplates, combinePoster, getActivityPosters, getActivityList, getRegistrationQRCode, getCheckinQRCode } from '../api/activity';
import apiClient from '../api/client';

const { Title, Text } = Typography;
const { Option } = Select;

const PosterManagePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activityPosters, setActivityPosters] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [generatedPoster, setGeneratedPoster] = useState('');

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      const res = await getPosterTemplates();
      if (res.code === 1) {
        setTemplates(res.data || []);
      } else {
        message.error(res.msg || '加载模板失败');
      }
    } catch (error) {
      message.error('加载模板失败');
    }
  };

  // 加载活动列表
  const loadActivities = async () => {
    try {
      const res = await getActivityList({ pageNum: 1, pageSize: 100 });
      if (res.code === 1) {
        setActivities(res.data?.list || []);
      }
    } catch (error) {
      message.error('加载活动列表失败');
    }
  };

  // 加载活动海报
  const loadActivityPosters = async (activityId) => {
    if (!activityId) return;
    
    setLoading(true);
    try {
      const res = await getActivityPosters(activityId);
      if (res.code === 1) {
        setActivityPosters(res.data || []);
      } else {
        message.error(res.msg || '加载海报失败');
        setActivityPosters([]);
      }
    } catch (error) {
      message.error('加载海报失败');
      setActivityPosters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadActivities();
  }, []);
  // 加载图片（注意：OSS 必须允许跨域请求或返回 CORS 头）
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  // 小工具：去掉 URL 的查询参数，兼容带签名的 OSS URL
  const stripQuery = (url) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      return u.origin + u.pathname;
    } catch (e) {
      return String(url).split('?')[0];
    }
  };

  // 小工具：带重试的请求（用于调用合成接口）
  const fetchWithRetry = async (params, attempts = 3) => {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        // 使用 apiClient 直接发起请求，附带 no-cache header 与短超时
        const res = await apiClient.get('/poster/combine', {
          params,
          headers: { 'Cache-Control': 'no-cache' },
          timeout: 15000,
        });
        return res;
      } catch (err) {
        lastErr = err;
        // 指数退避
        await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i)));
      }
    }
    throw lastErr;
  };

  // 前端 canvas 合成回退逻辑
  const combineClientSide = async (templateUrl, qrUrl) => {
    // templateUrl and qrUrl should be full signed URLs (include query) to allow browser fetch
    const [templateImg, qrImg] = await Promise.all([
      loadImage(templateUrl),
      loadImage(qrUrl),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
    const ctx = canvas.getContext('2d');

    // draw template
    ctx.drawImage(templateImg, 0, 0);

    // draw QR; position/size align with backend logic: overlay at 125,175 with 250x250
    const qrW = 250;
    const qrH = 250;
    const qrX = 125;
    const qrY = 175;
    ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);

    // 导出并下载
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('canvas toBlob 返回空'));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poster_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve(true);
      }, 'image/png');
    });
  };

  // 合成海报
  const handleCombine = async (values) => {
    if (!values.templateUrl || !values.activityId || !values.posterType) {
      message.warning('请选择模板、活动和海报类型');
      return;
    }

    setLoading(true);
    try {
      // 根据海报类型获取对应的二维码
      let qrRes;
      if (values.posterType === 'registration') {
        qrRes = await getRegistrationQRCode(values.activityId, { width: 300, height: 300 });
      } else if (values.posterType === 'checkin') {
        qrRes = await getCheckinQRCode(values.activityId, { width: 300, height: 300 });
      } else {
        message.error('未知的海报类型');
        return;
      }

      if (qrRes.code !== 1) {
        message.error('获取二维码失败');
        return;
      }

      const qrCodeUrl = qrRes.data;

      // 当后端期望不包含查询参数时，传递去掉 query 的 URL（后端不修改时的兼容处理）
      const templateUrlToServer = stripQuery(values.templateUrl);
      const qrCodeUrlToServer = stripQuery(qrCodeUrl);

      // 准备参数
      const params = {
        templateUrl: templateUrlToServer,
        qrCodeUrl: qrCodeUrlToServer,
        id: values.activityId,
      };

      let res;
      try {
        res = await fetchWithRetry(params, 3);
      } catch (err) {
        // 把 err 放到 res 处理路径下
        res = null;
      }

      if (res && res.code === 1) {
        message.success('海报生成成功');
        setGeneratedPoster(res.data);
        loadActivityPosters(values.activityId);
        return;
      }
      // 后端合成失败或返回异常，提示并尝试在前端合成并触发下载（回退方案，不修改后端）
      message.warning('后端合成失败或超时，尝试前端合成并下载');
      try {
        // 前端需要原始的带签名的 URL 以便浏览器能直接拉取图片
        await combineClientSide(values.templateUrl, qrCodeUrl);
        message.success('前端合成并下载完成');
      } catch (e) {
        console.error('前端合成失败', e);
        // 如果 canvas 导出失败，可能是 CORS 导致的污染
        message.error((res && res.msg) || '海报生成失败（后端+前端均失败，可能需 OSS 开启 CORS）');
      }
    } catch (error) {
      console.error('合成海报出错', error);
      message.error('海报生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载海报
  const downloadPoster = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `poster_${Date.now()}.png`;
    link.click();
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3}>海报管理</Title>

        <Form form={form} layout="vertical" onFinish={handleCombine} style={{ marginBottom: 30 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="activityId"
                label="选择活动"
                rules={[{ required: true, message: '请选择活动' }]}
              >
                <Select
                  placeholder="请选择活动"
                  onChange={(value) => {
                    setSelectedActivity(value);
                    loadActivityPosters(value);
                  }}
                >
                  {activities.map((act) => (
                    <Option key={act.id} value={act.id}>
                      {act.activityName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="posterType"
                label="海报类型"
                rules={[{ required: true, message: '请选择海报类型' }]}
              >
                <Select placeholder="请选择类型">
                  <Option value="registration">报名海报</Option>
                  <Option value="checkin">签到海报</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="templateUrl"
                label="选择模板"
                rules={[{ required: true, message: '请选择模板' }]}
              >
                <Select placeholder="请选择模板">
                  {templates.map((template, index) => (
                    <Option key={index} value={template}>
                      模板 {index + 1}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label=" ">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PictureOutlined />}
                  loading={loading}
                  block
                >
                  生成海报
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* 模板预览 */}
        {templates.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <Title level={4}>模板预览</Title>
            <Row gutter={16}>
              {templates.map((template, index) => (
                <Col key={index} span={6}>
                  <Card
                    hoverable
                    cover={<Image src={template} alt={`模板${index + 1}`} />}
                  >
                    <Card.Meta title={`模板 ${index + 1}`} />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* 新生成的海报 */}
        {generatedPoster && (
          <div style={{ marginBottom: 30 }}>
            <Title level={4}>最新生成的海报</Title>
            <Card style={{ maxWidth: 400 }}>
              <Image src={generatedPoster} alt="生成的海报" />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => downloadPoster(generatedPoster)}
                block
                style={{ marginTop: 10 }}
              >
                下载海报
              </Button>
            </Card>
          </div>
        )}

        {/* 活动已有海报 */}
        {selectedActivity && (
          <div>
            <Title level={4}>该活动的所有海报</Title>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : activityPosters.length > 0 ? (
              <Row gutter={16}>
                {activityPosters.map((poster, index) => (
                  <Col key={index} span={6}>
                    <Card
                      hoverable
                      cover={<Image src={poster} alt={`海报${index + 1}`} />}
                    >
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadPoster(poster)}
                        block
                      >
                        下载
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Text type="secondary">该活动暂无海报</Text>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PosterManagePage;
