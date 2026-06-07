"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Space, Table, Typography, message } from "antd";
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
    <main style={{ padding: 24 }}>
      <Card>
        <Space
          align="start"
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
            <Button type="primary">Crear usuario</Button>
          </Link>
        </Space>

        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={users}
          pagination={false}
        />
      </Card>
    </main>
  );
}
