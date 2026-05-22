"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Button, DatePicker, InputNumber } from "antd";
import { useState } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";

const hymnsByNumber = hymnsByNumberData as Record<string, string>;

type LineFieldProps = {
  label: string;
  className?: string;
};

type LinedTextProps = {
  label: string;
  note?: string;
  rows: number;
  className?: string;
};

function LineField({ label, className = "" }: LineFieldProps) {
  return (
    <label className={`minute-field ${className}`}>
      <span>{label}</span>
      <input type="text" />
    </label>
  );
}

function HymnField({ label, className = "" }: LineFieldProps) {
  const [hymnTitle, setHymnTitle] = useState("");

  const handleHymnNumberChange = (value: number | string | null) => {
    if (value === null || value === "") {
      setHymnTitle("");
      return;
    }

    setHymnTitle(hymnsByNumber[String(value)] ?? "");
  };

  return (
    <label className={`minute-field minute-hymn-field ${className}`}>
      <span>{label}</span>
      <InputNumber
        className="minute-number-input minute-hymn-number hymn-number-input"
        controls={false}
        min={0}
        onChange={handleHymnNumberChange}
        aria-label={`${label} numero`}
      />
      <input
        type="text"
        value={hymnTitle}
        onChange={(event) => setHymnTitle(event.target.value)}
        aria-label={`${label} nombre`}
      />
    </label>
  );
}

function LinedText({ label, note, rows, className = "" }: LinedTextProps) {
  return (
    <section className={`minute-section ${className}`}>
      <div className="minute-section-title">
        <strong>{label}</strong>
        {note ? <span>{note}</span> : null}
      </div>
      <textarea className="minute-lined-text" rows={rows} />
    </section>
  );
}

function TableRows({ count, cells }: { count: number; cells: number }) {
  return Array.from({ length: count }, (_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: cells }, (_, cellIndex) => (
        <td key={cellIndex}>
          <input type="text" aria-label={`Fila ${rowIndex + 1}, columna ${cellIndex + 1}`} />
        </td>
      ))}
    </tr>
  ));
}

export function SacramentalMinuteSheet() {
  return (
    <div className="minute-workspace">
      <div className="minute-toolbar no-print">
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        >
          Exportar PDF
        </Button>
      </div>

      <section className="minute-sheet" aria-label="Reunion Sacramental">
        <header className="minute-top minute-top-row">
          <h1>Reunión Sacramental</h1>

          <table className="minute-summary-table minute-meta-box" aria-label="Fecha y asistencia">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Asistencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <DatePicker
                    className="minute-date-picker"
                    format="DD-MM-YYYY"
                    inputReadOnly={false}
                    placeholder=""
                    suffixIcon={null}
                    aria-label="Fecha"
                  />
                </td>
                <td>
                  <InputNumber
                    className="minute-number-input minute-attendance-input"
                    controls={false}
                    min={0}
                    aria-label="Asistencia"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </header>

        <section className="minute-two-columns minute-basic">
          <LineField label="Preside" />
          <LineField label="Dirige" />
        </section>

        <LinedText label="Bienvenida y reconocimiento de autoridades" rows={2} />

        <LinedText
          label="Anuncios:"
          note="(deben reducirse al mínimo)"
          rows={5}
          className="minute-announcements"
        />

        <section className="minute-section minute-music">
          <HymnField label="Primer himno" className="minute-full-line" />
          <div className="minute-two-columns">
            <LineField label="Directora" />
            <LineField label="Pianista" />
          </div>
          <LineField label="Primera oración" className="minute-prayer-field" />
        </section>

        <section className="minute-section minute-business">
          <div className="minute-section-title minute-title-with-copy">
            <strong>Asuntos de barrio y estaca</strong>
            <span>Ordenanzas, sostenimientos, relevos, presentaciones y otros asuntos.</span>
          </div>
          <table className="minute-table">
            <thead>
              <tr>
                <th>Asunto</th>
                <th>Nombre</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <TableRows count={5} cells={3} />
            </tbody>
          </table>
        </section>

        <section className="minute-section minute-sacrament">
          <HymnField label="Himno sacramental" />
        </section>

        <section className="minute-section minute-messages">
          <div className="minute-section-title minute-title-with-copy">
            <strong>Tiempo de mensajes:</strong>
            <span>
              (mensajes del Evangelio, Testimonios, cantos de la congregación u otra música)
            </span>
          </div>
          <table className="minute-table minute-message-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tiempo</th>
                <th>Tema</th>
              </tr>
            </thead>
            <tbody>
              <TableRows count={5} cells={3} />
            </tbody>
          </table>
        </section>

        <section className="minute-section minute-closing">
          <HymnField label="Último himno" />
          <LineField label="Última oración" />
        </section>
      </section>
    </div>
  );
}
