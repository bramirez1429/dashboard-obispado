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
  Space,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MeetingMinute } from "@/types/meeting-minute";

type MinuteEditFormsProps = {
  minute: MeetingMinute;
};

function notifyEditing() {
  window.dispatchEvent(new Event("minute-form-editing"));
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
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const save = async (
    minuteId: string | number | undefined,
    values: object
  ) => {
    setIsSaving(true);

    try {
      await updateMinute(minuteId, values);
      message.success(successMessage);
      router.refresh();
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
  const mainSave = useModuleSave("Datos principales guardados");
  const hymnsSave = useModuleSave("Himnos y oraciones guardados");
  const businessSave = useModuleSave("Asuntos guardados");
  const messagesSave = useModuleSave("Mensajes guardados");
  const closingSave = useModuleSave("Cierre guardado");

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Card size="small" title="Datos principales">
        <Form
          layout="vertical"
          initialValues={minute}
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
          layout="vertical"
          initialValues={minute}
          onValuesChange={notifyEditing}
          onFinish={(values) => hymnsSave.save(minute.id, values)}
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item label="Primer himno numero" name={["firstHymn", "number"]} style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Primer himno titulo" name={["firstHymn", "title"]} style={formItemStyle}>
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
              <Form.Item label="Himno sacramental numero" name={["sacramentalHymn", "number"]} style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Himno sacramental titulo" name={["sacramentalHymn", "title"]} style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ultimo himno numero" name={["lastHymn", "number"]} style={formItemStyle}>
                <Input size="small" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ultimo himno titulo" name={["lastHymn", "title"]} style={formItemStyle}>
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
          initialValues={minute}
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
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
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
          initialValues={minute}
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
