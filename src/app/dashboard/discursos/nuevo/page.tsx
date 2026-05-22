"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Space,
} from "antd";
import { LinkOutlined, SendOutlined } from "@ant-design/icons";
import { MessagePreviewCard } from "@/components/discursos/MessagePreviewCard";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import type { Dayjs } from "dayjs";

const { TextArea } = Input;

type FormValues = {
  brotherName?: string;
  date?: Dayjs;
  topic?: string;
  minutes?: number;
  references?: string;
  instructions?: string;
};

function createMockId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");

  return `M-2026-${suffix}`;
}

export default function NewSpeechPage() {
  const [mockId, setMockId] = useState<string>();
  const [form] = Form.useForm<FormValues>();
  const values = Form.useWatch([], form) ?? {};

  const mockLink = useMemo(
    () => (mockId ? `http://localhost:3000/m/${mockId}` : undefined),
    [mockId],
  );

  return (
    <div className="page-stack">
      <div className="page-heading">
        <Title level={2} style={{ margin: 0 }}>
          Nuevo mensaje
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Prepará la información del discurso y generá un enlace para compartir.
        </Paragraph>
      </div>

      <div className="new-message-grid">
        <Card className="form-card" title="Datos del discurso">
          <Form
            form={form}
            layout="vertical"
            onFinish={() => setMockId(createMockId())}
          >
            <Form.Item label="Nombre completo del hermano" name="brotherName">
              <Input placeholder="Ej. Juan Perez" />
            </Form.Item>

            <Form.Item label="Fecha del discurso" name="date">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Tema" name="topic">
              <Input placeholder="Ej. Fe en Jesucristo" />
            </Form.Item>

            <Form.Item label="Tiempo asignado" name="minutes">
              <InputNumber
                min={1}
                max={30}
                addonAfter="minutos"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item label="Referencias" name="references">
              <TextArea
                rows={3}
                placeholder="Escrituras, discursos o enlaces de referencia"
              />
            </Form.Item>

            <Form.Item label="Instrucciones adicionales" name="instructions">
              <TextArea
                rows={4}
                placeholder="Indicaciones pastorales o enfoque sugerido"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Generar link de mensaje
            </Button>
          </Form>
        </Card>

        <div className="preview-stack">
          {mockId && mockLink ? (
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              <Alert
                type="info"
                showIcon
                icon={<LinkOutlined />}
                title="Link público de solo lectura"
                description={
                  <a href={mockLink} target="_blank" rel="noreferrer">
                    {mockLink}
                  </a>
                }
              />
              <MessagePreviewCard
                id={mockId}
                hermano={values.brotherName || "Hermano de ejemplo"}
                tema={values.topic || "Tema de ejemplo"}
                fecha={
                  values.date
                    ? values.date.format("DD/MM/YYYY")
                    : "Fecha seleccionada"
                }
                referencias={values.references || "Referencias de ejemplo"}
                instrucciones={values.instructions || "Instrucciones de ejemplo"}
              />
            </Space>
          ) : (
            <Card className="empty-preview-card">
              <Title level={4} style={{ marginTop: 0 }}>
                Vista previa
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Completa el formulario y genera un link para ver la tarjeta del
                mensaje.
              </Paragraph>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
