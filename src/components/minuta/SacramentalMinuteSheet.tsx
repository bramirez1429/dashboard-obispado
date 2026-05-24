"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Button, DatePicker, InputNumber, Select } from "antd";
import { useState } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";

const hymnsByNumber = hymnsByNumberData as Record<string, string>;
const hymnOptions = Object.entries(hymnsByNumber)
  .sort(([firstNumber], [secondNumber]) => Number(firstNumber) - Number(secondNumber))
  .map(([number, title]) => ({
    value: number,
    label: `${number} - ${title}`,
  }));

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
  const [hymnNumber, setHymnNumber] = useState<string>();
  const [hymnTitle, setHymnTitle] = useState("");

  const updateHymn = (value?: string) => {
    if (!value) {
      setHymnNumber(undefined);
      setHymnTitle("");
      return;
    }

    setHymnNumber(value);
    setHymnTitle(hymnsByNumber[value] ?? "");
  };

  const handleHymnSearch = (value: string) => {
    if (/^\d*$/.test(value)) {
      updateHymn(value || undefined);
    }
  };

  return (
    <label className={`minute-field minute-hymn-field ${className}`}>
      <span>{label}</span>
      <span className="hymn-select-wrapper">
        <Select
          className="minute-hymn-select hymn-number-input"
          value={hymnNumber}
          options={hymnOptions}
          showSearch
          suffixIcon={null}
          placeholder=""
          optionFilterProp="label"
          optionLabelProp="value"
          popupMatchSelectWidth={false}
          styles={{
            popup: {
              root: { minWidth: 320 },
            },
          }}
          filterOption={(input, option) =>
            String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          onChange={(value) => updateHymn(value)}
          onSearch={handleHymnSearch}
          aria-label={`${label} numero`}
        />
      </span>
      <span className="hymn-print-value">
        {hymnNumber ? `${hymnNumber} - ${hymnTitle}` : ""}
      </span>
      <input
        className="hymn-title-input"
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
          <h1 className="minute-title">Reunión Sacramental</h1>

          <table
            className="minute-summary-table minute-meta-box minute-meta-grid"
            aria-label="Fecha y asistencia"
          >
            <thead>
              <tr>
                <th className="minute-meta-header-cell">Fecha</th>
                <th className="minute-meta-header-cell">Asistencia</th>
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
