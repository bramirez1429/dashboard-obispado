"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

type MessageRow = {
  id: string;
  hermano: string;
  tema: string;
  fecha: string;
  estado: "Compartido" | "Pendiente" | "Borrador";
  link: string;
};

const data: MessageRow[] = [
  {
    id: "M-2026-AF31D2",
    hermano: "Juan Perez",
    tema: "Fe en Jesucristo",
    fecha: "07/06/2026",
    estado: "Compartido",
    link: "/m/M-2026-AF31D2",
  },
  {
    id: "M-2026-BE901C",
    hermano: "Carlos Gomez",
    tema: "Servicio cristiano",
    fecha: "14/06/2026",
    estado: "Pendiente",
    link: "/m/M-2026-BE901C",
  },
  {
    id: "M-2026-CD7740",
    hermano: "Miguel Lopez",
    tema: "Convenios",
    fecha: "21/06/2026",
    estado: "Borrador",
    link: "/m/M-2026-CD7740",
  },
];

const columns: ColumnsType<MessageRow> = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Hermano", dataIndex: "hermano", key: "hermano" },
  { title: "Tema", dataIndex: "tema", key: "tema" },
  { title: "Fecha", dataIndex: "fecha", key: "fecha" },
  {
    title: "Estado",
    dataIndex: "estado",
    key: "estado",
    render: (estado: MessageRow["estado"]) => {
      const color =
        estado === "Compartido"
          ? "success"
          : estado === "Pendiente"
            ? "warning"
            : "processing";

      return (
        <Tag className="status-tag" color={color}>
          {estado}
        </Tag>
      );
    },
  },
  {
    title: "Link",
    dataIndex: "link",
    key: "link",
    render: (link: string) => (
      <Button type="link" href={link}>
        Ver
      </Button>
    ),
  },
];

export default function DiscursosPage() {
  return (
    <div className="page-stack">
      <Card className="table-card">
        <Space className="section-toolbar" orientation="horizontal">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Discursos
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Seguimiento de mensajes asignados y enlaces públicos.
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            href="/dashboard/discursos/nuevo"
            icon={<PlusOutlined />}
          >
            Nuevo mensaje
          </Button>
        </Space>

        <Table
          className="messages-table"
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Card>
    </div>
  );
}
