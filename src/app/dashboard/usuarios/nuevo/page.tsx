"use client";

import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  message,
} from "antd";
import { useState } from "react";

type CreateUserFormValues = {
  name: string;
  lastname?: string;
  callings?: string;
  username?: string;
  phone?: string;
  password: string;
  role: string;
  active: boolean;
};

type CreateUserResponse = {
  success: boolean;
  error?: string;
};

const AddUserPage = () => {
  const [form] = Form.useForm<CreateUserFormValues>();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (values: CreateUserFormValues) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = (await response.json()) as CreateUserResponse;

      if (!response.ok || !result.success) {
        message.error(result.error || "No se pudo crear el usuario");
        return;
      }

      message.success("Usuario creado correctamente");
      form.resetFields();
    } catch {
      message.error("No se pudo crear el usuario");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <Card>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Agregar usuario
        </Typography.Title>

        <Typography.Paragraph type="secondary">
          Crear un usuario interno para acceder al dashboard.
        </Typography.Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: "Leader",
            active: true,
          }}
        >
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Ingrese el nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Apellido" name="lastname">
            <Input />
          </Form.Item>

          <Form.Item label="Llamamiento" name="callings">
            <Input placeholder="Ej: Consejero, Secretario, Líder misional" />
          </Form.Item>

          <Form.Item label="Usuario" name="username">
            <Input placeholder="Ej: consejero1" />
          </Form.Item>

          <Form.Item label="Teléfono" name="phone">
            <Input placeholder="Ej: 4611941121" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Ingrese una contraseña" },
              {
                min: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label="Rol"
            name="role"
            rules={[{ required: true, message: "Seleccione un rol" }]}
          >
            <Select
              options={[
                { label: "Admin", value: "Admin" },
                { label: "Obispado", value: "Bishopric" },
                { label: "Líder", value: "Leader" },
                { label: "Solo lectura", value: "Viewer" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Usuario activo"
            name="active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSaving}>
            Guardar usuario
          </Button>
        </Form>
      </Card>
    </main>
  );
};

export default AddUserPage;
