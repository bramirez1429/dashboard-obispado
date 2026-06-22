"use client";

import {
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Empty, Flex, QRCode, Row, Space, Tag, Typography } from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { getDashboardSpeechSummary } from "@/lib/dashboard-summary";
import { normalizeSpeechStatus } from "@/lib/speeches";

type DashboardHomeSummary = {
  minute?: {
    status: string;
    sunday: string;
  };
  speeches?: {
    sunday: string;
    items: Array<{
      id: string;
      name: string;
      speech: string;
      time?: number | null;
      status?: "pending" | "shared";
    }>;
  };
};

const defaultDashboardSummary: Required<DashboardHomeSummary> = {
  minute: {
    status: "Minuta en preparación",
    sunday: "Sin fecha",
  },
  speeches: {
    sunday: "Sin fecha",
    items: [],
  },
};

export function DashboardHome({
  fullName,
  calling,
  summary,
}: {
  fullName: string;
  calling?: string;
  summary?: DashboardHomeSummary;
}) {
  const safeSummary = {
    minute: summary?.minute ?? defaultDashboardSummary.minute,
    speeches: {
      sunday: summary?.speeches?.sunday ?? defaultDashboardSummary.speeches.sunday,
      items: summary?.speeches?.items ?? defaultDashboardSummary.speeches.items,
    },
  };
  const assignedSpeeches = safeSummary.speeches.items.map((speech) => ({
    ...speech,
    status: normalizeSpeechStatus(speech.status),
  }));
  const speechSummary = getDashboardSpeechSummary(assignedSpeeches);

  const cards = [
    {
      title: "Reunión sacramental",
      href: "/reunion-sacramental",
      icon: null,
      content: (
        <Flex vertical align="center" gap={12}>
          <QRCode
            errorLevel="H"
            value="https://dashboard-obispado.vercel.app/reunion-sacramental"
            icon="/images/lds-tools-icon.png"
            size={160}
          />
          <Typography.Text type="secondary" style={{ textAlign: "center" }}>
            Escaneá para compartir la reunión.
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Minuta sacramental",
      href: "/dashboard/minuta",
      icon: <FileTextOutlined />,
      content: (
        <>
          <Title level={4} style={{ margin: 0 }}>
            {safeSummary.minute.status}
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            Domingo: {safeSummary.minute.sunday}
          </Paragraph>
        </>
      ),
    },
    {
      title: "Discursos asignados",
      href: "/dashboard/discursos",
      icon: <ReadOutlined />,
      content: (
        <>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            Domingo: {safeSummary.speeches.sunday}
          </Paragraph>
          {assignedSpeeches.length ? (
            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              <div className="dashboard-speech-summary">
                <span>Total: {speechSummary.total} discursos</span>
                <span>
                  Compartidos:{" "}
                  <Tag color="success" style={{ marginInlineEnd: 0 }}>
                    {speechSummary.shared}
                  </Tag>
                </span>
                <span>
                  Pendientes:{" "}
                  <Tag color="warning" style={{ marginInlineEnd: 0 }}>
                    {speechSummary.pending}
                  </Tag>
                </span>
              </div>
            </Space>
          ) : (
            <Empty description="Vacío" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </>
      ),
    },
    {
      title: "Mensajes temporales",
      href: "/dashboard/discursos/nuevo",
      icon: <ClockCircleOutlined />,
      content: (
        <Title level={4} style={{ margin: 0 }}>
          Trabajando
        </Title>
      ),
    },
  ];

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
          <Col xs={24} md={8} key={item.title}>
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
              {item.icon ? (
                <div className="dashboard-card-icon dashboard-card-icon-blue">
                  {item.icon}
                </div>
              ) : null}
              <div className="dashboard-card-content">{item.content}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
