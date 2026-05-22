"use client";

import { Card, Descriptions, Tag } from "antd";
import { ReadOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";

type MessagePreviewCardProps = {
  id: string;
  hermano: string;
  tema: string;
  fecha: string;
  referencias: string;
  instrucciones: string;
  status?: "Pendiente" | "Compartido" | "Borrador";
};

export function MessagePreviewCard({
  id,
  hermano,
  tema,
  fecha,
  referencias,
  instrucciones,
  status = "Borrador",
}: MessagePreviewCardProps) {
  return (
    <Card
      className="message-preview-card"
      title="Vista previa del mensaje"
      extra={
        <Tag color={status === "Compartido" ? "green" : "blue"}>{status}</Tag>
      }
    >
      <div className="message-preview-icon">
        <ReadOutlined />
      </div>
      <Title level={4} style={{ marginTop: 0 }}>
        {tema}
      </Title>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="ID">{id}</Descriptions.Item>
        <Descriptions.Item label="Hermano">{hermano}</Descriptions.Item>
        <Descriptions.Item label="Fecha">{fecha}</Descriptions.Item>
        <Descriptions.Item label="Referencias">{referencias}</Descriptions.Item>
        <Descriptions.Item label="Instrucciones">
          {instrucciones}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
