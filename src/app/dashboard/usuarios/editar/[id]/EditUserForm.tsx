"use client";

import { Button, Card, Form, Input, Select, Space, Typography, message } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EditUserFormValues = {
  name: string;
  username: string;
  role: string;
};

type UserResponse = {
  success: boolean;
  data?: EditUserFormValues;
  error?: string;
};

const roleOptions = [
  { label: "Admin", value: "Admin" },
  { label: "Gestion", value: "Bishopric" },
  { label: "Colaborador", value: "Leader" },
  { label: "Lectura", value: "Viewer" },
];

export default function EditUserForm() {
  const [form] = Form.useForm<EditUserFormValues>();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as UserResponse;

        if (!response.ok || !result.success || !result.data) {
          message.error(result.error || "No se pudo cargar el usuario");
          return;
        }

        form.setFieldsValue({
          name: result.data.name || "",
          username: result.data.username || "",
          role: result.data.role || "Leader",
        });
      } catch {
        message.error("No se pudo cargar el usuario");
      }
    };

    void loadUser();
  }, [form, params.id]);

  const handleSubmit = async (values: EditUserFormValues) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as UserResponse;

      if (!response.ok || !result.success) {
        message.error(result.error || "No se pudo guardar el usuario");
        return;
      }

      message.success("Usuario guardado correctamente");
      router.push("/dashboard/usuarios");
    } catch {
      message.error("No se pudo guardar el usuario");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Editar usuario
        </Typography.Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Ingrese el nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="username"
            rules={[{ required: true, message: "Ingrese el email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Rol"
            name="role"
            rules={[{ required: true, message: "Seleccione un rol" }]}
          >
            <Select options={roleOptions} />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Guardar cambios
            </Button>
            <Link href="/dashboard/usuarios" prefetch={false}>
              <Button>Cancelar</Button>
            </Link>
          </Space>
        </Form>
      </Card>
    </main>
  );
}
