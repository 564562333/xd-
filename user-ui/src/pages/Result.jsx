import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status') || 'info';
  const title = searchParams.get('title') || '提示';
  const message = searchParams.get('message') || '';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status={status}
        title={title}
        subTitle={message}
        extra={[
          <Button type="primary" key="console" onClick={() => navigate(-2)}>
            返回
          </Button>,
        ]}
      />
    </div>
  );
};

export default ResultPage;
