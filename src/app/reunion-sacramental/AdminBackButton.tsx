"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

export default function AdminBackButton() {
  return (
    <div style={{ padding: "16px 16px 0", background: "#eef3f7" }}>
      <Link href="/dashboard/minuta" prefetch={false}>
        <Button icon={<ArrowLeftOutlined />}>Volver</Button>
      </Link>
    </div>
  );
}
