"use client";

import {
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Modal,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getSpeechStatusLabel } from "@/lib/speeches";
import { supabase } from "@/lib/supabase/client";

type SpeechStatus = "pending" | "shared";

type MessageRow = {
  id: string;
  name: string | null;
  gender: "masculine" | "feminine" | null;
  speech: string | null;
  date: string | null;
  time: number | null;
  status: SpeechStatus | null;
  did_speak: boolean | null;
  accepted_discourse: boolean | null;
};

function formatDate(date: string | null) {
  return date ? dayjs(date).format("DD/MM/YYYY") : "Sin fecha";
}

function getPublicSpeechLink(id: string) {
  return `${window.location.origin}/m/${id}`;
}

export default function DiscursosPage() {
  const router = useRouter();
  const [speeches, setSpeeches] = useState<MessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingSpeechId, setUpdatingSpeechId] = useState<string | null>(null);
  const [deletingSpeechId, setDeletingSpeechId] = useState<string | null>(null);

  useEffect(() => {
    const loadSpeeches = async () => {
      try {
        const { data, error } = await supabase
          .from("Speeches")
          .select(
            "id, name, gender, speech, date, time, status, did_speak, accepted_discourse"
          )
          .order("date", { ascending: false });

        if (error) {
          console.error("Error loading speeches:", error);
          message.error("No se pudieron cargar los discursos");
          return;
        }

        setSpeeches((data || []) as MessageRow[]);
      } catch (error) {
        message.error(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los discursos"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadSpeeches();
  }, []);

  const handleUpdateSpeech = async (
    id: string,
    values: Partial<Pick<MessageRow, "did_speak" | "status">>
  ) => {
    setUpdatingSpeechId(id);

    try {
      const response = await fetch(`/api/speeches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "No se pudo actualizar el discurso");
      }

      setSpeeches((current) =>
        current.map((speech) =>
          speech.id === id ? { ...speech, ...values } : speech
        )
      );
      message.success(
        values.did_speak === true ? "Discurso completado" : "Discurso actualizado"
      );
    } catch (error) {
      message.error(
        values.status !== undefined
          ? "No se pudo actualizar el estado"
          : "No se pudo actualizar si discursó"
      );
      console.error("Error updating speech", error);
    } finally {
      setUpdatingSpeechId(null);
    }
  };

  const handleDeleteSpeech = (speech: MessageRow) => {
    Modal.confirm({
      title: "Borrar discurso",
      content: `¿Seguro que querés borrar el discurso de ${
        speech.name?.trim() || "esta persona"
      }?`,
      okText: "Borrar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        setDeletingSpeechId(speech.id);

        try {
          const response = await fetch(`/api/speeches/${speech.id}`, {
            method: "DELETE",
          });
          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || "No se pudo borrar el discurso");
          }

          setSpeeches((current) =>
            current.filter((currentSpeech) => currentSpeech.id !== speech.id)
          );
          message.success("Discurso borrado correctamente");
        } catch (error) {
          message.error(
            error instanceof Error ? error.message : "No se pudo borrar el discurso"
          );
        } finally {
          setDeletingSpeechId(null);
        }
      },
    });
  };

  const handleCopyPublicLink = async (id: string) => {
    await navigator.clipboard.writeText(getPublicSpeechLink(id));
    message.success("Link copiado para compartir");
  };

  const handleAcceptedDiscourseChange = async (
    speechId: string | number,
    checked: boolean
  ) => {
    console.log("Actualizando discurso", speechId, checked);

    const { data, error } = await supabase
      .from("Speeches")
      .update({ accepted_discourse: checked })
      .eq("id", speechId)
      .select("id, accepted_discourse")
      .maybeSingle();

    if (error) {
      console.error("Error actualizando accepted_discourse:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        speechId,
        checked,
      });
      message.error("No se pudo actualizar la aceptación del discurso");
      return;
    }

    if (!data) {
      console.error("No se encontro el discurso para actualizar", {
        speechId,
        checked,
      });
      message.error("No se encontro el discurso para actualizar");
      return;
    }

    setSpeeches((prevSpeeches) =>
      prevSpeeches.map((speech) =>
        String(speech.id) === String(data.id)
          ? { ...speech, accepted_discourse: data.accepted_discourse }
          : speech
      )
    );
    message.success("Estado de aceptación actualizado");
    router.refresh();
  };

  const columns: ColumnsType<MessageRow> = [
    {
      title: "N° discurso",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Compartir",
      dataIndex: "id",
      key: "share",
      render: (id: string) => (
        <Button
          aria-label="Copiar link"
          icon={<CopyOutlined />}
          size="small"
          onClick={() => handleCopyPublicLink(id)}
        />
      ),
    },
    {
      title: "Fecha de discurso",
      dataIndex: "date",
      key: "date",
      render: (date: string | null) => formatDate(date),
    },
    {
      title: "Persona",
      dataIndex: "name",
      key: "name",
      render: (name: string | null) => name?.trim() || "Sin completar",
    },
    {
      title: "Tiempo asignado",
      dataIndex: "time",
      key: "time",
      render: (time: number | null) =>
        time ? `${time} minutos` : "Sin completar",
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: MessageRow["status"], record) => {
        const isUpdating = updatingSpeechId === record.id;

        return (
          <button
            className="speech-status-button"
            type="button"
            disabled={isUpdating}
            onClick={() =>
              handleUpdateSpeech(record.id, {
                status: status === "shared" ? "pending" : "shared",
              })
            }
          >
            <Tag color={status === "shared" ? "success" : "warning"}>
              <span className="speech-status-tag-content">
                {getSpeechStatusLabel(status)}
                {isUpdating ? <Spin size="small" /> : null}
              </span>
            </Tag>
          </button>
        );
      },
    },
    {
      title: "Discursó",
      dataIndex: "did_speak",
      key: "did_speak",
      align: "center",
      render: (didSpeak: boolean | null, record) => {
        const isUpdating = updatingSpeechId === record.id;

        return (
          <Space size={6}>
            <Checkbox
              checked={Boolean(didSpeak)}
              disabled={isUpdating}
              onChange={(event) =>
                handleUpdateSpeech(record.id, { did_speak: event.target.checked })
              }
            />
            {isUpdating ? <Spin size="small" /> : null}
          </Space>
        );
      },
    },
    {
      title: "Link",
      dataIndex: "id",
      key: "link",
      render: (id: string) => (
        <Button type="link" href={`/m/${id}`} target="_blank">
          Ver
        </Button>
      ),
    },
    {
      title: "Aceptó discurso",
      dataIndex: "accepted_discourse",
      key: "accepted_discourse",
      render: (accepted: boolean | null, record) => (
        <Switch
          checked={Boolean(accepted)}
          checkedChildren="Sí"
          unCheckedChildren="No"
          onChange={(checked) =>
            void handleAcceptedDiscourseChange(record.id, checked)
          }
        />
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, speech) => (
        <Space>
          <Link href={`/dashboard/discursos/editar/${speech.id}`} prefetch={false}>
            <Button
              aria-label="Editar discurso"
              icon={<EditOutlined />}
              size="small"
            />
          </Link>
          <Button
            aria-label="Borrar discurso"
            danger
            icon={<DeleteOutlined />}
            loading={deletingSpeechId === speech.id}
            size="small"
            onClick={() => handleDeleteSpeech(speech)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <Card className="table-card">
        <Space className="section-toolbar" orientation="horizontal">
          <Space align="start">
            <Link href="/dashboard" prefetch={false}>
              <Button
                aria-label="Volver"
                icon={<ArrowLeftOutlined />}
                shape="circle"
              />
            </Link>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Discursos
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Seguimiento de mensajes asignados y enlaces públicos.
              </Paragraph>
            </div>
          </Space>
          <Space wrap>
            <Button
              size="large"
              href="/dashboard/discursos/posibles-discursantes"
            >
              Posibles discursantes
            </Button>
            <Button
              type="primary"
              size="large"
              href="/dashboard/discursos/nuevo"
              icon={<PlusOutlined />}
            >
              Nuevo mensaje
            </Button>
          </Space>
        </Space>

        <Table
          className="messages-table"
          rowKey="id"
          columns={columns}
          dataSource={speeches}
          loading={isLoading}
          locale={{ emptyText: <Empty description="Vacío" /> }}
          pagination={false}
          scroll={{ x: 980 }}
        />
      </Card>
    </div>
  );
}
