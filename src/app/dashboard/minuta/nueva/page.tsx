"use client";

import {
  ArrowLeftOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";
import type {
  MeetingMinuteHymn,
  MeetingMinuteWardAndStakeBusiness,
} from "@/types/meeting-minute";
import {
  createMinuteAction,
  type CreateMinuteValues,
} from "../components/actions";
import WardStakeAffairsList from "./WardStakeAffairsList";
import styles from "./page.module.css";

type NewMinuteFormValues = {
  date?: Dayjs;
  presides?: string;
  leads?: string;
  welcomeAndAcknowledgmentsOfAuthorities?: string;
  announcements?: string;
  director?: string;
  pianist?: string;
  attendance?: number;
  firstHymn?: MeetingMinuteHymn;
  openingPrayer?: string;
  sacramentalHymn?: MeetingMinuteHymn;
  lastHymn?: MeetingMinuteHymn;
  closingPrayer?: string;
  messages?: {
    name?: string;
    time?: number;
    topic?: string;
  }[];
  wardStakeAffairs?: {
    type?: string;
    customType?: string;
    name?: string;
    calling?: string;
    customCalling?: string;
  }[];
};

type HymnCatalogEntry = {
  number: number | string;
  title: string;
  url?: string;
};

type HymnFieldProps = {
  form: ReturnType<typeof Form.useForm<NewMinuteFormValues>>[0];
  label: string;
  name: "firstHymn" | "sacramentalHymn" | "lastHymn";
};

const { Paragraph, Title } = Typography;
const hymnsByNumber = hymnsByNumberData as Record<string, HymnCatalogEntry>;
const hymnOptions = Object.entries(hymnsByNumber)
  .sort(
    ([firstNumber], [secondNumber]) =>
      Number(firstNumber) - Number(secondNumber)
  )
  .map(([number, hymn]) => ({
    value: number,
    label: `${hymn.number} - ${hymn.title}`,
  }));

const emptyHymn: MeetingMinuteHymn = {
  number: "",
  title: "",
  url: "",
};

function withCatalogHymnData(hymn?: MeetingMinuteHymn): MeetingMinuteHymn {
  const number = String(hymn?.number ?? "");
  const catalogHymn = hymnsByNumber[number];

  return {
    number,
    title: hymn?.title || catalogHymn?.title || "",
    url: hymn?.url || catalogHymn?.url || "",
  };
}

function HymnField({ form, label, name }: HymnFieldProps) {
  const updateHymn = (value?: string) => {
    if (!value) {
      form.setFieldValue(name, emptyHymn);
      return;
    }

    const hymn = hymnsByNumber[value];

    form.setFieldValue(name, {
      number: String(hymn?.number ?? value),
      title: hymn?.title ?? "",
      url: hymn?.url ?? "",
    });
  };

  const handleHymnSearch = (value: string) => {
    if (/^\d*$/.test(value)) {
      updateHymn(value || undefined);
    }
  };

  return (
    <>
      <Form.Item label={label} name={[name, "number"]}>
        <Select
          showSearch
          placeholder="Selecciona un himno"
          style={{ width: "100%" }}
          optionFilterProp="label"
          optionLabelProp="value"
          options={hymnOptions}
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onChange={(value) => updateHymn(value)}
          onSearch={handleHymnSearch}
        />
      </Form.Item>
      <Form.Item name={[name, "title"]} hidden>
        <Input />
      </Form.Item>
      <Form.Item name={[name, "url"]} hidden>
        <Input />
      </Form.Item>
    </>
  );
}

const getWardAndStakeBusiness = (
  affairs: NewMinuteFormValues["wardStakeAffairs"]
): MeetingMinuteWardAndStakeBusiness[] => {
  const business = (affairs || [])
    .map((affair) => ({
      subject:
        affair.type === "Otro"
          ? affair.customType?.trim() || ""
          : affair.type?.trim() || "",
      name: affair.name?.trim() || "",
      details:
        affair.calling === "Otro"
          ? affair.customCalling?.trim() || ""
          : affair.calling?.trim() || "",
    }))
    .filter((item) => item.subject || item.name || item.details);

  return business.length
    ? business
    : [
        {
          subject: "",
          name: "",
          details: "",
        },
      ];
};

const getMessages = (messages: NewMinuteFormValues["messages"]) =>
  (messages || [])
    .map((item) => ({
      name: item.name?.trim() || "",
      time: Number(item.time ?? 0),
      topic: item.topic?.trim() || "",
    }))
    .filter((item) => item.name || item.time || item.topic);

const getMinuteValues = (values: NewMinuteFormValues): CreateMinuteValues => ({
  attendance: values.attendance || 0,
  date: values.date ? values.date.format("DD-MM-YYYY") : "",
  presides: values.presides?.trim() || "",
  leads: values.leads?.trim() || "",
  welcomeAndAcknowledgmentsOfAuthorities:
    values.welcomeAndAcknowledgmentsOfAuthorities?.trim() || "",
  announcements: values.announcements?.trim() || "",
  firstHymn: withCatalogHymnData(values.firstHymn),
  director: values.director?.trim() || "",
  pianist: values.pianist?.trim() || "",
  openingPrayer: values.openingPrayer?.trim() || "",
  wardAndStakeBusiness: getWardAndStakeBusiness(values.wardStakeAffairs),
  sacramentalHymn: withCatalogHymnData(values.sacramentalHymn),
  messages: getMessages(values.messages),
  lastHymn: withCatalogHymnData(values.lastHymn),
  closingPrayer: values.closingPrayer?.trim() || "",
});

const NewMinutePage = () => {
  const [form] = Form.useForm<NewMinuteFormValues>();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: NewMinuteFormValues) => {
    setIsSaving(true);

    try {
      const payload = getMinuteValues(values);
      const result = await createMinuteAction(payload);

      if (!result.success) {
        message.error(
          result.error || result.message || "No se pudo guardar la minuta"
        );
        return;
      }

      message.success(result.message || "Minuta guardada correctamente");
      form.resetFields();
      router.push("/dashboard/minuta");
      router.refresh();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "No se pudo guardar la minuta"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
          <Link href="/dashboard/minuta" prefetch={false}>
            <Button
              aria-label="Volver a minuta"
              icon={<ArrowLeftOutlined />}
              shape="circle"
            />
          </Link>
          <Title level={2} style={{ marginBottom: 16 }}>
            Experiencia nueva de minuta
          </Title>
        </Flex>

        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Title className={styles.title} level={1}>
              Crear minuta sacramental
            </Title>
            <Paragraph className={styles.subtitle}>
              Completa los datos principales para preparar la minuta.
            </Paragraph>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard/minuta/antigua" prefetch={false}>
              <Button>Minuta antigua</Button>
            </Link>
          </div>
        </div>

        <Divider className={styles.divider} />

        <Form
          className={styles.form}
          form={form}
          initialValues={{
            firstHymn: emptyHymn,
            sacramentalHymn: emptyHymn,
            lastHymn: emptyHymn,
            messages: [{ name: "", time: undefined, topic: "" }],
            wardStakeAffairs: [
              {
                type: "Sostenimiento",
                customType: "",
                name: "",
                calling: undefined,
                customCalling: "",
              },
            ],
          }}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <section className={styles.section}>
            <Title className={styles.sectionTitle} level={2}>
              Datos principales
            </Title>
            <Row gutter={[16, 8]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Fecha de la reunion"
                  name="date"
                  rules={[{ required: true, message: "Selecciona una fecha" }]}
                >
                  <DatePicker className={styles.control} format="DD-MM-YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Asistencia" name="attendance">
                  <InputNumber
                    className={styles.control}
                    min={0}
                    placeholder="Cantidad de asistentes"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Preside" name="presides">
                  <Input placeholder="Nombre de quien preside" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Dirige" name="leads">
                  <Input placeholder="Nombre de quien dirige" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Bienvenida y reconocimiento de autoridades"
                  name="welcomeAndAcknowledgmentsOfAuthorities"
                >
                  <Input.TextArea
                    rows={2}
                    placeholder="Ej: Bienvenida y reconocimiento de autoridades visitantes"
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Anuncios" name="announcements">
                  <Input.TextArea
                    rows={2}
                    placeholder="Escribi los anuncios de la reunion"
                  />
                </Form.Item>
              </Col>
            </Row>
          </section>

          <Divider className={styles.sectionDivider} />

          <section className={styles.section}>
            <Title className={styles.sectionTitle} level={2}>
              Himnos y oraciones
            </Title>
            <Row gutter={[16, 8]}>
              <Col xs={24} md={12}>
                <HymnField
                  form={form}
                  label="Himno de apertura"
                  name="firstHymn"
                />
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Directora de musica" name="director">
                  <Input placeholder="Nombre de la directora de musica" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Pianista" name="pianist">
                  <Input placeholder="Nombre del pianista" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Oracion inicial" name="openingPrayer">
                  <Input placeholder="Nombre de quien ofrece la oracion" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <HymnField
                  form={form}
                  label="Himno sacramental"
                  name="sacramentalHymn"
                />
              </Col>
              <Col xs={24} md={12}>
                <HymnField form={form} label="Himno final" name="lastHymn" />
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Oracion final" name="closingPrayer">
                  <Input placeholder="Nombre de quien ofrece la oracion" />
                </Form.Item>
              </Col>
            </Row>
          </section>

          <Divider className={styles.sectionDivider} />

          <section className={styles.section}>
            <Title className={styles.sectionTitle} level={2}>
              Asuntos de barrio y estaca
            </Title>
            <WardStakeAffairsList />
          </section>

          <Divider className={styles.sectionDivider} />

          <section className={styles.section}>
            <Title className={styles.sectionTitle} level={2}>
              Discursos
            </Title>
            <Form.List name="messages">
              {(fields, { add, remove }) => (
                <Space
                  className={styles.speakerList}
                  orientation="vertical"
                  size={12}
                >
                  {fields.map((field) => (
                    <Row
                      align="top"
                      className={styles.speakerRow}
                      gutter={[12, 0]}
                      key={field.key}
                    >
                      <Col xs={24} md={9}>
                        <Form.Item
                          label="Nombre del discursante"
                          name={[field.name, "name"]}
                        >
                          <Input placeholder="Nombre del discursante" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item label="Tiempo">
                          <Space.Compact className={styles.speakerTimeCompact}>
                            <Form.Item
                              name={[field.name, "time"]}
                              noStyle
                              rules={[
                                {
                                  required: true,
                                  message: "Ingresa el tiempo",
                                },
                              ]}
                            >
                              <InputNumber
                                className={styles.speakerTimeInput}
                                max={60}
                                min={1}
                                placeholder="Min"
                              />
                            </Form.Item>
                            <Input
                              className={styles.speakerTimeSuffix}
                              disabled
                              value="min"
                            />
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label="Tema del discurso"
                          name={[field.name, "topic"]}
                        >
                          <Input placeholder="Tema del discurso" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={2}>
                        <Button
                          aria-label="Eliminar discursante"
                          className={styles.removeSpeakerButton}
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() =>
                      add({ name: "", time: undefined, topic: "" })
                    }
                    type="dashed"
                  >
                    Agregar discursante
                  </Button>
                </Space>
              )}
            </Form.List>
          </section>

          <div className={styles.actions}>
            <Space wrap>
              <Button type="primary" htmlType="submit" loading={isSaving}>
                Guardar minuta
              </Button>
              <Link href="/dashboard/minuta" prefetch={false}>
                <Button disabled={isSaving}>Cancelar</Button>
              </Link>
            </Space>
          </div>
        </Form>
      </Card>
    </main>
  );
};

export default NewMinutePage;
