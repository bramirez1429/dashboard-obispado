"use client";

import { Button, Card, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";

type LoginValues = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push("/dashboard");
  };

  return (
    <main className="login-page">
      <Card className="login-card">
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Ingreso al dashboard
        </Typography.Title>

        <Typography.Paragraph type="secondary">
          Ingrese con el usuario asignado
        </Typography.Paragraph>

        <Form<LoginValues> layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Usuario o teléfono"
            name="identifier"
            rules={[{ required: true, message: "Ingrese el usuario o teléfono" }]}
          >
            <Input autoComplete="username" placeholder="Ej: consejero1 o 1161941121" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: "Ingrese la contraseña" }]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder="Ingrese su contraseña"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Ingresar
          </Button>
        </Form>
      </Card>
    </main>
  );
}
