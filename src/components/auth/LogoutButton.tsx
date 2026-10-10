"use client";

import { Button, Tooltip } from "antd";
import { PoweroffOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <Tooltip title="Cerrar sesión" placement="bottom">
      <Button
        className="no-print"
        type="text"
        shape="circle"
        icon={<PoweroffOutlined />}
        onClick={handleLogout}
        aria-label="Cerrar sesión"
      />
    </Tooltip>
  );
};

export default LogoutButton;
