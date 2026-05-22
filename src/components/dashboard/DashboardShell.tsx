"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Space } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";

const { Content, Sider } = Layout;

const menuItems = [
  {
    key: "/dashboard",
    icon: <HomeOutlined />,
    label: "Inicio",
  },
  {
    key: "/dashboard/minuta",
    icon: <FileTextOutlined />,
    label: "Minuta",
  },
  {
    key: "/dashboard/discursos",
    icon: <ReadOutlined />,
    label: "Discursos",
  },
];

function selectedKey(pathname: string) {
  if (pathname.startsWith("/dashboard/minuta")) {
    return "/dashboard/minuta";
  }

  if (pathname.startsWith("/dashboard/discursos")) {
    return "/dashboard/discursos";
  }

  return "/dashboard";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="dashboard-shell">
      <Sider
        width={264}
        collapsedWidth={80}
        collapsed={collapsed}
        collapsible
        className="dashboard-sider"
        breakpoint="lg"
        theme="light"
        trigger={null}
      >
        <div className="dashboard-collapse-row">
          <button
            className="dashboard-collapse-button"
            type="button"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        {!collapsed ? (
          <div className="dashboard-brand">
            <div className="dashboard-brand-mark">
              <SafetyCertificateOutlined />
            </div>
            <div className="dashboard-brand-copy">
              <Title level={4} style={{ margin: 0 }}>
                Obispado
              </Title>
              <Text className="dashboard-brand-subtitle">
                Panel sacramental
              </Text>
            </div>
          </div>
        ) : null}

        <Menu
          className="dashboard-menu"
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey(pathname)]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderInlineEnd: 0 }}
        />
      </Sider>

      <Layout className="dashboard-main">
        <Content className="dashboard-content">
          <div className="dashboard-content-actions">
            <Space orientation="horizontal">
              <Button href="/dashboard/minuta" icon={<CalendarOutlined />}>
                Minuta
              </Button>
              <Button
                type="primary"
                href="/dashboard/discursos/nuevo"
                icon={<PlusOutlined />}
              >
                Nuevo discurso
              </Button>
            </Space>
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
