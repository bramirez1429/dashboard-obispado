"use client";

import { Card, Col, Row, Skeleton, Space } from "antd";

export default function DashboardLoading() {
  return (
    <div className="page-stack">
      <Card className="welcome-card">
        <div className="welcome-content">
          <Space orientation="vertical" size="small" style={{ width: "100%" }}>
            <Skeleton.Input active size="large" style={{ width: 260 }} />
            <Skeleton.Input active style={{ width: 420, maxWidth: "100%" }} />
          </Space>
          <Space className="welcome-actions" orientation="horizontal">
            <Skeleton.Button active size="large" style={{ width: 170 }} />
            <Skeleton.Button active size="large" style={{ width: 150 }} />
          </Space>
        </div>
      </Card>

      <Row gutter={[18, 18]}>
        {[0, 1, 2].map((item) => (
          <Col xs={24} md={8} key={item}>
            <Card className="dashboard-stat-card" style={{ height: "100%" }}>
              <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                <Skeleton.Input active style={{ width: 180 }} />
                <Skeleton.Avatar active size={44} shape="circle" />
                <Skeleton active paragraph={{ rows: 3 }} title={false} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} md={12}>
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
