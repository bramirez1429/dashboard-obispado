'use client'
import { Fragment, ReactNode } from "react";
import { Card, Col, Divider, Row, Space, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export type PublicSpeech = {
  id: string | number;
  name: string | null;
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

function renderTextWithLinks(text: string) {
  if (!text.trim()) return "Sin completar";

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => (
    <Fragment key={`${line}-${lineIndex}`}>
      {line.split(urlRegex).map((part, partIndex) =>
        /^https?:\/\//.test(part) ? (
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
      {lineIndex < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

function GuidanceBlock() {
  return (
    <div className="message-guidance-box">
      <Typography.Title level={5}>Orientación para preparar el mensaje</Typography.Title>
      <Typography.Paragraph>
        Para preparar su mensaje, le invitamos a utilizar recursos aprobados de la
        Iglesia, tales como:
      </Typography.Paragraph>
      <ul>
        <li>Las Escrituras canónicas</li>
        <li>La Guía para el Estudio de las Escrituras</li>
        <li>Mensajes de la Conferencia General</li>
        <li>Revistas Liahona</li>
        <li>Experiencias personales apropiadas que fortalezcan la fe</li>
      </ul>
      <Typography.Paragraph>Al preparar su mensaje:</Typography.Paragraph>
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
      <Typography.Paragraph className="message-guidance-closing">
        Muchas gracias por su disposición para participar y servir en la reunión
        sacramental.
      </Typography.Paragraph>
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

          <Row gutter={[16, 16]} className="public-assignment-grid">
            <Col xs={24} md={8}>
              <DetailCard label="Hermano/a">{displayValue(speech.name)}</DetailCard>
            </Col>
            <Col xs={24} md={8}>
              <DetailCard label="Tiempo asignado">
                {speech.time ? `${speech.time} minutos` : "Sin completar"}
              </DetailCard>
            </Col>
            <Col xs={24} md={8}>
              <DetailCard label="Fecha">{formatLongDate(speech.date)}</DetailCard>
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
        </Card>
      </div>
    </main>
  );
};

export default PublicMessageCard;
