"use client";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Space,
  message,
} from "antd";
import { useState } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";
import meetingMinuteAuthoritiesData from "@/data/meeting-minute-authorities.json";
import meetingMinuteLeadsData from "@/data/meeting-minute-leads.json";
import meetingMinutePresidesData from "@/data/meeting-minute-presides.json";
import type {
  MeetingMinute,
  MeetingMinuteHymn,
  MeetingMinuteMessage,
  MeetingMinuteWardAndStakeBusiness,
  MeetingMinuteWardAndStakeBusinessValue,
} from "@/types/meeting-minute";
import SortableItem from "../nueva/SortableItem";

type MinuteEditFormsProps = {
  minute: MeetingMinute;
};

type HymnCatalogEntry = {
  number: string | number;
  title: string;
  url?: string;
};

type EditableWardAndStakeBusiness = MeetingMinuteWardAndStakeBusiness & {
  id?: string | number;
  tempId?: string;
};

type EditableMinuteMessage = MeetingMinuteMessage & {
  id?: string | number;
  tempId?: string;
};

const hymnsByNumber = hymnsByNumberData as Record<string, HymnCatalogEntry>;
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
const hymnOptions = Object.entries(hymnsByNumber)
  .sort(([firstNumber], [secondNumber]) => Number(firstNumber) - Number(secondNumber))
  .map(([number, hymn]) => ({
    value: number,
    label: `${hymn.number} - ${hymn.title}`,
  }));

function notifyEditing() {
   console.log("El usuario está editando la minuta");
  window.dispatchEvent(new Event("minute-form-editing"));
}

function withCatalogHymnData(hymn?: MeetingMinuteHymn): MeetingMinuteHymn {
  const number = String(hymn?.number ?? "");
  const catalogHymn = hymnsByNumber[number];

  return {
    number,
    title: hymn?.title || catalogHymn?.title || "",
    url: hymn?.url || catalogHymn?.url || "",
  };
}

async function updateMinute(minuteId: string | number | undefined, values: object) {
  const response = await fetch(`/api/minuta/${minuteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "No se pudo guardar la minuta");
  }
}

function useModuleSave(successMessage: string) {
  const [isSaving, setIsSaving] = useState(false);

  const save = async (
    minuteId: string | number | undefined,
    values: object
  ) => {
    setIsSaving(true);

    try {
      await updateMinute(minuteId, values);
      message.success(successMessage);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, save };
}

const formItemStyle = { marginBottom: 10 };

const emptyBusiness: MeetingMinuteWardAndStakeBusiness = {
  subject: "",
  name: "",
  details: "",
};

const createTempId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getWardBusinessSortableId = (
  item: Partial<EditableWardAndStakeBusiness>,
  index: number
) => String(item.id || item.interviewId || item.tempId || `ward-${index}`);

const getMessageSortableId = (
  item: Partial<EditableMinuteMessage>,
  index: number
) => String(item.id || item.speechId || item.tempId || `message-${index}`);

const withWardBusinessSortableIds = (
  items: MeetingMinuteWardAndStakeBusiness[]
): EditableWardAndStakeBusiness[] =>
  items.map((item, index) => ({
    ...item,
    tempId: item.interviewId ? undefined : `ward-initial-${index}`,
  }));

const withMessageSortableIds = (
  items: MeetingMinuteMessage[]
): EditableMinuteMessage[] =>
  items.map((item, index) => ({
    ...item,
    tempId: item.speechId ? undefined : `message-initial-${index}`,
  }));

const getBusinessPayload = (items?: EditableWardAndStakeBusiness[]) =>
  (items?.length ? items : [{ ...emptyBusiness }]).map(
    ({ subject, name, details, interviewId }) => ({
      ...(interviewId ? { interviewId } : {}),
      subject: subject || "",
      name: name || "",
      details: details || "",
    })
  );

const getMessagesPayload = (items?: EditableMinuteMessage[]) =>
  (items || []).map((message) => {
    const payload = { ...message };
    delete payload.tempId;

    return payload;
  });

function getWardAndStakeBusinessSortRank(subject: string) {
  const normalizedSubject = subject.toLowerCase();

  if (normalizedSubject.includes("relevo")) return 0;
  if (normalizedSubject.includes("sosten")) return 1;
  return 2;
}

function normalizeWardAndStakeBusinessList(
  business: MeetingMinuteWardAndStakeBusinessValue
) {
  const businesses = Array.isArray(business) ? business : [business];
  const normalizedBusinesses = businesses
    .map((item) => ({
      subject: item?.subject || "",
      name: item?.name || "",
      details: item?.details || "",
    }))
    .map((item, index) => ({ item, index }))
    .sort((firstItem, secondItem) => {
      const firstRank = getWardAndStakeBusinessSortRank(firstItem.item.subject);
      const secondRank = getWardAndStakeBusinessSortRank(secondItem.item.subject);

      return firstRank - secondRank || firstItem.index - secondItem.index;
    })
    .map(({ item }) => item);

  return normalizedBusinesses.length ? normalizedBusinesses : [emptyBusiness];
}

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

export default function MinuteEditForms({ minute }: MinuteEditFormsProps) {
  const minuteWithHymnUrls = {
    ...minute,
    firstHymn: withCatalogHymnData(minute.firstHymn),
    sacramentalHymn: withCatalogHymnData(minute.sacramentalHymn),
    lastHymn: withCatalogHymnData(minute.lastHymn),
  };
  const businessInitialValues = {
    wardAndStakeBusiness: withWardBusinessSortableIds(
      normalizeWardAndStakeBusinessList(minute.wardAndStakeBusiness)
    ),
  };
  const messageInitialValues = {
    messages: withMessageSortableIds(
      minute.messages?.length ? minute.messages : [{} as MeetingMinuteMessage]
    ),
  };
  const mainSave = useModuleSave("Datos principales guardados");
  const hymnsSave = useModuleSave("Himnos y oraciones guardados");
  const businessSave = useModuleSave("Asuntos guardados");
  const messagesSave = useModuleSave("Mensajes guardados");
  const closingSave = useModuleSave("Cierre guardado");
  const [mainForm] = Form.useForm();
  const [hymnsForm] = Form.useForm();
  const [businessForm] = Form.useForm();
  const [messagesForm] = Form.useForm();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    })
  );
  const [presideOptions, setPresideOptions] = useState(initialPresideOptions);
  const [newPresideName, setNewPresideName] = useState("");
  const [leadOptions, setLeadOptions] = useState(initialLeadOptions);
  const [newLeadName, setNewLeadName] = useState("");
  const [authorityOptions, setAuthorityOptions] = useState(
    initialAuthorityOptions
  );
  const [newAuthorityName, setNewAuthorityName] = useState("");

  const handleAddPreside = () => {
    const presideName = newPresideName.trim().toUpperCase();

    if (!presideName) {
      return;
    }

    setPresideOptions((currentOptions) => {
      if (currentOptions.some((option) => option.value === presideName)) {
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
    mainForm.setFieldValue("presides", presideName);
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
    mainForm.setFieldValue("leads", leadName);
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
      mainForm.getFieldValue("welcomeAndAcknowledgmentsOfAuthorities")
    );

    if (!currentAuthorities.includes(authorityName)) {
      mainForm.setFieldValue("welcomeAndAcknowledgmentsOfAuthorities", [
        ...currentAuthorities,
        authorityName,
      ]);
    }

    setNewAuthorityName("");
  };

  const handleHymnChange = (
    fieldName: "firstHymn" | "sacramentalHymn" | "lastHymn",
    hymnNumber: string
  ) => {
    const hymn = hymnsByNumber[hymnNumber];

    hymnsForm.setFieldValue([fieldName, "number"], String(hymn?.number ?? hymnNumber));
    hymnsForm.setFieldValue([fieldName, "title"], hymn?.title ?? "");
    hymnsForm.setFieldValue([fieldName, "url"], hymn?.url ?? "");
  };

  const handleWardBusinessDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const currentItems: EditableWardAndStakeBusiness[] =
      businessForm.getFieldValue("wardAndStakeBusiness") || [];

    const oldIndex = currentItems.findIndex(
      (item, index) => getWardBusinessSortableId(item, index) === String(active.id)
    );
    const newIndex = currentItems.findIndex(
      (item, index) => getWardBusinessSortableId(item, index) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    businessForm.setFieldsValue({
      wardAndStakeBusiness: arrayMove(currentItems, oldIndex, newIndex),
    });
    notifyEditing();
  };

  const handleMessagesDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const currentItems: EditableMinuteMessage[] =
      messagesForm.getFieldValue("messages") || [];

    const oldIndex = currentItems.findIndex(
      (item, index) => getMessageSortableId(item, index) === String(active.id)
    );
    const newIndex = currentItems.findIndex(
      (item, index) => getMessageSortableId(item, index) === String(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    messagesForm.setFieldsValue({
      messages: arrayMove(currentItems, oldIndex, newIndex),
    });
    notifyEditing();
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: "100%" }}>
      <Card size="small" title="Datos principales">
        <Form
          form={mainForm}
          layout="vertical"
          initialValues={{
            ...minuteWithHymnUrls,
            welcomeAndAcknowledgmentsOfAuthorities: getAuthoritiesArray(
              minuteWithHymnUrls.welcomeAndAcknowledgmentsOfAuthorities
            ),
          }}
          onValuesChange={notifyEditing}
          onFinish={(values) =>
            mainSave.save(minute.id, {
              ...values,
              welcomeAndAcknowledgmentsOfAuthorities: getAuthoritiesString(
                values.welcomeAndAcknowledgmentsOfAuthorities
              ),
            })
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Fecha" name="date" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Preside" name="presides" style={formItemStyle}>
                <Select
                  size="small"
                  showSearch
                  optionFilterProp="label"
                  options={presideOptions}
                  placeholder="Seleccionar quien preside"
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                        <Input
                          size="small"
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
                        <Button size="small" onClick={handleAddPreside}>
                          Agregar
                        </Button>
                      </Flex>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Dirige" name="leads" style={formItemStyle}>
                <Select
                  size="small"
                  showSearch
                  optionFilterProp="label"
                  options={leadOptions}
                  placeholder="Seleccionar quien dirige"
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                        <Input
                          size="small"
                          placeholder="Agregar alguien más"
                          value={newLeadName}
                          onChange={(event) => setNewLeadName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              event.stopPropagation();
                              handleAddLead();
                            }
                          }}
                        />
                        <Button size="small" onClick={handleAddLead}>
                          Agregar
                        </Button>
                      </Flex>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Anuncios" name="announcements" style={formItemStyle}>
                <Input.TextArea rows={2} size="small" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Bienvenida y reconocimiento de autoridades"
                name="welcomeAndAcknowledgmentsOfAuthorities"
                style={formItemStyle}
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
                  placeholder="Seleccionar autoridades"
                  showSearch
                  size="small"
                  tokenSeparators={[","]}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Flex gap={8} style={{ padding: "0 8px 4px" }}>
                        <Input
                          size="small"
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
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={handleAddAuthority}
                        >
                          Agregar
                        </Button>
                      </Flex>
                    </>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Button size="small" type="primary" htmlType="submit" loading={mainSave.isSaving}>
            Guardar
          </Button>
        </Form>
      </Card>

      <Card size="small" title="Himnos y oraciones">
        <Form
          form={hymnsForm}
          layout="vertical"
          initialValues={minuteWithHymnUrls}
          onValuesChange={notifyEditing}
          onFinish={(values) =>
            hymnsSave.save(minute.id, {
              ...values,
              firstHymn: withCatalogHymnData(values.firstHymn),
              sacramentalHymn: withCatalogHymnData(values.sacramentalHymn),
              lastHymn: withCatalogHymnData(values.lastHymn),
            })
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Primer himno" name={["firstHymn", "number"]} style={formItemStyle}>
                <Select
                  size="small"
                  showSearch
                  options={hymnOptions}
                  optionFilterProp="label"
                  placeholder="Seleccionar himno"
                  onChange={(value) => handleHymnChange("firstHymn", value)}
                />
              </Form.Item>
              <Form.Item name={["firstHymn", "title"]} hidden>
                <Input size="small" />
              </Form.Item>
              <Form.Item name={["firstHymn", "url"]} hidden>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Directora" name="director" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Pianista" name="pianist" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Primera oracion" name="openingPrayer" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Himno sacramental" name={["sacramentalHymn", "number"]} style={formItemStyle}>
                <Select
                  size="small"
                  showSearch
                  options={hymnOptions}
                  optionFilterProp="label"
                  placeholder="Seleccionar himno"
                  onChange={(value) => handleHymnChange("sacramentalHymn", value)}
                />
              </Form.Item>
              <Form.Item name={["sacramentalHymn", "title"]} hidden>
                <Input size="small" />
              </Form.Item>
              <Form.Item name={["sacramentalHymn", "url"]} hidden>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ultimo himno" name={["lastHymn", "number"]} style={formItemStyle}>
                <Select
                  size="small"
                  showSearch
                  options={hymnOptions}
                  optionFilterProp="label"
                  placeholder="Seleccionar himno"
                  onChange={(value) => handleHymnChange("lastHymn", value)}
                />
              </Form.Item>
              <Form.Item name={["lastHymn", "title"]} hidden>
                <Input size="small" />
              </Form.Item>
              <Form.Item name={["lastHymn", "url"]} hidden>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ultima oracion" name="closingPrayer" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
          </Row>
          <Button size="small" type="primary" htmlType="submit" loading={hymnsSave.isSaving}>
            Guardar
          </Button>
        </Form>
      </Card>

      <Card size="small" title="Asuntos del barrio/estaca">
        <Form
          form={businessForm}
          layout="vertical"
          initialValues={businessInitialValues}
          onValuesChange={notifyEditing}
          onFinish={(values) =>
            businessSave.save(minute.id, {
              wardAndStakeBusiness: getBusinessPayload(
                values.wardAndStakeBusiness
              ),
            })
          }
        >
          <Form.List name="wardAndStakeBusiness">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {(() => {
                  const currentItems: EditableWardAndStakeBusiness[] =
                    businessForm.getFieldValue("wardAndStakeBusiness") || [];
                  const sortableIds = fields.map((_, index) =>
                    getWardBusinessSortableId(currentItems[index] || {}, index)
                  );

                  return (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleWardBusinessDragEnd}
                    >
                      <SortableContext
                        items={sortableIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {fields.map((field, index) => {
                          const sortableId = sortableIds[index];

                          return (
                            <SortableItem key={sortableId} id={sortableId}>
                              <Row gutter={8} align="middle">
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    label={
                                      index === 0
                                        ? "Asunto"
                                        : "Asunto adicional"
                                    }
                                    name={[field.name, "subject"]}
                                    style={formItemStyle}
                                  >
                                    <Input size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    label="Nombre"
                                    name={[field.name, "name"]}
                                    style={formItemStyle}
                                  >
                                    <Input size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={20} md={8}>
                                  <Form.Item
                                    label="Detalle"
                                    name={[field.name, "details"]}
                                    style={formItemStyle}
                                  >
                                    <Input.TextArea rows={2} size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={4} md={2}>
                                  <Button
                                    size="small"
                                    aria-label="Quitar asunto"
                                    disabled={fields.length <= 1}
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(field.name)}
                                  />
                                </Col>
                              </Row>
                            </SortableItem>
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                  );
                })()}
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      ...emptyBusiness,
                      tempId: createTempId("ward"),
                    })
                  }
                >
                  Agregar asunto
                </Button>
              </Space>
            )}
          </Form.List>
          <Button
            size="small"
            type="primary"
            htmlType="submit"
            loading={businessSave.isSaving}
            style={{ marginTop: 10 }}
          >
            Guardar
          </Button>
        </Form>
      </Card>

      <Card size="small" title="Discursos/mensajes">
        <Form
          form={messagesForm}
          layout="vertical"
          initialValues={messageInitialValues}
          onValuesChange={notifyEditing}
          onFinish={(values) =>
            messagesSave.save(minute.id, {
              messages: getMessagesPayload(values.messages),
            })
          }
        >
          <Form.List name="messages">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {(() => {
                  const currentItems: EditableMinuteMessage[] =
                    messagesForm.getFieldValue("messages") || [];
                  const sortableIds = fields.map((_, index) =>
                    getMessageSortableId(currentItems[index] || {}, index)
                  );

                  return (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleMessagesDragEnd}
                    >
                      <SortableContext
                        items={sortableIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {fields.map((field, index) => {
                          const sortableId = sortableIds[index];

                          return (
                            <SortableItem key={sortableId} id={sortableId}>
                              <Row gutter={8} align="middle">
                                <Col xs={24} md={8}>
                                  <Form.Item
                                    label="Nombre"
                                    name={[field.name, "name"]}
                                    style={formItemStyle}
                                  >
                                    <Input size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={4}>
                                  <Form.Item
                                    label="Tiempo"
                                    name={[field.name, "time"]}
                                    style={formItemStyle}
                                  >
                                    <InputNumber
                                      min={0}
                                      size="small"
                                      style={{ width: "100%" }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={20} md={10}>
                                  <Form.Item
                                    label="Tema"
                                    name={[field.name, "topic"]}
                                    style={formItemStyle}
                                  >
                                    <Input size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={4} md={2}>
                                  <Button
                                    size="small"
                                    aria-label="Quitar mensaje"
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => remove(field.name)}
                                  />
                                </Col>
                              </Row>
                            </SortableItem>
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                  );
                })()}
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      tempId: createTempId("message"),
                    })
                  }
                >
                  Agregar mensaje
                </Button>
              </Space>
            )}
          </Form.List>
          <Button
            size="small"
            type="primary"
            htmlType="submit"
            loading={messagesSave.isSaving}
            style={{ marginTop: 10 }}
          >
            Guardar
          </Button>
        </Form>
      </Card>

      <Card size="small" title="Cierre/asistencia">
        <Form
          layout="vertical"
          initialValues={minuteWithHymnUrls}
          onValuesChange={notifyEditing}
          onFinish={(values) => closingSave.save(minute.id, values)}
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Asistencia" name="attendance" style={formItemStyle}>
                <InputNumber min={0} size="small" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Button size="small" type="primary" htmlType="submit" loading={closingSave.isSaving}>
            Guardar
          </Button>
        </Form>
      </Card>
    </Space>
  );
}
