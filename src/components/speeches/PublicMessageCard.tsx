'use client'
import { Fragment, ReactNode } from "react";
import { ExportOutlined } from "@ant-design/icons";
import { Card, Col, Divider, Row, Space, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export type PublicSpeech = {
  id: string | number;
  name: string | null;
  gender: "masculine" | "feminine" | null;
  date: string | null;
  speech: string | null;
  time: number | null;
  references: string | null;
};

function formatLongDate(date: string | null) {
  if (!date) return "Sin completar";

  return dayjs(date).locale("es").format("dddd D [de] MMMM [del] YYYY");
}

function displayValue(value: string | null) {
  return value?.trim() || "Sin completar";
}

function getSpeakerNameWithPrefix(speech: PublicSpeech) {
  const speakerName = displayValue(speech.name);

  if (speech.gender === "feminine") {
    return `Hna. ${speakerName}`;
  }

  if (speech.gender === "masculine") {
    return `Hno. ${speakerName}`;
  }

  return speakerName;
}

function renderTextWithLinks(text: string) {
  if (!text.trim()) return "Sin completar";

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => (
    <Fragment key={`${line}-${lineIndex}`}>
      {line.split(urlRegex).map((part, partIndex) =>
        /^https?:\/\//.test(part) ? (
          <a
            className="speech-reference-link"
            key={`${part}-${partIndex}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{part}</span>
            <ExportOutlined aria-hidden="true" />
          </a>
        ) : (
          <Fragment key={`${part}-${partIndex}`}>{part}</Fragment>
        ),
      )}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function GuidanceBlock() {
  return (
    <div className="message-guidance-box">
      <Typography.Title level={5}>Orientación para preparar su mensaje</Typography.Title>
      <Typography.Paragraph>
        Agradecemos su disposición para participar en la reunión sacramental. Al
        preparar su mensaje, le invitamos a utilizar recursos oficiales de la
        Iglesia, tales como:
      </Typography.Paragraph>
      <ul>
        <li>Las Escrituras canónicas.</li>
        <li>La Guía para el Estudio de las Escrituras.</li>
        <li>Mensajes de la Conferencia General.</li>
        <li>Artículos y mensajes de la revista Liahona.</li>
        <li>
          Experiencias personales apropiadas que fortalezcan la fe y edifiquen a
          los demás.
        </li>
      </ul>
      <Typography.Title level={5}>Sugerencias para la preparación</Typography.Title>
      <ul>
        <li>
          Ore y busque la guía del Espíritu Santo durante su estudio y preparación.
        </li>
        <li>Centre su mensaje en Jesucristo, Su Evangelio y Sus enseñanzas.</li>
        <li>
          Enseñe principios que fortalezcan la fe, inspiren la conversión y ayuden
          a los miembros a acercarse más al Salvador.
        </li>
        <li>
          Comparta experiencias personales y testimonios que sean reverentes,
          apropiados y edificantes.
        </li>
        <li>
          Evite comentarios negativos, controversiales o experiencias que no
          contribuyan al espíritu de adoración de la reunión.
        </li>
      </ul>
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
      <Typography.Text type="secondary">{label}</Typography.Text>
      <div className="public-detail-value">{children}</div>
    </Card>
  );
}

const PublicMessageCard = ({ speech }: { speech: PublicSpeech }) => {
  const speakerName = getSpeakerNameWithPrefix(speech);

  return (
    <main className="public-message-page">
      <div className="public-message-shell">
        <Card className="public-message-card public-message-readonly public-message-final-card">
          <div className="public-assignment-header">
            <Space orientation="vertical" size={0} style={{ width: "100%" }}>
              <Typography.Title level={2}>Mensaje asignado</Typography.Title>
              <Typography.Paragraph type="secondary">
                Reunión sacramental
              </Typography.Paragraph>
            </Space>
            <Divider style={{ margin: 0 }} />
          </div>

          <Typography.Paragraph>
            {speakerName}, agradecemos sinceramente su disposición para participar
            en la reunión sacramental y compartir un mensaje con la congregación.
            Su preparación, testimonio y deseo de servir pueden ayudar a fortalecer
            la fe de los miembros e invitar el Espíritu del Señor durante la reunión.
          </Typography.Paragraph>

          <Row gutter={[16, 16]} className="public-assignment-grid">
            <Col xs={24} md={12}>
              <DetailCard label="Fecha">{formatLongDate(speech.date)}</DetailCard>
            </Col>
            <Col xs={24} md={12}>
              <DetailCard label="Tiempo">
                {speech.time ? `${speech.time} minutos` : "Sin completar"}
              </DetailCard>
            </Col>
            <Col xs={24}>
              <DetailCard label="Tema">{displayValue(speech.speech)}</DetailCard>
            </Col>
            <Col xs={24}>
              <DetailCard label="Referencias" className="references-card">
                {renderTextWithLinks(speech.references || "")}
              </DetailCard>
            </Col>
          </Row>

          <GuidanceBlock />

          <div className="public-message-closing-note">
            <Typography.Paragraph>
              Muchas gracias por su disposición para participar y servir en la
              reunión sacramental.
            </Typography.Paragraph>
            <Typography.Paragraph>
              Atentamente,
              <br />
              el obispado.
            </Typography.Paragraph>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default PublicMessageCard;
