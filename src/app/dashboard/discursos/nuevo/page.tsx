"use client";

import { Fragment, ReactNode, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";
import type { Dayjs } from "dayjs";

dayjs.locale("es");

const { TextArea } = Input;
const { Paragraph, Text, Title } = Typography;

type Gender = "masculine" | "feminine";

type MessageFormState = {
  brotherName: string;
  gender: Gender;
  date: Dayjs | null;
  topic: string;
  time: number;
  references: string;
};

type SavedSpeech = {
  id: string;
  name: string | null;
  date: string | null;
  speech: string | null;
  time: number | null;
  references: string | null;
  gender: Gender | null;
};

type SpeechPostResponse = {
  success: boolean;
  data?: SavedSpeech;
  error?: string;
};

const initialFormState: MessageFormState = {
  brotherName: "",
  gender: "masculine",
  date: null,
  topic: "",
  time: 10,
  references: "",
};

function treatment(gender: Gender) {
  return gender === "feminine" ? "Hermana" : "Hermano";
}

function displayValue(value: string) {
  return value.trim() || "Sin completar";
}

function formatLongDate(date: Dayjs | string | null) {
  if (!date) return "Sin completar";

  const parsedDate = typeof date === "string" ? dayjs(date) : date;
  return parsedDate.locale("es").format("dddd D [de] MMMM [del] YYYY");
}

function renderTextWithLinks(text: string) {
  if (!text.trim()) return "Sin completar";

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split("\n").map((line, lineIndex) => (
    <Fragment key={`${line}-${lineIndex}`}>
      {line.split(urlRegex).map((part, partIndex) =>
        urlRegex.test(part) ? (
          <a
            key={`${part}-${partIndex}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        ) : (
          <Fragment key={`${part}-${partIndex}`}>{part}</Fragment>
        ),
      )}
      {lineIndex < text.split("\n").length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function GuidanceBlock() {
  return (
    <div className="message-guidance-box">
      <Title level={5}>Orientación para preparar el mensaje</Title>
      <Paragraph>
        Para preparar su mensaje, le invitamos a utilizar recursos aprobados de la
        Iglesia, tales como:
      </Paragraph>
      <ul>
        <li>Las Escrituras canónicas</li>
        <li>La Guía para el Estudio de las Escrituras</li>
        <li>Mensajes de la Conferencia General</li>
        <li>Revistas Liahona</li>
        <li>Experiencias personales apropiadas que fortalezcan la fe</li>
      </ul>
      <Paragraph>Al preparar su mensaje:</Paragraph>
      <ul>
        <li>Ore y busque la guía del Espíritu Santo.</li>
        <li>Centre su mensaje en Jesucristo y Su Evangelio.</li>
        <li>
          Procure enseñar principios que edifiquen la fe y fortalezcan a los miembros.
        </li>
        <li>
          Comparta experiencias o testimonios que sean reverentes, apropiados y
          edificantes.
        </li>
        <li>
          Evite comentarios negativos, controversiales o experiencias que no
          contribuyan al espíritu de la reunión.
        </li>
        <li>Le pedimos acompañarnos en el estrado antes de comenzar la reunión.</li>
      </ul>
      <Paragraph className="message-guidance-closing">
        Muchas gracias por su disposición para participar y servir en la reunión
        sacramental.
      </Paragraph>
    </div>
  );
}

function DetailCard({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`public-detail-card public-message-info-card ${className}`}>
      <Text type="secondary">{label}</Text>
      <div className="public-detail-value">{children}</div>
    </Card>
  );
}

function PublicMessageCard({
  title,
  name,
  gender,
  date,
  topic,
  time,
  references,
}: {
  title?: string;
  name: string | null;
  gender: Gender;
  date: Dayjs | string | null;
  topic: string | null;
  time: number | null;
  references: string | null;
}) {
  return (
    <Card className="public-message-card public-message-readonly public-message-final-card">
      {title ? (
        <Title level={4} style={{ marginTop: 0 }}>
          {title}
        </Title>
      ) : null}

      <div className="public-assignment-header">
        <Title level={2}>Mensaje asignado</Title>
        <Paragraph type="secondary">Reunión sacramental</Paragraph>
      </div>

      <Row gutter={[16, 16]} className="public-assignment-grid">
        <Col xs={24} md={8}>
          <DetailCard label={treatment(gender)}>{name?.trim() || "Sin completar"}</DetailCard>
        </Col>
        <Col xs={24} md={8}>
          <DetailCard label="Tiempo asignado">
            {time ? `${time} minutos` : "Sin completar"}
          </DetailCard>
        </Col>
        <Col xs={24} md={8}>
          <DetailCard label="Fecha">{formatLongDate(date)}</DetailCard>
        </Col>
        <Col span={24}>
          <DetailCard label="Tema">{topic?.trim() || "Sin completar"}</DetailCard>
        </Col>
        <Col span={24}>
          <DetailCard label="Referencias" className="references-card">
            {renderTextWithLinks(references || "")}
          </DetailCard>
        </Col>
      </Row>

      <GuidanceBlock />
    </Card>
  );
}

export default function NewSpeechPage() {
  const [formValues, setFormValues] = useState<MessageFormState>(initialFormState);
  const [generatedLink, setGeneratedLink] = useState("");
  const [savedSpeech, setSavedSpeech] = useState<SavedSpeech | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const currentTreatment = treatment(formValues.gender);
  const formattedDate = formatLongDate(formValues.date);
  const messageName = formValues.brotherName.trim() || "Completar nombre";
  const messageDate = formValues.date ? formatLongDate(formValues.date) : "Completar fecha";
  const messageTopic = formValues.topic.trim() || "Completar tema";
  const messageTime = `${formValues.time} minutos`;
  const messageReferences = formValues.references.trim() || "Completar referencias";

  const handleGenerateMessage = async () => {
    setIsSaving(true);
    setSaveError("");
    setGeneratedLink("");
    setSavedSpeech(null);

    const response = await fetch("/api/speeches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formValues.brotherName.trim(),
        gender: formValues.gender,
        date: formValues.date ? formValues.date.format("YYYY-MM-DD") : undefined,
        speech: formValues.topic.trim(),
        time: formValues.time,
        references: formValues.references.trim(),
        additional_instructions: "",
        internal_observations: null,
      }),
    });

    const result = (await response.json()) as SpeechPostResponse;

    setIsSaving(false);

    if (!response.ok || !result.success || !result.data?.id) {
      const errorMessage = result.error || "No se pudo guardar el mensaje";
      setSaveError(errorMessage);
      message.error("No se pudo guardar el mensaje en Supabase");
      return;
    }

    const publicLink = `${window.location.origin}/m/${result.data.id}`;

    setSavedSpeech(result.data);
    setGeneratedLink(publicLink);
    message.success("Mensaje guardado correctamente");
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;

    await navigator.clipboard.writeText(generatedLink);
    message.success("Link copiado");
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <Title level={2} style={{ margin: 0 }}>
          Nuevo mensaje
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Prepará la información del discurso y revisá la vista previa antes de compartir.
        </Paragraph>
      </div>

      <Row gutter={[22, 22]} align="top">
        <Col xs={24} lg={10}>
          <Card className="form-card" title="Datos del discurso">
            <Form layout="vertical">
              <Form.Item label="Género">
                <Select
                  value={formValues.gender}
                  options={[
                    { value: "masculine", label: "Masculino" },
                    { value: "feminine", label: "Femenino" },
                  ]}
                  onChange={(value: Gender) =>
                    setFormValues((current) => ({
                      ...current,
                      gender: value,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item label="Nombre del hermano/a">
                <Input
                  value={formValues.brotherName}
                  placeholder="Ej. Juan Pérez"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      brotherName: event.target.value,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item label="Fecha del discurso">
                <DatePicker
                  value={formValues.date}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  onChange={(date) =>
                    setFormValues((current) => ({
                      ...current,
                      date,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item label="Tema">
                <Input
                  value={formValues.topic}
                  placeholder="Ej. Fe en Jesucristo"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      topic: event.target.value,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item label="Tiempo asignado">
                <Space.Compact style={{ width: "100%" }}>
                  <InputNumber
                    value={formValues.time}
                    min={1}
                    precision={0}
                    step={1}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      setFormValues((current) => ({
                        ...current,
                        time: typeof value === "number" ? value : 10,
                      }))
                    }
                  />
                  <span className="time-addon">minutos</span>
                </Space.Compact>
              </Form.Item>

              <Form.Item label="Referencias">
                <TextArea
                  rows={3}
                  value={formValues.references}
                  placeholder="Escrituras, discursos o enlaces de referencia"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      references: event.target.value,
                    }))
                  }
                />
              </Form.Item>

              <Button type="primary" loading={isSaving} onClick={handleGenerateMessage}>
                Generar mensaje para compartir
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <div className="preview-stack">
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              {savedSpeech ? (
                <>
                  <PublicMessageCard
                    title="Así lo verá el hermano/a"
                    name={savedSpeech.name}
                    gender={savedSpeech.gender || formValues.gender}
                    date={savedSpeech.date}
                    topic={savedSpeech.speech}
                    time={savedSpeech.time}
                    references={savedSpeech.references}
                  />

                  <div className="share-link-box">
                    <Text strong>Link para compartir</Text>
                    <Space.Compact style={{ width: "100%", marginTop: 10 }}>
                      <Input value={generatedLink} readOnly />
                      <Button onClick={handleCopyLink}>Copiar link</Button>
                    </Space.Compact>
                    <Button
                      type="link"
                      href={generatedLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ paddingLeft: 0, marginTop: 8 }}
                    >
                      Abrir vista del hermano/a
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="message-preview-card live-message-preview" title="Vista previa del mensaje">
                  <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                    {saveError ? (
                      <Alert
                        type="error"
                        showIcon
                        title="Error al guardar"
                        description={saveError}
                      />
                    ) : null}

                    <div className="live-preview-list">
                      <Paragraph>
                        <Text strong>{currentTreatment}:</Text>{" "}
                        {displayValue(formValues.brotherName)}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Fecha:</Text> {formattedDate}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Tema:</Text> {displayValue(formValues.topic)}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Tiempo asignado:</Text> {messageTime}
                      </Paragraph>
                      <Paragraph>
                        <Text strong>Referencias:</Text>{" "}
                        {renderTextWithLinks(formValues.references)}
                      </Paragraph>
                    </div>

                    <div className="live-message-final">
                      {currentTreatment} {messageName}, se le asignó un mensaje para el día{" "}
                      {messageDate} sobre el tema {messageTopic}. Tiempo asignado:{" "}
                      {messageTime}. Referencias: {messageReferences}.
                    </div>

                    <GuidanceBlock />
                  </Space>
                </Card>
              )}
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
}
