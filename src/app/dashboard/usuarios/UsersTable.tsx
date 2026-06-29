"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Flex,
  Grid,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardUser = {
  id: number | string;
  user_uuid?: string | null;
  name?: string | null;
  lastname?: string | null;
  username?: string | null;
  role?: string | null;
};

type UsersResponse = {
  success: boolean;
  data?: DashboardUser[];
  currentUserUuid?: string;
  error?: string;
};

type DeleteResponse = {
  success: boolean;
  error?: string;
};

const roleLabels: Record<string, string> = {
  Admin: "Admin",
  Bishopric: "Gestion",
  Leader: "Colaborador",
  Viewer: "Lectura",
};

export default function UsersTable() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [currentUserUuid, setCurrentUserUuid] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | number>();

  const loadUsers = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const result = (await response.json()) as UsersResponse;

      if (!response.ok || !result.success) {
        message.error(result.error || "No se pudieron cargar los usuarios");
        return;
      }

      setUsers(result.data ?? []);
      setCurrentUserUuid(result.currentUserUuid);
    } catch {
      message.error("No se pudieron cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleDeleteUser = (user: DashboardUser) => {
    if (user.user_uuid && user.user_uuid === currentUserUuid) {
      message.warning("No podés borrar el usuario actualmente logueado");
      return;
    }

    Modal.confirm({
      title: "Borrar usuario",
      content: `¿Seguro que querés borrar a ${user.name || user.username || "este usuario"}?`,
      okText: "Borrar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        setDeletingUserId(user.id);

        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: "DELETE",
          });
          const result = (await response.json()) as DeleteResponse;

          if (!response.ok || !result.success) {
            message.error(result.error || "No se pudo borrar el usuario");
            return;
          }

          message.success("Usuario borrado correctamente");
          await loadUsers();
        } catch {
          message.error("No se pudo borrar el usuario");
        } finally {
          setDeletingUserId(undefined);
        }
      },
    });
  };

  const columns: ColumnsType<DashboardUser> = [
    {
      title: "Nombre y apellido",
      key: "name",
      render: (_, user) =>
        `${user.name || ""} ${user.lastname || ""}`.trim() || "-",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (value?: string | null) => (value ? roleLabels[value] || value : "-"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, user) => (
        <Space>
          <Link href={`/dashboard/usuarios/editar/${user.id}`} prefetch={false}>
            <Button
              aria-label="Editar usuario"
              icon={<EditOutlined />}
              size="small"
            />
          </Link>
          <Button
            aria-label="Borrar usuario"
            danger
            icon={<DeleteOutlined />}
            size="small"
            loading={deletingUserId === user.id}
            onClick={() => handleDeleteUser(user)}
          />
        </Space>
      ),
    },
  ];

  return (
    <main style={{ padding: isMobile ? 12 : 24 }}>
      <Card>
        <Flex
          align={isMobile ? "stretch" : "start"}
          vertical={isMobile}
          gap={16}
          style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}
        >
          <div>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              Usuarios
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Administrar usuarios internos del dashboard.
            </Typography.Paragraph>
          </div>
          <Link href="/dashboard/usuarios/nuevo" prefetch={false}>
            <Button type="primary" block={isMobile}>
              Crear usuario
            </Button>
          </Link>
        </Flex>

        {isMobile ? (
          <Flex vertical gap={12}>
            {isLoading ? (
              <Typography.Text type="secondary">Cargando usuarios...</Typography.Text>
            ) : users.length === 0 ? (
              <Empty description="No hay usuarios creados" />
            ) : (
              users.map((user) => {
                const fullName =
                  `${user.name || ""} ${user.lastname || ""}`.trim() ||
                  "Sin nombre";
                const roleLabel = user.role
                  ? roleLabels[user.role] || user.role
                  : "Sin rol";

                return (
                  <Card key={user.id} size="small">
                    <Flex vertical gap={8}>
                      <Typography.Text strong>{fullName}</Typography.Text>

                      <Typography.Text type="secondary">
                        {user.username || "Sin usuario"}
                      </Typography.Text>

                      <Flex gap={8} wrap>
                        <Tag>{roleLabel}</Tag>
                      </Flex>

                      <Flex gap={8} justify="end" wrap>
                        <Link
                          href={`/dashboard/usuarios/editar/${user.id}`}
                          prefetch={false}
                        >
                          <Button
                            icon={<EditOutlined />}
                            size="small"
                          >
                            Editar
                          </Button>
                        </Link>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          loading={deletingUserId === user.id}
                          onClick={() => handleDeleteUser(user)}
                        >
                          Borrar
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })
            )}
          </Flex>
        ) : (
          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={users}
            pagination={false}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </main>
  );
}
