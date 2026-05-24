"use client";

import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <Button
      danger
      size="small"
      icon={<LogoutOutlined />}
      onClick={handleLogout}
    >
      Cerrar sesión
    </Button>
  );
};

export default LogoutButton;
