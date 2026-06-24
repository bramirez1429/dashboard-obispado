"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import BackCircleButton from "@/components/common/BackCircleButton";
import { supabase } from "@/lib/supabase/client";

export type PossibleSpeaker = {
  id: string | number;
  first_name: string | null;
  last_name: string | null;
  discourse: boolean | null;
};

type PossibleSpeakerFormValues = {
  first_name: string;
  last_name: string;
  discourse: boolean;
};

type PossibleSpeakersClientProps = {
  initialSpeakers: PossibleSpeaker[];
};

const discourseOptions = [
  { label: "Sí", value: true },
  { label: "No", value: false },
];

export default function PossibleSpeakersClient({
  initialSpeakers,
}: PossibleSpeakersClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingNewSpeaker, setIsSavingNewSpeaker] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] =
    useState<PossibleSpeaker["id"] | null>(null);
  const [savingSpeakerId, setSavingSpeakerId] =
    useState<PossibleSpeaker["id"] | null>(null);
  const [deletingSpeakerId, setDeletingSpeakerId] =
    useState<PossibleSpeaker["id"] | null>(null);
  const [createForm] = Form.useForm<PossibleSpeakerFormValues>();
  const [editForm] = Form.useForm<PossibleSpeakerFormValues>();

  const refreshSpeakers = () => {
    router.refresh();
  };

  const handleCreateSpeaker = async (values: PossibleSpeakerFormValues) => {
    setIsSavingNewSpeaker(true);

    const { error } = await supabase.from("Possible_speakers").insert({
      first_name: values.first_name,
      last_name: values.last_name,
      discourse: values.discourse,
    });

    setIsSavingNewSpeaker(false);

    if (error) {
      message.error(error.message || "No se pudo crear el discursante");
      return;
    }

    message.success("Discursante agregado correctamente");
    setIsModalOpen(false);
    createForm.resetFields();
    refreshSpeakers();
  };

  const startEditing = (speaker: PossibleSpeaker) => {
    setEditingSpeakerId(speaker.id);
    editForm.setFieldsValue({
      first_name: speaker.first_name || "",
      last_name: speaker.last_name || "",
      discourse: Boolean(speaker.discourse),
    });
  };

  const cancelEditing = () => {
    setEditingSpeakerId(null);
    editForm.resetFields();
  };

  const handleSaveSpeaker = async (speakerId: PossibleSpeaker["id"]) => {
    const values = await editForm.validateFields();
    setSavingSpeakerId(speakerId);

    const { error } = await supabase
      .from("Possible_speakers")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        discourse: values.discourse,
      })
      .eq("id", speakerId);

    setSavingSpeakerId(null);

    if (error) {
      message.error(error.message || "No se pudo guardar el discursante");
      return;
    }

    message.success("Discursante guardado correctamente");
    setEditingSpeakerId(null);
    editForm.resetFields();
    refreshSpeakers();
  };

  const handleDeleteSpeaker = async (speakerId: PossibleSpeaker["id"]) => {
    setDeletingSpeakerId(speakerId);

    const { error } = await supabase
      .from("Possible_speakers")
      .delete()
      .eq("id", speakerId);

    setDeletingSpeakerId(null);

    if (error) {
      message.error(error.message || "No se pudo borrar el discursante");
      return;
    }

    message.success("Discursante borrado correctamente");
    refreshSpeakers();
  };

  const columns: ColumnsType<PossibleSpeaker> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "Nombre",
      dataIndex: "first_name",
      key: "first_name",
      render: (value: string | null, record) =>
        editingSpeakerId === record.id ? (
          <Form.Item
            name="first_name"
            rules={[{ required: true, message: "Ingresá el nombre" }]}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          value || "-"
        ),
    },
    {
      title: "Apellido",
      dataIndex: "last_name",
      key: "last_name",
      render: (value: string | null, record) =>
        editingSpeakerId === record.id ? (
          <Form.Item
            name="last_name"
            rules={[{ required: true, message: "Ingresá el apellido" }]}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          value || "-"
        ),
    },
    {
      title: "Discurso",
      dataIndex: "discourse",
      key: "discourse",
      render: (value: boolean | null, record) =>
        editingSpeakerId === record.id ? (
          <Form.Item name="discourse" style={{ margin: 0 }}>
            <Select options={discourseOptions} />
          </Form.Item>
        ) : (
          <Tag color={value ? "success" : "default"}>{value ? "Sí" : "No"}</Tag>
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      render: (_, record) =>
        editingSpeakerId === record.id ? (
          <Flex gap={8} wrap>
            <Button
              type="link"
              loading={savingSpeakerId === record.id}
              onClick={() => void handleSaveSpeaker(record.id)}
            >
              Guardar
            </Button>
            <Button type="link" onClick={cancelEditing}>
              Cancelar
            </Button>
          </Flex>
        ) : (
          <Flex gap={8} wrap>
            <Button
              aria-label="Editar discursante"
              icon={<EditOutlined />}
              size="small"
              onClick={() => startEditing(record)}
            />
            <Popconfirm
              title="¿Seguro que querés borrar este discursante?"
              okText="Borrar"
              okButtonProps={{ danger: true }}
              cancelText="Cancelar"
              onConfirm={() => void handleDeleteSpeaker(record.id)}
            >
              <Button
                aria-label="Borrar discursante"
                danger
                icon={<DeleteOutlined />}
                loading={deletingSpeakerId === record.id}
                size="small"
              />
            </Popconfirm>
          </Flex>
        ),
    },
  ];

  return (
    <div className="page-stack">
      <Card className="table-card">
        <Flex
          align="start"
          gap={16}
          justify="space-between"
          style={{ marginBottom: 18 }}
          wrap
        >
          <Flex align="start" gap={12}>
            <BackCircleButton href="/dashboard/discursos" />
            <div>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Posibles discursantes
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Administra hermanos o hermanas que podrían dar discurso.
              </Typography.Paragraph>
            </div>
          </Flex>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Agregar discursante
          </Button>
        </Flex>

        <Form form={editForm} component={false}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={initialSpeakers}
            pagination={false}
            scroll={{ x: true }}
          />
        </Form>
      </Card>

      <Modal
        title="Agregar discursante"
        open={isModalOpen}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={isSavingNewSpeaker}
        onOk={() => createForm.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          createForm.resetFields();
        }}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ discourse: false }}
          onFinish={(values) => void handleCreateSpeaker(values)}
        >
          <Form.Item
            label="Nombre"
            name="first_name"
            rules={[{ required: true, message: "Ingresá el nombre" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Apellido"
            name="last_name"
            rules={[{ required: true, message: "Ingresá el apellido" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Discurso"
            name="discourse"
            rules={[{ required: true, message: "Seleccioná una opción" }]}
          >
            <Select options={discourseOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
