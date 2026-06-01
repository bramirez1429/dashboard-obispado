"use client";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
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
import type { MeetingMinute, MeetingMinuteHymn } from "@/types/meeting-minute";

type MinuteEditFormsProps = {
  minute: MeetingMinute;
};

type HymnCatalogEntry = {
  number: string | number;
  title: string;
  url?: string;
};

const hymnsByNumber = hymnsByNumberData as Record<string, HymnCatalogEntry>;
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

export default function MinuteEditForms({ minute }: MinuteEditFormsProps) {
  const minuteWithHymnUrls = {
    ...minute,
    firstHymn: withCatalogHymnData(minute.firstHymn),
    sacramentalHymn: withCatalogHymnData(minute.sacramentalHymn),
    lastHymn: withCatalogHymnData(minute.lastHymn),
  };
  const mainSave = useModuleSave("Datos principales guardados");
  const hymnsSave = useModuleSave("Himnos y oraciones guardados");
  const businessSave = useModuleSave("Asuntos guardados");
  const messagesSave = useModuleSave("Mensajes guardados");
  const closingSave = useModuleSave("Cierre guardado");
  const [hymnsForm] = Form.useForm();

  const handleHymnChange = (
    fieldName: "firstHymn" | "sacramentalHymn" | "lastHymn",
    hymnNumber: string
  ) => {
    const hymn = hymnsByNumber[hymnNumber];

    hymnsForm.setFieldValue([fieldName, "number"], String(hymn?.number ?? hymnNumber));
    hymnsForm.setFieldValue([fieldName, "title"], hymn?.title ?? "");
    hymnsForm.setFieldValue([fieldName, "url"], hymn?.url ?? "");
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: "100%" }}>
      <Card size="small" title="Datos principales">
        <Form
          layout="vertical"
          initialValues={minuteWithHymnUrls}
          onValuesChange={notifyEditing}
          onFinish={(values) => mainSave.save(minute.id, values)}
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Fecha" name="date" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Preside" name="presides" style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Dirige" name="leads" style={formItemStyle}>
                <Input size="small" />
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
              >
                <Input.TextArea rows={2} size="small" />
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
          layout="vertical"
          initialValues={minuteWithHymnUrls}
          onValuesChange={notifyEditing}
          onFinish={(values) => businessSave.save(minute.id, values)}
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Asunto" name={["wardAndStakeBusiness", "subject"]} style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Nombre" name={["wardAndStakeBusiness", "name"]} style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Detalle" name={["wardAndStakeBusiness", "details"]} style={formItemStyle}>
                <Input.TextArea rows={2} size="small" />
              </Form.Item>
            </Col>
          </Row>
          <Button size="small" type="primary" htmlType="submit" loading={businessSave.isSaving}>
            Guardar
          </Button>
        </Form>
      </Card>

      <Card size="small" title="Discursos/mensajes">
        <Form
          layout="vertical"
          initialValues={{ messages: minute.messages?.length ? minute.messages : [{}] }}
          onValuesChange={notifyEditing}
          onFinish={(values) =>
            messagesSave.save(minute.id, { messages: values.messages || [] })
          }
        >
          <Form.List name="messages">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                {fields.map((field) => (
                  <Row gutter={8} key={field.key} align="middle">
                    <Col xs={24} md={8}>
                      <Form.Item label="Nombre" name={[field.name, "name"]} style={formItemStyle}>
                        <Input size="small" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                      <Form.Item label="Tiempo" name={[field.name, "time"]} style={formItemStyle}>
                        <InputNumber min={0} size="small" style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={20} md={10}>
                      <Form.Item label="Tema" name={[field.name, "topic"]} style={formItemStyle}>
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
                ))}
                <Button size="small" icon={<PlusOutlined />} onClick={() => add()}>
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
