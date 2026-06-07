"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, message } from "antd";
import Title from "antd/es/typography/Title";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const { TextArea } = Input;

type Gender = "masculine" | "feminine";

type EditSpeechFormValues = {
  name: string;
  gender: Gender;
  date: Dayjs | null;
  speech: string;
  time: number;
  references?: string;
};

type SpeechResponse = {
  success: boolean;
  data?: {
    name?: string | null;
    gender?: Gender | null;
    date?: string | null;
    speech?: string | null;
    time?: number | null;
    references?: string | null;
  };
  error?: string;
};

const genderOptions = [
  { value: "masculine", label: "Masculino" },
  { value: "feminine", label: "Femenino" },
];

export default function EditSpeechForm() {
  const [form] = Form.useForm<EditSpeechFormValues>();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSpeech = async () => {
      try {
        const response = await fetch(`/api/speeches/${params.id}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as SpeechResponse;

        if (!response.ok || !result.success || !result.data) {
          message.error(result.error || "No se pudo cargar el discurso");
          return;
        }

        form.setFieldsValue({
          name: result.data.name || "",
          gender: result.data.gender || "masculine",
          date: result.data.date ? dayjs(result.data.date) : null,
          speech: result.data.speech || "",
          time: result.data.time || 10,
          references: result.data.references || "",
        });
      } catch {
        message.error("No se pudo cargar el discurso");
      }
    };

    void loadSpeech();
  }, [form, params.id]);

  const handleSubmit = async (values: EditSpeechFormValues) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/speeches/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          gender: values.gender,
          date: values.date ? values.date.format("YYYY-MM-DD") : "",
          speech: values.speech.trim(),
          time: values.time,
          references: values.references?.trim() || "",
        }),
      });
      const result = (await response.json()) as SpeechResponse;

      if (!response.ok || !result.success) {
        message.error(result.error || "No se pudo guardar el discurso");
        return;
      }

      message.success("Discurso guardado correctamente");
      router.push("/dashboard/discursos");
    } catch {
      message.error("No se pudo guardar el discurso");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <Card className="form-card">
        <Space align="start">
          <Link href="/dashboard/discursos" prefetch={false}>
            <Button
              aria-label="Volver"
              icon={<ArrowLeftOutlined />}
              shape="circle"
            />
          </Link>
          <Title level={3} style={{ marginTop: 0 }}>
            Editar discurso
          </Title>
        </Space>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Género"
            name="gender"
            rules={[{ required: true, message: "Seleccione un género" }]}
          >
            <Select options={genderOptions} />
          </Form.Item>

          <Form.Item
            label="Nombre del hermano/a"
            name="name"
            rules={[{ required: true, message: "Ingrese el nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Fecha del discurso"
            name="date"
            rules={[{ required: true, message: "Seleccione la fecha" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Tema"
            name="speech"
            rules={[{ required: true, message: "Ingrese el tema" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tiempo asignado"
            name="time"
            rules={[{ required: true, message: "Ingrese el tiempo" }]}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Referencias" name="references">
            <TextArea rows={3} />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Guardar cambios
            </Button>
            <Link href="/dashboard/discursos" prefetch={false}>
              <Button>Cancelar</Button>
            </Link>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
