"use client";

import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Statistic } from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

const cards = [
  {
    title: "Minuta sacramental",
    value: 1,
    suffix: "en preparaciÃ³n",
    description: "Hoja semanal lista para completar e imprimir.",
    href: "/dashboard/minuta",
    icon: <FileTextOutlined />,
    color: "blue",
  },
  {
    title: "Discursos asignados",
    value: 3,
    suffix: "activos",
    description: "Mensajes con tema, fecha y link pÃºblico de referencia.",
    href: "/dashboard/discursos",
    icon: <ReadOutlined />,
    color: "blue",
  },
  {
    title: "Mensajes temporales",
    value: 2,
    suffix: "borradores",
    description: "Asignaciones listas para revisar y compartir.",
    href: "/dashboard/discursos/nuevo",
    icon: <ClockCircleOutlined />,
    color: "blue",
  },
  {
    title: "Historial anual",
    value: 2026,
    suffix: "",
    description: "Base visual para consultar minutas y discursos por aÃ±o.",
    href: "/dashboard",
    icon: <CalendarOutlined />,
    color: "blue",
  },
];

export function DashboardHome({
  fullName,
  calling,
}: {
  fullName: string;
  calling: string;
}) {
  return (
    <div className="page-stack">
      <Card className="welcome-card">
        <div className="welcome-content">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {fullName}
            </Title>
            <Paragraph
              type="secondary"
              style={{ maxWidth: 720, marginBottom: 0 }}
            >
              {calling}
            </Paragraph>
          </div>
          <Space className="welcome-actions" orientation="horizontal">
            <Button
              type="primary"
              size="large"
              href="/dashboard/minuta"
              icon={<FileTextOutlined />}
            >
              Completar minuta
            </Button>
            <Button
              size="large"
              href="/dashboard/discursos/nuevo"
              icon={<PlusOutlined />}
            >
              Nuevo discurso
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[18, 18]}>
        {cards.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card
              className="dashboard-stat-card"
              title={item.title}
              extra={
                <Button type="link" href={item.href}>
                  Abrir
                </Button>
              }
              style={{ height: "100%" }}
            >
              <div
                className={`dashboard-card-icon dashboard-card-icon-${item.color}`}
              >
                {item.icon}
              </div>
              <Statistic value={item.value} suffix={item.suffix} />

              <Paragraph
                type="secondary"
                style={{ marginTop: 16, marginBottom: 0 }}
              >
                {item.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
