"use client";

import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import BackCircleButton from "@/components/common/BackCircleButton";
import { supabase } from "@/lib/supabase/client";

type Interview = {
  id: string | number;
  person_name: string | null;
  interviewer_name: string | null;
  calling_name: string | null;
  subject: string | null;
  sustaining_date: string | null;
  accepted_calling: boolean | null;
};

type InterviewFormValues = {
  person_name: string;
  interviewer_name: string;
  calling_name: string;
  subject: string;
  sustaining_date?: Dayjs;
};

const initialSubjectOptions = [
  { label: "Relevo", value: "Relevo" },
  { label: "Sostenimiento", value: "Sostenimiento" },
];

const interviewerOptions = [
  { label: "OBISPO MARTINEZ", value: "OBISPO MARTINEZ" },
  { label: "BRYAN BELLEZA", value: "BRYAN BELLEZA" },
  { label: "BRAYANN FARFAN", value: "BRAYANN FARFAN" },
];

const interviewSelect =
  "id, person_name, interviewer_name, calling_name, subject, sustaining_date, accepted_calling";

const formatDisplayDate = (date?: string | null) =>
  date ? dayjs(date).format("DD-MM-YYYY") : "-";

export default function InterviewsClient() {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [form] = Form.useForm<InterviewFormValues>();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [subjectOptions, setSubjectOptions] = useState(initialSubjectOptions);
  const [newSubject, setNewSubject] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingInterviewId, setEditingInterviewId] =
    useState<Interview["id"] | null>(null);
  const [deletingInterviewId, setDeletingInterviewId] =
    useState<Interview["id"] | null>(null);
  const [updatingAcceptedInterviewId, setUpdatingAcceptedInterviewId] =
    useState<Interview["id"] | null>(null);

  const loadInterviews = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    const { data, error } = await supabase
      .from("Interviews")
      .select(interviewSelect)
      .order("id", { ascending: true });

    if (error) {
      message.error(error.message || "No se pudieron cargar las entrevistas");
      setIsLoading(false);
      return;
    }

    setInterviews((data || []) as Interview[]);
    setIsLoading(false);
  };

  useEffect(() => {
    let isActive = true;

    supabase
      .from("Interviews")
      .select(interviewSelect)
      .order("id", { ascending: true })
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          message.error(error.message || "No se pudieron cargar las entrevistas");
          setIsLoading(false);
          return;
        }

        setInterviews((data || []) as Interview[]);
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingInterviewId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (interview: Interview) => {
    setEditingInterviewId(interview.id);
    form.setFieldsValue({
      person_name: interview.person_name || "",
      interviewer_name: interview.interviewer_name || "",
      calling_name: interview.calling_name || "",
      subject: interview.subject || "",
      sustaining_date: interview.sustaining_date
        ? dayjs(interview.sustaining_date)
        : undefined,
    });

    if (
      interview.subject &&
      !subjectOptions.some((option) => option.value === interview.subject)
    ) {
      setSubjectOptions((currentOptions) => [
        ...currentOptions,
        { label: interview.subject || "", value: interview.subject || "" },
      ]);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInterviewId(null);
    setNewSubject("");
    form.resetFields();
  };

  const handleAddSubject = () => {
    const subject = newSubject.trim();

    if (!subject) {
      return;
    }

    setSubjectOptions((currentOptions) => {
      if (
        currentOptions.some(
          (option) => option.value.toLowerCase() === subject.toLowerCase()
        )
      ) {
        return currentOptions;
      }

      return [...currentOptions, { label: subject, value: subject }];
    });
    form.setFieldValue("subject", subject);
    setNewSubject("");
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setIsSaving(true);

    const payload = {
      person_name: values.person_name.trim(),
      interviewer_name: values.interviewer_name.trim(),
      calling_name: values.calling_name.trim(),
      subject: values.subject.trim(),
      sustaining_date: values.sustaining_date
        ? values.sustaining_date.format("YYYY-MM-DD")
        : null,
    };

    const query = editingInterviewId
      ? supabase
          .from("Interviews")
          .update(payload)
          .eq("id", editingInterviewId)
          .select(interviewSelect)
          .single()
      : supabase
          .from("Interviews")
          .insert({
            ...payload,
            accepted_calling: false,
          })
          .select(interviewSelect)
          .single();

    const { error } = await query;
    setIsSaving(false);

    if (error) {
      message.error(error.message || "No se pudo guardar la entrevista");
      return;
    }

    message.success(editingInterviewId ? "Entrevista actualizada" : "Entrevista creada");
    closeModal();
    await loadInterviews(false);
  };

  const handleAcceptedCallingChange = async (
    interviewId: Interview["id"],
    checked: boolean
  ) => {
    setUpdatingAcceptedInterviewId(interviewId);

    const { data, error } = await supabase
      .from("Interviews")
      .update({ accepted_calling: checked })
      .eq("id", interviewId)
      .select(interviewSelect)
      .single();

    setUpdatingAcceptedInterviewId(null);

    if (error) {
      message.error(error.message || "No se pudo actualizar la aceptacion");
      return;
    }

    setInterviews((currentInterviews) =>
      currentInterviews.map((interview) =>
        interview.id === interviewId ? ((data as Interview) || interview) : interview
      )
    );
    message.success("Aceptacion actualizada");
  };

  const handleDelete = async (interviewId: Interview["id"]) => {
    setDeletingInterviewId(interviewId);

    const { error } = await supabase
      .from("Interviews")
      .delete()
      .eq("id", interviewId);

    setDeletingInterviewId(null);

    if (error) {
      message.error(error.message || "No se pudo eliminar la entrevista");
      return;
    }

    message.success("Entrevista eliminada");
    await loadInterviews(false);
  };

  return (
    <div className="page-stack">
      <Card className="table-card">
        <Flex
          align="start"
          gap={16}
          justify="space-between"
          style={{ marginBottom: 20 }}
          wrap
        >
          <Space align="start">
            <BackCircleButton href="/dashboard" />
            <div>
              <Typography.Title level={2} style={{ margin: 0 }}>
                Entrevistas
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Administra entrevistas y llamamientos.
              </Typography.Paragraph>
            </div>
          </Space>
          <Button
            icon={<PlusOutlined />}
            size="large"
            type="primary"
            onClick={openCreateModal}
          >
            Nueva entrevista
          </Button>
        </Flex>

        {interviews.length ? (
          <Row gutter={[16, 16]}>
            {interviews.map((interview) => (
              <Col key={interview.id} xs={24} md={12} xl={8}>
                <Card
                  loading={isLoading}
                  title={`ID ${interview.id}`}
                  extra={
                    <Tag color={interview.accepted_calling ? "success" : "default"}>
                      {interview.accepted_calling ? "Si" : "No"}
                    </Tag>
                  }
                >
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <div>
                      <Typography.Text type="secondary">
                        Fecha de sostenimiento
                      </Typography.Text>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {formatDisplayDate(interview.sustaining_date)}
                      </Typography.Paragraph>
                    </div>
                    <div>
                      <Typography.Text type="secondary">
                        Persona a entrevistar
                      </Typography.Text>
                      <Typography.Paragraph strong style={{ marginBottom: 0 }}>
                        {interview.person_name || "-"}
                      </Typography.Paragraph>
                    </div>
                    <div>
                      <Typography.Text type="secondary">
                        Quien entrevista
                      </Typography.Text>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {interview.interviewer_name || "-"}
                      </Typography.Paragraph>
                    </div>
                    <div>
                      <Typography.Text type="secondary">Llamamiento</Typography.Text>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {interview.calling_name || "-"}
                      </Typography.Paragraph>
                    </div>
                    <div>
                      <Typography.Text type="secondary">Asunto</Typography.Text>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {interview.subject || "-"}
                      </Typography.Paragraph>
                    </div>
                    <div>
                      <Typography.Text type="secondary">
                        Acepto llamamiento
                      </Typography.Text>
                      <div>
                        <Switch
                          checked={Boolean(interview.accepted_calling)}
                          checkedChildren="Si"
                          loading={updatingAcceptedInterviewId === interview.id}
                          unCheckedChildren="No"
                          onChange={(checked) =>
                            void handleAcceptedCallingChange(interview.id, checked)
                          }
                        />
                      </div>
                    </div>
                    <Flex gap={8} justify="end" wrap>
                      <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => openEditModal(interview)}
                      >
                        Editar
                      </Button>
                      <Popconfirm
                        title="¿Seguro que querés borrar esta entrevista?"
                        okText="Borrar"
                        okButtonProps={{ danger: true }}
                        cancelText="Cancelar"
                        onConfirm={() => void handleDelete(interview.id)}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          loading={deletingInterviewId === interview.id}
                          size="small"
                        >
                          Borrar
                        </Button>
                      </Popconfirm>
                    </Flex>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description={
              isLoading ? "Cargando entrevistas" : "No hay entrevistas cargadas"
            }
          />
        )}
      </Card>

      <Modal
        title={editingInterviewId ? "Editar entrevista" : "Nueva entrevista"}
        open={isModalOpen}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={isSaving}
        width={isMobile ? "95%" : 600}
        onCancel={closeModal}
        onOk={() => void handleSave()}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Fecha de sostenimiento"
            name="sustaining_date"
            rules={[
              { required: true, message: "Selecciona la fecha de sostenimiento" },
            ]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Persona a entrevistar"
            name="person_name"
            rules={[{ required: true, message: "Ingresa la persona" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Quien entrevista"
            name="interviewer_name"
            rules={[{ required: true, message: "Ingresa quien entrevista" }]}
          >
            <Select
              placeholder="Seleccionar quien entrevista"
              options={interviewerOptions}
            />
          </Form.Item>
          <Form.Item
            label="Llamamiento"
            name="calling_name"
            rules={[{ required: true, message: "Ingresa el llamamiento" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Asunto"
            name="subject"
            rules={[{ required: true, message: "Selecciona el asunto" }]}
          >
            <Select
              options={subjectOptions}
              popupRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                    <Input
                      placeholder="Agregar asunto"
                      value={newSubject}
                      onChange={(event) => setNewSubject(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.stopPropagation();
                          handleAddSubject();
                        }
                      }}
                    />
                    <Button icon={<PlusOutlined />} onClick={handleAddSubject}>
                      Agregar
                    </Button>
                  </Flex>
                </>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
