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
import { useCallback, useEffect, useState } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";
import hymnsBySectionData from "@/data/hymns-by-section.json";
import meetingMinuteAuthoritiesData from "@/data/meeting-minute-authorities.json";
import meetingMinuteLeadsData from "@/data/meeting-minute-leads.json";
import meetingMinutePresidesData from "@/data/meeting-minute-presides.json";
import { supabase } from "@/lib/supabase/client";
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
import dayjs from "dayjs";

type NewMinuteFormValues = {
  date?: Dayjs;
  presides?: string;
  leads?: string;
  welcomeAndAcknowledgmentsOfAuthorities?: string | string[];
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
    speechId?: string | number;
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

type HymnSection = {
  section: string;
  hymns: HymnCatalogEntry[];
};

type HymnSelectOption = {
  label: string;
  value: string;
};

type HymnSelectOptionGroup = {
  label: string;
  options: HymnSelectOption[];
};

type HymnSelectOptions = Array<HymnSelectOption | HymnSelectOptionGroup>;

type HymnFieldProps = {
  form: ReturnType<typeof Form.useForm<NewMinuteFormValues>>[0];
  label: string;
  name: "firstHymn" | "sacramentalHymn" | "lastHymn";
  options?: HymnSelectOptions;
  placeholder?: string;
};

type AcceptedSpeechRecord = {
  id: string | number;
  speaker_name?: string | null;
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  speech?: string | null;
  topic?: string | null;
  title?: string | null;
  time?: number | null;
  duration?: number | null;
};

const { Paragraph, Title } = Typography;
const SPEECH_DATE_FIELD = "date";
const initialPresideOptions = meetingMinutePresidesData.map((preside) => ({
  value: preside,
  label: preside,
}));
const initialLeadOptions = meetingMinuteLeadsData.map((lead) => ({
  value: lead,
  label: lead,
}));
const initialAuthorityOptions = meetingMinuteAuthoritiesData.map((authority) => ({
  value: authority,
  label: authority,
}));
const defaultPreside = "OBISPO MARTINEZ";
const defaultWelcomeAndAcknowledgmentsOfAuthorities = [
  "DANIEL LOZANO (MSC)",
  "NARCISO GERONIMO (PATRIARCA)",
];
const getUpcomingSunday = () => {
  const today = dayjs();
  const daysUntilSunday = today.day() === 0 ? 0 : 7 - today.day();

  return today.add(daysUntilSunday, "day");
};
const getFormattedMinuteDate = (dateValue?: Dayjs | string | null) => {
  if (!dateValue) {
    return null;
  }

  if (dayjs.isDayjs(dateValue)) {
    return dateValue.format("YYYY-MM-DD");
  }

  return dayjs(dateValue).format("YYYY-MM-DD");
};
const getSpeakerName = (speech: AcceptedSpeechRecord) =>
  speech.speaker_name ||
  speech.name ||
  speech.full_name ||
  `${speech.first_name || ""} ${speech.last_name || ""}`.trim();
const hymnsByNumber = hymnsByNumberData as Record<string, HymnCatalogEntry>;
const hymnsBySection = hymnsBySectionData as HymnSection[];
const getHymnValue = (hymn: HymnCatalogEntry) => String(hymn.number);
const flattenHymnsBySection = (sections: HymnSection[]) =>
  sections.flatMap((sectionGroup) => sectionGroup.hymns);
const allHymns = flattenHymnsBySection(hymnsBySection);
const findHymnByValue = (value?: string | number) =>
  allHymns.find((hymn) => getHymnValue(hymn) === String(value));
const buildHymnOptionsBySection = (
  sections: HymnSection[]
): HymnSelectOptionGroup[] =>
  sections.map((sectionGroup) => ({
    label: sectionGroup.section,
    options: sectionGroup.hymns.map((hymn) => ({
      label: `${hymn.number} - ${hymn.title}`,
      value: getHymnValue(hymn),
    })),
  }));
const hymnOptionsBySection = buildHymnOptionsBySection(hymnsBySection);
const sacramentalHymnOptionsBySection: HymnSelectOptionGroup[] =
  hymnsBySection
    .filter(
      (sectionGroup) => sectionGroup.section.toUpperCase() === "LA SANTA CENA"
    )
    .map((sectionGroup) => ({
      label: "LA SANTA CENA",
      options: sectionGroup.hymns.map((hymn) => ({
        label: `${hymn.number} - ${hymn.title}`,
        value: getHymnValue(hymn),
      })),
    }));

const emptyHymn: MeetingMinuteHymn = {
  number: "",
  title: "",
  url: "",
};

function withCatalogHymnData(
  hymn?: MeetingMinuteHymn | string | number
): MeetingMinuteHymn {
  const selectedValue =
    typeof hymn === "object" && hymn !== null ? hymn.number : hymn;
  const number = String(selectedValue ?? "");
  const catalogHymn = findHymnByValue(number) || hymnsByNumber[number];
  const currentHymn = typeof hymn === "object" && hymn !== null ? hymn : null;

  return {
    number,
    title: currentHymn?.title || catalogHymn?.title || "",
    url: currentHymn?.url || catalogHymn?.url || "",
  };
}

function HymnField({
  form,
  label,
  name,
  options = hymnOptionsBySection,
  placeholder = "Seleccionar himno",
}: HymnFieldProps) {
  const updateHymn = (value?: string) => {
    if (!value) {
      form.setFieldValue(name, emptyHymn);
      return;
    }

    const hymn = findHymnByValue(value) || hymnsByNumber[value];

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
          placeholder={placeholder}
          style={{ width: "100%" }}
          optionFilterProp="label"
          optionLabelProp="label"
          options={options}
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
      speechId: item.speechId,
      name: item.name?.trim() || "",
      time: Number(item.time ?? 0),
      topic: item.topic?.trim() || "",
    }))
    .filter((item) => item.speechId || item.name || item.time || item.topic);

const getAuthoritiesArray = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim().toUpperCase()).filter(Boolean);
  }

  return (value || "")
    .split("\n")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
};

const getAuthoritiesString = (value?: string | string[]) =>
  getAuthoritiesArray(value).join("\n");

const getMinuteValues = (values: NewMinuteFormValues): CreateMinuteValues => ({
  attendance: values.attendance || 0,
  date: values.date ? values.date.format("DD-MM-YYYY") : "",
  presides: values.presides?.trim() || "",
  leads: values.leads?.trim() || "",
  welcomeAndAcknowledgmentsOfAuthorities: getAuthoritiesString(
    values.welcomeAndAcknowledgmentsOfAuthorities
  ),
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
  const [defaultMinuteDate] = useState(() => getUpcomingSunday());
  const [isSaving, setIsSaving] = useState(false);
  const [presideOptions, setPresideOptions] = useState(initialPresideOptions);
  const [newPresideName, setNewPresideName] = useState("");
  const [leadOptions, setLeadOptions] = useState(initialLeadOptions);
  const [newLeadName, setNewLeadName] = useState("");
  const [authorityOptions, setAuthorityOptions] = useState(
    initialAuthorityOptions
  );
  const [newAuthorityName, setNewAuthorityName] = useState("");
  const router = useRouter();

  const syncAcceptedSpeechesForDate = useCallback(
    async (minuteDate?: Dayjs | string | null) => {
      const formattedDate = getFormattedMinuteDate(minuteDate);

      if (!formattedDate) {
        return;
      }

      const { data, error } = await supabase
        .from("Speeches")
        .select("*")
        .eq("accepted_discourse", true)
        .eq(SPEECH_DATE_FIELD, formattedDate)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error cargando discursos aceptados para la minuta:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          formattedDate,
          speechDateField: SPEECH_DATE_FIELD,
        });
        message.error("No se pudieron cargar los discursos aceptados");
        return;
      }

      if (!data?.length) {
        return;
      }

      const acceptedMessages = (data as AcceptedSpeechRecord[]).map((speech) => ({
        speechId: speech.id,
        name: getSpeakerName(speech),
        topic: speech.speech || speech.topic || speech.title || "",
        time: speech.time || speech.duration || 10,
      }));
      const currentMessages: NonNullable<NewMinuteFormValues["messages"]> =
        form.getFieldValue("messages") || [];
      const mergedMessages = [
        ...currentMessages,
        ...acceptedMessages.filter(
          (acceptedMessage) =>
            !currentMessages.some(
              (currentMessage) =>
                String(currentMessage.speechId ?? "") ===
                String(acceptedMessage.speechId)
            )
        ),
      ];

      form.setFieldsValue({
        messages: mergedMessages,
      });
    },
    [form]
  );

  useEffect(() => {
    void syncAcceptedSpeechesForDate(defaultMinuteDate);
  }, [defaultMinuteDate, syncAcceptedSpeechesForDate]);

  const handleAddPreside = () => {
    const presideName = newPresideName.trim();

    if (!presideName) {
      return;
    }

    setPresideOptions((currentOptions) => {
      if (
        currentOptions.some(
          (option) => option.value.toLowerCase() === presideName.toLowerCase()
        )
      ) {
        return currentOptions;
      }

      return [
        ...currentOptions,
        {
          value: presideName,
          label: presideName,
        },
      ];
    });
    form.setFieldValue("presides", presideName);
    setNewPresideName("");
  };

  const handleAddLead = () => {
    const leadName = newLeadName.trim().toUpperCase();

    if (!leadName) {
      return;
    }

    setLeadOptions((currentOptions) => {
      if (currentOptions.some((option) => option.value === leadName)) {
        return currentOptions;
      }

      return [
        ...currentOptions,
        {
          value: leadName,
          label: leadName,
        },
      ];
    });
    form.setFieldValue("leads", leadName);
    setNewLeadName("");
  };

  const handleAddAuthority = () => {
    const authorityName = newAuthorityName.trim().toUpperCase();

    if (!authorityName) {
      return;
    }

    setAuthorityOptions((currentOptions) => {
      if (currentOptions.some((option) => option.value === authorityName)) {
        return currentOptions;
      }

      return [
        ...currentOptions,
        {
          value: authorityName,
          label: authorityName,
        },
      ];
    });

    const currentAuthorities = getAuthoritiesArray(
      form.getFieldValue("welcomeAndAcknowledgmentsOfAuthorities")
    );

    if (!currentAuthorities.includes(authorityName)) {
      form.setFieldValue("welcomeAndAcknowledgmentsOfAuthorities", [
        ...currentAuthorities,
        authorityName,
      ]);
    }

    setNewAuthorityName("");
  };

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
      console.error("Error guardando minuta:", error);
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
            date: defaultMinuteDate,
            presides: defaultPreside,
            leads: undefined,
            welcomeAndAcknowledgmentsOfAuthorities:
              defaultWelcomeAndAcknowledgmentsOfAuthorities,
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
                  <DatePicker
                    className={styles.control}
                    format="DD-MM-YYYY"
                    onChange={(date) => void syncAcceptedSpeechesForDate(date)}
                  />
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
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={presideOptions}
                    placeholder="Nombre de quien preside"
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                          <Input
                            placeholder="Agregar alguien más"
                            value={newPresideName}
                            onChange={(event) =>
                              setNewPresideName(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleAddPreside();
                              }
                            }}
                          />
                          <Button onClick={handleAddPreside}>Agregar</Button>
                        </Flex>
                      </>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Dirige" name="leads">
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={leadOptions}
                    placeholder="Nombre de quien dirige"
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                          <Input
                            placeholder="Agregar alguien más"
                            value={newLeadName}
                            onChange={(event) =>
                              setNewLeadName(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleAddLead();
                              }
                            }}
                          />
                          <Button onClick={handleAddLead}>Agregar</Button>
                        </Flex>
                      </>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Bienvenida y reconocimiento de autoridades"
                  name="welcomeAndAcknowledgmentsOfAuthorities"
                  getValueProps={(value) => ({
                    value: getAuthoritiesArray(value),
                  })}
                  normalize={(value) => getAuthoritiesArray(value)}
                >
                  <Select
                    allowClear
                    mode="tags"
                    optionFilterProp="label"
                    optionLabelProp="label"
                    options={authorityOptions}
                    placeholder="Ej: PRESIDENTE ROMERO, OBISPO MARTINEZ"
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                          <Input
                            placeholder="Agregar autoridad"
                            value={newAuthorityName}
                            onChange={(event) =>
                              setNewAuthorityName(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleAddAuthority();
                              }
                            }}
                          />
                          <Button
                            icon={<PlusOutlined />}
                            onClick={handleAddAuthority}
                          >
                            Agregar
                          </Button>
                        </Flex>
                      </>
                    )}
                    showSearch
                    tokenSeparators={[","]}
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
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <Form.Item label="Oracion inicial" name="openingPrayer">
                    <Input placeholder="Nombre de quien ofrece la oracion" />
                  </Form.Item>
                  <Form.Item label="Directora de musica" name="director">
                    <Input placeholder="Nombre de la directora de musica" />
                  </Form.Item>
                  <Form.Item label="Pianista" name="pianist">
                    <Input placeholder="Nombre del pianista" />
                  </Form.Item>
                  <Form.Item label="Oracion final" name="closingPrayer">
                    <Input placeholder="Nombre de quien ofrece la oracion" />
                  </Form.Item>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  <HymnField
                    form={form}
                    label="Himno de apertura"
                    name="firstHymn"
                  />
                  <HymnField
                    form={form}
                    label="Himno sacramental"
                    name="sacramentalHymn"
                    options={sacramentalHymnOptionsBySection}
                    placeholder="Seleccionar himno sacramental"
                  />
                  <HymnField form={form} label="Himno final" name="lastHymn" />
                </Space>
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
                      <Form.Item name={[field.name, "speechId"]} hidden>
                        <Input />
                      </Form.Item>
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
