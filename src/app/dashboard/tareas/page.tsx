"use client";

import { useCallback, useEffect, useState } from "react";
import type * as React from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { supabase } from "@/lib/supabase/client";

type TaskRow = {
  id: string | number;
  task_name: string | null;
  responsible_name: string | null;
  category: string | null;
  created_date: string | null;
  delivery_date: string | null;
  completed: boolean | null;
};

type TaskFormValues = {
  task_name: string;
  responsible_name: string;
  category: string;
  created_date: Dayjs;
  delivery_date: Dayjs;
  completed?: boolean;
};

type SelectOption = {
  label: string;
  value: string;
};

type CustomDropdownSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  setOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>;
  placeholder: string;
  addPlaceholder: string;
};

const initialResponsibleOptions: SelectOption[] = [
  { label: "Bryan", value: "Bryan" },
  { label: "Pablo", value: "Pablo" },
  { label: "Pablo Cano", value: "Pablo Cano" },
  { label: "Obispo", value: "Obispo" },
  { label: "Consejero 1", value: "Consejero 1" },
  { label: "Consejero 2", value: "Consejero 2" },
];

const initialCategoryOptions: SelectOption[] = [
  { label: "Discursos", value: "Discursos" },
  { label: "Minuta", value: "Minuta" },
  { label: "Finanzas", value: "Finanzas" },
  { label: "Entrevistas", value: "Entrevistas" },
  { label: "Reunión sacramental", value: "Reunión sacramental" },
  { label: "Otro", value: "Otro" },
];

const CustomDropdownSelect = ({
  value,
  onChange,
  options,
  setOptions,
  placeholder,
  addPlaceholder,
}: CustomDropdownSelectProps) => {
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    const normalizedValue = newOption.trim();

    if (!normalizedValue) {
      return;
    }

    const alreadyExists = options.some(
      (option) => option.value.toLowerCase() === normalizedValue.toLowerCase()
    );

    if (!alreadyExists) {
      setOptions((prevOptions) => [
        ...prevOptions,
        {
          label: normalizedValue,
          value: normalizedValue,
        },
      ]);
    }

    onChange?.(normalizedValue);
    setNewOption("");
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      showSearch
      allowClear
      placeholder={placeholder}
      options={options}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Flex gap={8} style={{ padding: "0 8px 4px" }}>
            <Input
              placeholder={addPlaceholder}
              value={newOption}
              onChange={(event) => setNewOption(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={handleAddOption}
            >
              Agregar
            </Button>
          </Flex>
        </>
      )}
    />
  );
};

function formatTableDate(date: string | null) {
  return date ? dayjs(date).format("DD-MM-YYYY") : "-";
}

function formatSupabaseDate(date: Dayjs | undefined) {
  return date ? date.format("YYYY-MM-DD") : null;
}

function parseDate(date: string | null) {
  return date ? dayjs(date) : undefined;
}

export default function TareasPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingNewTask, setIsSavingNewTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<TaskRow["id"] | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<TaskRow["id"] | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<TaskRow["id"] | null>(null);
  const [responsibleOptions, setResponsibleOptions] = useState(
    initialResponsibleOptions
  );
  const [categoryOptions, setCategoryOptions] = useState(initialCategoryOptions);
  const [newTaskForm] = Form.useForm<TaskFormValues>();
  const [editForm] = Form.useForm<TaskFormValues>();

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("Bishorpc_tasks")
      .select(
        "id, task_name, responsible_name, category, created_date, delivery_date, completed"
      )
      .order("id", { ascending: false });

    if (error) {
      message.error("No se pudieron cargar las tareas");
      return [];
    }

    return (data || []) as TaskRow[];
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setTasks(await fetchTasks());
    setIsLoading(false);
  }, [fetchTasks]);

  useEffect(() => {
    let isActive = true;

    const loadInitialTasks = async () => {
      const nextTasks = await fetchTasks();

      if (isActive) {
        setTasks(nextTasks);
        setIsLoading(false);
      }
    };

    void loadInitialTasks();

    return () => {
      isActive = false;
    };
  }, [fetchTasks]);

  const handleCreateTask = async (values: TaskFormValues) => {
    setIsSavingNewTask(true);

    const { data, error } = await supabase
      .from("Bishorpc_tasks")
      .insert({
        task_name: values.task_name,
        responsible_name: values.responsible_name,
        category: values.category,
        created_date: formatSupabaseDate(values.created_date),
        delivery_date: formatSupabaseDate(values.delivery_date),
        completed: false,
      })
      .select()
      .single();

    setIsSavingNewTask(false);

    if (error) {
      console.error("Error creando tarea:", error);
      message.error(error.message || "No se pudo crear la tarea");
      return;
    }

    setTasks((currentTasks) => [data as TaskRow, ...currentTasks]);
    message.success("Tarea creada correctamente");
    setIsModalOpen(false);
    newTaskForm.resetFields();
    await loadTasks();
  };

  const startEditing = (task: TaskRow) => {
    setEditingTaskId(task.id);
    editForm.setFieldsValue({
      task_name: task.task_name || "",
      responsible_name: task.responsible_name || "",
      category: task.category || "",
      created_date: parseDate(task.created_date),
      delivery_date: parseDate(task.delivery_date),
      completed: Boolean(task.completed),
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    editForm.resetFields();
  };

  const handleSaveTask = async (taskId: TaskRow["id"]) => {
    const values = await editForm.validateFields();
    setSavingTaskId(taskId);

    const { error } = await supabase
      .from("Bishorpc_tasks")
      .update({
        task_name: values.task_name,
        responsible_name: values.responsible_name,
        category: values.category,
        created_date: formatSupabaseDate(values.created_date),
        delivery_date: formatSupabaseDate(values.delivery_date),
        completed: Boolean(values.completed),
      })
      .eq("id", taskId);

    setSavingTaskId(null);

    if (error) {
      message.error("No se pudo guardar la tarea");
      return;
    }

    message.success("Tarea guardada correctamente");
    setEditingTaskId(null);
    editForm.resetFields();
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: TaskRow["id"]) => {
    setDeletingTaskId(taskId);

    const { error } = await supabase
      .from("Bishorpc_tasks")
      .delete()
      .eq("id", taskId);

    setDeletingTaskId(null);

    if (error) {
      message.error("No se pudo borrar la tarea");
      return;
    }

    message.success("Tarea borrada correctamente");
    await loadTasks();
  };

  const columns: ColumnsType<TaskRow> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "Tarea",
      dataIndex: "task_name",
      key: "task_name",
      render: (value: string | null, record) =>
        editingTaskId === record.id ? (
          <Form.Item
            name="task_name"
            rules={[{ required: true, message: "Ingresá la tarea" }]}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : (
          value || "-"
        ),
    },
    {
      title: "Responsable",
      dataIndex: "responsible_name",
      key: "responsible_name",
      render: (value: string | null, record) =>
        editingTaskId === record.id ? (
          <Form.Item
            name="responsible_name"
            rules={[{ required: true, message: "Seleccioná un responsable" }]}
            style={{ margin: 0 }}
          >
            <CustomDropdownSelect
              options={responsibleOptions}
              setOptions={setResponsibleOptions}
              placeholder="Seleccionar responsable"
              addPlaceholder="Agregar responsable"
            />
          </Form.Item>
        ) : (
          value || "-"
        ),
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (value: string | null, record) =>
        editingTaskId === record.id ? (
          <Form.Item
            name="category"
            rules={[{ required: true, message: "Seleccioná la categoría" }]}
            style={{ margin: 0 }}
          >
            <CustomDropdownSelect
              options={categoryOptions}
              setOptions={setCategoryOptions}
              placeholder="Seleccionar categoría"
              addPlaceholder="Agregar categoría"
            />
          </Form.Item>
        ) : (
          value || "-"
        ),
    },
    {
      title: "Fecha de creación",
      dataIndex: "created_date",
      key: "created_date",
      render: (value: string | null, record) =>
        editingTaskId === record.id ? (
          <Form.Item
            name="created_date"
            rules={[{ required: true, message: "Seleccioná la fecha" }]}
            style={{ margin: 0 }}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
        ) : (
          formatTableDate(value)
        ),
    },
    {
      title: "Fecha de entrega",
      dataIndex: "delivery_date",
      key: "delivery_date",
      render: (value: string | null, record) =>
        editingTaskId === record.id ? (
          <Form.Item
            name="delivery_date"
            rules={[{ required: true, message: "Seleccioná la fecha" }]}
            style={{ margin: 0 }}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
        ) : (
          formatTableDate(value)
        ),
    },
    {
      title: "Estado",
      dataIndex: "completed",
      key: "completed",
      render: (value: boolean | null, record) =>
        editingTaskId === record.id ? (
          <Form.Item name="completed" style={{ margin: 0 }}>
            <Select
              options={[
                { label: "Por hacer", value: false },
                { label: "Completada", value: true },
              ]}
            />
          </Form.Item>
        ) : (
          <Tag color={value ? "success" : "warning"}>
            {value ? "Completada" : "Por hacer"}
          </Tag>
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      render: (_, record) =>
        editingTaskId === record.id ? (
          <Space>
            <Button
              type="link"
              loading={savingTaskId === record.id}
              onClick={() => void handleSaveTask(record.id)}
            >
              Guardar
            </Button>
            <Button type="link" onClick={cancelEditing}>
              Cancelar
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              aria-label="Editar tarea"
              icon={<EditOutlined />}
              size="small"
              onClick={() => startEditing(record)}
            />
            <Popconfirm
              title="¿Seguro que querés borrar esta tarea?"
              okText="Sí"
              cancelText="No"
              onConfirm={() => void handleDeleteTask(record.id)}
            >
              <Button
                aria-label="Borrar tarea"
                danger
                icon={<DeleteOutlined />}
                loading={deletingTaskId === record.id}
                size="small"
              />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <div className="page-stack">
      <Card className="table-card">
        <Space className="section-toolbar" orientation="horizontal">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Seguimiento de tareas
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Gestioná tareas, responsables, fechas de entrega y estado.
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Nueva tarea
          </Button>
        </Space>

        <Form form={editForm} component={false}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={tasks}
            loading={isLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1180 }}
          />
        </Form>
      </Card>

      <Modal
        title="Nueva tarea"
        open={isModalOpen}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={isSavingNewTask}
        onOk={() => newTaskForm.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          newTaskForm.resetFields();
        }}
      >
        <Form
          form={newTaskForm}
          layout="vertical"
          onFinish={(values) => void handleCreateTask(values)}
        >
          <Form.Item
            label="Tarea"
            name="task_name"
            rules={[{ required: true, message: "Ingresá la tarea" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Responsable"
            name="responsible_name"
            rules={[{ required: true, message: "Seleccioná un responsable" }]}
          >
            <CustomDropdownSelect
              options={responsibleOptions}
              setOptions={setResponsibleOptions}
              placeholder="Seleccionar responsable"
              addPlaceholder="Agregar responsable"
            />
          </Form.Item>
          <Form.Item
            label="Categoría"
            name="category"
            rules={[{ required: true, message: "Seleccioná la categoría" }]}
          >
            <CustomDropdownSelect
              options={categoryOptions}
              setOptions={setCategoryOptions}
              placeholder="Seleccionar categoría"
              addPlaceholder="Agregar categoría"
            />
          </Form.Item>
          <Form.Item
            label="Fecha de creación"
            name="created_date"
            rules={[{ required: true, message: "Seleccioná la fecha" }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Fecha de entrega"
            name="delivery_date"
            rules={[{ required: true, message: "Seleccioná la fecha" }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
