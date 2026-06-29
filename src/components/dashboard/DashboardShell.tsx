"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  CheckSquareOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Space } from "antd";
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
  {
    key: "/dashboard/tareas",
    icon: <CheckSquareOutlined />,
    label: "Tareas",
  },
  {
    key: "/dashboard/usuarios",
    icon: <UserAddOutlined />,
    label: "Usuarios",
  },
];

const adminMenuItems = [
  {
    type: "group" as const,
    label: "Administradores",
    children: [
      {
        key: "/dashboard/admin/entrevistas",
        icon: <CalendarOutlined />,
        label: "Entrevistas",
      },
    ],
  },
];

function selectedKey(pathname: string) {
  if (pathname.startsWith("/dashboard/minuta")) {
    return "/dashboard/minuta";
  }

  if (pathname.startsWith("/dashboard/discursos")) {
    return "/dashboard/discursos";
  }

  if (pathname.startsWith("/dashboard/tareas")) {
    return "/dashboard/tareas";
  }

  if (pathname.startsWith("/dashboard/usuarios")) {
    return "/dashboard/usuarios";
  }

  if (pathname.startsWith("/dashboard/admin/entrevistas")) {
    return "/dashboard/admin/entrevistas";
  }

  return "/dashboard";
}

export function DashboardShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  userFullName: string;
  userCalling: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileSidebar, setIsMobileSidebar] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");

    const handleViewportChange = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobileSidebar(event.matches);

      if (event.matches) {
        setCollapsed(true);
      }
    }

    handleViewportChange(mediaQuery);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  return (
    <Layout className="dashboard-shell">
      {isMobileSidebar ? (
        <>
          <button
            className="dashboard-mobile-menu-button"
            type="button"
            aria-label={collapsed ? "Abrir menu" : "Cerrar menu"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <button
            className={`dashboard-mobile-overlay ${
              collapsed ? "" : "dashboard-mobile-overlay-open"
            }`}
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setCollapsed(true)}
          />
        </>
      ) : null}

      <Sider
        width={264}
        collapsedWidth={80}
        collapsed={collapsed}
        collapsible
        className={`dashboard-sider ${
          isMobileSidebar
            ? collapsed
              ? "dashboard-sider-mobile-closed"
              : "dashboard-sider-mobile-open"
            : ""
        }`}
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
          items={isAdmin ? [...menuItems, ...adminMenuItems] : menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ borderInlineEnd: 0 }}
        />
      </Sider>

      <Layout className="dashboard-main">
        <Content className="dashboard-content">
          <div className="dashboard-content-actions">
            <Space orientation="horizontal">
              <div className="dashboard-user-header">
             
                <LogoutButton />
              </div>
            </Space>
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
