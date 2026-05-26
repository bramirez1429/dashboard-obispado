"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Empty } from "antd";

type Hymn = {
  number?: string;
  title?: string;
};

type WardAndStakeBusiness = {
  subject?: string;
  name?: string;
  details?: string;
};

type Message = {
  name?: string;
  time?: number;
  topic?: string;
};

export type MeetingMinute = {
  id?: string;
  attendance?: number;
  date?: string;
  presides?: string;
  leads?: string;
  welcomeAndAcknowledgmentsOfAuthorities?: string;
  announcements?: string;
  firstHymn?: Hymn;
  director?: string;
  pianist?: string;
  openingPrayer?: string;
  wardAndStakeBusiness?: WardAndStakeBusiness;
  sacramentalHymn?: Hymn;
  messages?: Message[];
  lastHymn?: Hymn;
  closingPrayer?: string;
};

type MeetingMinuteViewProps = {
  minute?: MeetingMinute | null;
};

const getText = (value?: string) => {
  return value?.trim() ? value : "—";
};

const getHymnText = (hymn?: Hymn) => {
  if (!hymn?.number && !hymn?.title) return "—";
  if (hymn.number && hymn.title) return `${hymn.number} - ${hymn.title}`;
  return hymn.number || hymn.title || "—";
};

const getWardAndStakeBusinessText = (business?: WardAndStakeBusiness) => {
  const subject = business?.subject?.trim();
  const name = business?.name?.trim();
  const details = business?.details?.trim();

  const title =
    subject && name
      ? `${subject} de la Hna./Hno. ${name}`
      : subject || name || "—";

  return {
    title,
    details: details || "",
  };
};

const FieldLine = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="public-minute-field-line">
    <span className="public-minute-label">{label}</span>
    <span className="public-minute-value">{value || "—"}</span>
  </div>
);

const PublicModule = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="public-minute-module">
    <h2>{title}</h2>
    <div>{children}</div>
  </section>
);

const PublicMinuteStyles = () => (
  <style>{`
    .public-minute-page {
      min-height: 100vh;
      background: #EEF3F7;
      padding: 32px 16px;
    }

    .public-minute-container {
      max-width: 980px;
      margin: 0 auto;
    }

    .public-minute-back {
      color: var(--public-minute-blue, #31475a);
      font-weight: 700;
      text-decoration: none;
    }

    .public-minute-sheet {
      margin-top: 18px;
      background: #FFFFFF;
      border: 1px solid #C9D6E2;
      border-radius: 22px;
      padding: clamp(24px, 4vw, 44px);
      box-shadow: 0 10px 28px rgba(47, 42, 37, 0.06);
      color: #2f2a25;
      font-family: Arial, Helvetica, sans-serif;
      --public-minute-blue: #31475a;
      --minute-border-soft: #D7E1EA;
    }

    .public-minute-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .public-minute-header h1 {
      margin: 0;
      color: var(--public-minute-blue, #31475a);
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: 0;
    }

    .public-minute-summary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 24px;
      border-top: 1px solid #C9D6E2;
      border-bottom: 1px solid #C9D6E2;
      padding: 16px 0;
    }

    .public-minute-module {
      margin-top: 18px;
      padding: 20px;
      background: #F7FAFC;
      border: 1px solid var(--minute-border-soft, #e8ded0);
      border-radius: 16px;
    }

    .public-minute-module h2 {
      margin: 0 0 16px;
      color: var(--public-minute-blue, #31475a);
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
    }

    .public-minute-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 28px;
    }

    .public-minute-field-line {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .public-minute-label {
      color: var(--public-minute-blue, #31475a);
      font-size: 13px;
      font-weight: 700;
      line-height: 1.2;
    }

    .public-minute-value {
      color: #2f2a25;
      font-size: 16px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }

    .public-minute-paragraph {
      margin: 0;
      color: #2f2a25;
      font-size: 16px;
      line-height: 1.75;
      white-space: pre-wrap;
    }

    .public-minute-business-title {
      margin: 0 0 6px;
      color: #2f2a25;
      font-size: 17px;
      font-weight: 700;
      line-height: 1.6;
    }

    .public-minute-business-detail {
      margin: 0;
      color: #6f6257;
      font-size: 16px;
      line-height: 1.6;
    }

    .public-minute-feature-value {
      margin: 0;
      color: #2f2a25;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.6;
    }

    .public-minute-messages {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 28px;
    }

    .public-minute-message {
      padding: 14px 0;
      border-bottom: 1px solid var(--minute-border-soft, #e8ded0);
    }

    .public-minute-message:last-child {
      border-bottom: none;
    }

    .public-minute-message-name {
      margin: 0 0 4px;
      color: var(--public-minute-blue, #31475a);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.4;
    }

    .public-minute-message-topic {
      margin: 0;
      color: #2f2a25;
      font-size: 16px;
      line-height: 1.65;
    }

    .public-minute-empty {
      padding: 32px 0;
    }

    @media (max-width: 640px) {
      .public-minute-page {
        padding: 22px 12px;
      }

      .public-minute-summary,
      .public-minute-grid,
      .public-minute-messages {
        grid-template-columns: 1fr;
      }

      .public-minute-sheet {
        border-radius: 16px;
        padding: 22px 18px;
      }

      .public-minute-module {
        padding: 16px;
      }
    }
  `}</style>
);

export const MeetingMinuteView = ({ minute }: MeetingMinuteViewProps) => {
  if (!minute) {
    return (
      <main className="public-minute-page">
        <PublicMinuteStyles />
        <div className="public-minute-container">
          <Link href="/minuta" className="public-minute-back">
            ← Volver
          </Link>

          <div className="public-minute-sheet">
            <div className="public-minute-empty">
              <Empty description="Todavía no hay una minuta guardada." />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const business = getWardAndStakeBusinessText(minute.wardAndStakeBusiness);

  return (
    <main className="public-minute-page">
      <PublicMinuteStyles />
      <div className="public-minute-container">
        <Link href="/minuta" className="public-minute-back">
          ← Volver
        </Link>

        <article className="public-minute-sheet">
          <header className="public-minute-header">
            <h1>Reunión Sacramental</h1>

            <div className="public-minute-summary">
              <FieldLine label="Fecha" value={getText(minute.date)} />
              <FieldLine label="Preside" value={getText(minute.presides)} />
              <FieldLine label="Dirige" value={getText(minute.leads)} />
            </div>
          </header>

          <PublicModule title="Bienvenida y reconocimientos">
            <p className="public-minute-paragraph">
              {getText(minute.welcomeAndAcknowledgmentsOfAuthorities)}
            </p>
          </PublicModule>

          <PublicModule title="Anuncios">
            <p className="public-minute-paragraph">{getText(minute.announcements)}</p>
          </PublicModule>

          <PublicModule title="Inicio de la reunión">
            <div className="public-minute-grid">
              <FieldLine label="Primer himno" value={getHymnText(minute.firstHymn)} />
              <FieldLine label="Directora" value={getText(minute.director)} />
              <FieldLine label="Pianista" value={getText(minute.pianist)} />
              <FieldLine label="Primera oración" value={getText(minute.openingPrayer)} />
            </div>
          </PublicModule>

          <PublicModule title="Asuntos de barrio y estaca">
            <p className="public-minute-business-title">{business.title}</p>
            {business.details ? (
              <p className="public-minute-business-detail">{business.details}</p>
            ) : null}
          </PublicModule>

          <PublicModule title="Himno sacramental">
            <p className="public-minute-feature-value">
              {getHymnText(minute.sacramentalHymn)}
            </p>
          </PublicModule>

          <PublicModule title="Mensajes">
            {minute.messages?.length ? (
              <div className="public-minute-messages">
                {minute.messages.map((message, index) => (
                  <div className="public-minute-message" key={`${message.name}-${index}`}>
                    {message.name?.trim() ? (
                      <p className="public-minute-message-name">{message.name}</p>
                    ) : null}
                    <p className="public-minute-message-topic">
                      {getText(message.topic)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="public-minute-paragraph">—</p>
            )}
          </PublicModule>

          <PublicModule title="Final de la reunión">
            <div className="public-minute-grid">
              <FieldLine label="Último himno" value={getHymnText(minute.lastHymn)} />
              <FieldLine label="Última oración" value={getText(minute.closingPrayer)} />
            </div>
          </PublicModule>
        </article>
      </div>
    </main>
  );
};

export default MeetingMinuteView;
