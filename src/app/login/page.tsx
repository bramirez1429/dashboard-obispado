"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginValues = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      identifier: values.identifier,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setIsSubmitting(false);
      message.error("Usuario o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="login-page">
      <Card className="login-card">
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Iniciar sesión
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
            <Input
              autoComplete="username"
              className="login-input"
              placeholder="Ej: consejero1 o 1161941121"
            />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: "Ingrese la contraseña" }]}
          >
            <Input.Password
              autoComplete="current-password"
              className="login-input login-password-input"
              placeholder="Ingrese su contraseña"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Ingresar
          </Button>
        </Form>
      </Card>
    </main>
  );
}
