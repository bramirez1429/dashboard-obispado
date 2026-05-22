"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space } from "antd";
import Text from "antd/es/typography/Text";

const { TextArea } = Input;

function LineInput({ label }: { label: string }) {
  return (
    <div className="minute-line-field">
      <span>{label}</span>
      <Input variant="borderless" />
    </div>
  );
}

function LinedArea({
  label,
  note,
  rows,
}: {
  label: string;
  note?: string;
  rows: number;
}) {
  return (
    <section className="minute-doc-section">
      <div className="minute-doc-section-heading">
        <strong>{label}</strong>
        {note ? <small>{note}</small> : null}
      </div>
      <TextArea
        variant="borderless"
        className="minute-lined-area"
        autoSize={{ minRows: rows, maxRows: rows }}
      />
    </section>
  );
}

function EmptyRows({ count, cells }: { count: number; cells: number }) {
  return Array.from({ length: count }, (_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: cells }, (_, cellIndex) => (
        <td key={cellIndex}>
          <Input variant="borderless" />
        </td>
      ))}
    </tr>
  ));
}

export function SacramentalMinuteSheet() {
  return (
    <div className="minute-workspace">
      <Card className="minute-toolbar no-print">
        <Space>
          <Text strong>Minuta sacramental</Text>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Exportar PDF
          </Button>
        </Space>
      </Card>

      <section className="minute-sheet" aria-label="Minuta sacramental">
        <header className="minute-doc-header">
          <div>
            <h1>Reunión Sacramental</h1>
            <p>Minuta de reunión</p>
          </div>

          <div className="minute-summary-box">
            <LineInput label="Fecha" />
            <LineInput label="Asistencia" />
          </div>
        </header>

        <section className="minute-doc-block minute-basic-block">
          <LineInput label="Preside" />
          <LineInput label="Dirige" />
        </section>

        <LinedArea
          label="Bienvenida y reconocimiento de autoridades"
          rows={2}
        />

        <LinedArea
          label="Anuncios"
          note="deben reducirse al mínimo"
          rows={4}
        />

        <section className="minute-doc-block minute-music-block">
          <div className="minute-first-hymn-line">
            <LineInput label="Primer himno" />
          </div>
          <LineInput label="Directora" />
          <LineInput label="Pianista" />
          <div className="minute-prayer-line">
            <LineInput label="Primera oración" />
          </div>
        </section>

        <section className="minute-doc-section">
          <div className="minute-doc-section-heading">
            <strong>Asuntos de barrio y estaca</strong>
            <small>Ordenanzas, sostenimientos, relevos y otros asuntos.</small>
          </div>
          <table className="minute-doc-table">
            <thead>
              <tr>
                <th>Asunto</th>
                <th>Nombre</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <EmptyRows count={5} cells={3} />
            </tbody>
          </table>
        </section>

        <section className="minute-sacrament-line">
          <LineInput label="Himno sacramental" />
        </section>

        <section className="minute-doc-section">
          <div className="minute-doc-section-heading">
            <strong>Tiempo de mensajes</strong>
            <small>Discursos asignados y tiempo sugerido.</small>
          </div>
          <table className="minute-doc-table minute-message-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tiempo</th>
                <th>Tema</th>
              </tr>
            </thead>
            <tbody>
              <EmptyRows count={4} cells={3} />
            </tbody>
          </table>
        </section>

        <section className="minute-doc-block minute-final-grid">
          <LineInput label="Último himno" />
          <LineInput label="Última oración" />
        </section>
      </section>
    </div>
  );
}
