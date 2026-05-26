"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Button, DatePicker, InputNumber, Modal, Select, message } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Link from "next/link";
import { useEffect, useState } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";
import type {
  MeetingMinute,
  MeetingMinuteHymn,
  MeetingMinuteMessage,
  MeetingMinuteWardAndStakeBusiness,
} from "@/types/meeting-minute";

dayjs.extend(customParseFormat);

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
  value?: string;
  onChange?: (value: string) => void;
};

type LinedTextProps = {
  label: string;
  note?: string;
  rows: number;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

type HymnFieldProps = {
  label: string;
  className?: string;
  value: MeetingMinuteHymn;
  onChange: (value: MeetingMinuteHymn) => void;
};

const emptyBusinessRows = Array.from({ length: 5 }, () => ["", "", ""]);
const emptyMessageRows = Array.from({ length: 5 }, () => ["", "", ""]);

const emptyHymn: MeetingMinuteHymn = {
  number: "",
  title: "",
};

const emptyWardAndStakeBusiness: MeetingMinuteWardAndStakeBusiness = {
  subject: "",
  name: "",
  details: "",
};

function LineField({ label, className = "", value = "", onChange }: LineFieldProps) {
  return (
    <label className={`minute-field ${className}`}>
      <span>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function HymnField({
  label,
  className = "",
  value,
  onChange,
}: HymnFieldProps) {
  const updateHymn = (value?: string) => {
    if (!value) {
      onChange(emptyHymn);
      return;
    }

    onChange({ number: value, title: hymnsByNumber[value] ?? "" });
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
          value={value.number || undefined}
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
        {value.number ? `${value.number} - ${value.title}` : ""}
      </span>
      <input
        className="hymn-title-input"
        type="text"
        value={value.title}
        onChange={(event) => onChange({ ...value, title: event.target.value })}
        aria-label={`${label} nombre`}
      />
    </label>
  );
}

function LinedText({
  label,
  note,
  rows,
  className = "",
  value = "",
  onChange,
}: LinedTextProps) {
  return (
    <section className={`minute-section ${className}`}>
      <div className="minute-section-title">
        <strong>{label}</strong>
        {note ? <span>{note}</span> : null}
      </div>
      <textarea
        className="minute-lined-text"
        rows={rows}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </section>
  );
}

function TableRows({
  rows,
  labels,
  onCellChange,
}: {
  rows: string[][];
  labels: string[];
  onCellChange: (rowIndex: number, cellIndex: number, value: string) => void;
}) {
  return rows.map((row, rowIndex) => (
    <tr key={rowIndex}>
      {row.map((cellValue, cellIndex) => (
        <td key={cellIndex}>
          <input
            type="text"
            value={cellValue}
            aria-label={`Fila ${rowIndex + 1}, ${labels[cellIndex]}`}
            onChange={(event) =>
              onCellChange(rowIndex, cellIndex, event.target.value)
            }
          />
        </td>
      ))}
    </tr>
  ));
}

function rowsToWardAndStakeBusiness(
  rows: string[][]
): MeetingMinuteWardAndStakeBusiness {
  const row = rows.find(([subject, name, details]) => subject || name || details);

  if (!row) {
    return emptyWardAndStakeBusiness;
  }

  const [subject, name, details] = row;
  return { subject, name, details };
}

function wardAndStakeBusinessToRows(
  wardAndStakeBusiness: MeetingMinuteWardAndStakeBusiness
) {
  const rows = Array.from({ length: 5 }, () => ["", "", ""]);
  rows[0] = [
    wardAndStakeBusiness.subject,
    wardAndStakeBusiness.name,
    wardAndStakeBusiness.details,
  ];
  return rows;
}

function rowsToMessages(rows: string[][]): MeetingMinuteMessage[] {
  return rows
    .map(([name, time, topic]) => {
      const parsedTime = Number(time);

      return {
        name,
        time: Number.isFinite(parsedTime) && time ? parsedTime : 0,
        topic,
      };
    })
    .filter((item) => item.name || item.time || item.topic);
}

function messagesToRows(messages: MeetingMinuteMessage[]) {
  const rows = Array.from({ length: 5 }, () => ["", "", ""]);

  messages.slice(0, 5).forEach((item, index) => {
    rows[index] = [item.name, item.time ? String(item.time) : "", item.topic];
  });

  return rows;
}

function validateMeetingMinuteBeforeSave(formValues: MeetingMinute) {
  const missingFields: string[] = [];

  if (!formValues.date?.trim()) missingFields.push("Fecha");
  if (!formValues.presides?.trim()) missingFields.push("Preside");
  if (!formValues.leads?.trim()) missingFields.push("Dirige");

  if (!formValues.firstHymn?.number?.trim()) {
    missingFields.push("Número del primer himno");
  }
  if (!formValues.firstHymn?.title?.trim()) {
    missingFields.push("Título del primer himno");
  }

  if (!formValues.sacramentalHymn?.number?.trim()) {
    missingFields.push("Número del himno sacramental");
  }
  if (!formValues.sacramentalHymn?.title?.trim()) {
    missingFields.push("Título del himno sacramental");
  }

  if (!formValues.lastHymn?.number?.trim()) {
    missingFields.push("Número del último himno");
  }
  if (!formValues.lastHymn?.title?.trim()) {
    missingFields.push("Título del último himno");
  }

  if (!formValues.openingPrayer?.trim()) {
    missingFields.push("Primera oración");
  }
  if (!formValues.closingPrayer?.trim()) {
    missingFields.push("Última oración");
  }

  return missingFields;
}

export function SacramentalMinuteSheet() {
  const [minuteId, setMinuteId] = useState<string | number | undefined>();
  const [attendance, setAttendance] = useState(0);
  const [date, setDate] = useState("");
  const [presides, setPresides] = useState("");
  const [leads, setLeads] = useState("");
  const [
    welcomeAndAcknowledgmentsOfAuthorities,
    setWelcomeAndAcknowledgmentsOfAuthorities,
  ] = useState("");
  const [announcements, setAnnouncements] = useState("");
  const [firstHymn, setFirstHymn] = useState<MeetingMinuteHymn>(emptyHymn);
  const [director, setDirector] = useState("");
  const [pianist, setPianist] = useState("");
  const [openingPrayer, setOpeningPrayer] = useState("");
  const [wardAndStakeBusinessRows, setWardAndStakeBusinessRows] =
    useState(emptyBusinessRows);
  const [sacramentalHymn, setSacramentalHymn] =
    useState<MeetingMinuteHymn>(emptyHymn);
  const [messageRows, setMessageRows] = useState(emptyMessageRows);
  const [lastHymn, setLastHymn] = useState<MeetingMinuteHymn>(emptyHymn);
  const [closingPrayer, setClosingPrayer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMinute = async () => {
      try {
        const response = await fetch("/api/meeting-minutes");
        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error("Error loading Meeting_minutes", result.error);
          return;
        }

        const minute = result.data as MeetingMinute | null;

        if (!minute) {
          return;
        }

        setMinuteId(minute.id);
        setAttendance(minute.attendance || 0);
        setDate(minute.date || "");
        setPresides(minute.presides || "");
        setLeads(minute.leads || "");
        setWelcomeAndAcknowledgmentsOfAuthorities(
          minute.welcomeAndAcknowledgmentsOfAuthorities || ""
        );
        setAnnouncements(minute.announcements || "");
        setFirstHymn(minute.firstHymn || emptyHymn);
        setDirector(minute.director || "");
        setPianist(minute.pianist || "");
        setOpeningPrayer(minute.openingPrayer || "");
        setWardAndStakeBusinessRows(
          wardAndStakeBusinessToRows(
            minute.wardAndStakeBusiness || emptyWardAndStakeBusiness
          )
        );
        setSacramentalHymn(minute.sacramentalHymn || emptyHymn);
        setMessageRows(messagesToRows(minute.messages || []));
        setLastHymn(minute.lastHymn || emptyHymn);
        setClosingPrayer(minute.closingPrayer || "");
      } catch (error) {
        console.error("Error loading Meeting_minutes", error);
      }
    };

    void loadMinute();
  }, []);

  const updateTableCell = (
    rows: string[][],
    setRows: (rows: string[][]) => void,
    rowIndex: number,
    cellIndex: number,
    value: string
  ) => {
    const nextRows = rows.map((row, currentRowIndex) =>
      currentRowIndex === rowIndex
        ? row.map((cell, currentCellIndex) =>
            currentCellIndex === cellIndex ? value : cell
          )
        : row
    );

    setRows(nextRows);
  };

  const handleSaveMinute = async () => {
    const payload: MeetingMinute = {
      ...(minuteId ? { id: minuteId } : {}),
      attendance,
      date,
      presides,
      leads,
      welcomeAndAcknowledgmentsOfAuthorities,
      announcements,
      firstHymn,
      director,
      pianist,
      openingPrayer,
      wardAndStakeBusiness: rowsToWardAndStakeBusiness(
        wardAndStakeBusinessRows
      ),
      sacramentalHymn,
      messages: rowsToMessages(messageRows),
      lastHymn,
      closingPrayer,
    };

    const missingFields = validateMeetingMinuteBeforeSave(payload);

    if (missingFields.length > 0) {
      Modal.warning({
        title: "Faltan datos para guardar la minuta",
        content: (
          <div>
            <p>Para guardar la minuta, completá los siguientes campos:</p>
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        okText: "Entendido",
        centered: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/meeting-minutes", {
        method: minuteId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Error saving Meeting_minutes", result.error);
        message.error(result.error || "No se pudo guardar la minuta");
        return;
      }

      if (result.data?.id) {
        setMinuteId(result.data.id);
      }

      message.success("Minuta guardada correctamente");
    } catch (error) {
      console.error("Error saving Meeting_minutes", error);
      message.error("No se pudo guardar la minuta");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="minute-workspace">
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Link href="/minuta/ver">
          <Button type="primary">Ver minuta</Button>
        </Link>
      </div>

      <div className="minute-toolbar no-print">
        <Button onClick={handleSaveMinute} loading={isSaving}>
          Guardar minuta
        </Button>
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
                    value={date ? dayjs(date, "DD-MM-YYYY") : null}
                    onChange={(date) =>
                      setDate(date ? date.format("DD-MM-YYYY") : "")
                    }
                  />
                </td>
                <td>
                  <InputNumber
                    className="minute-number-input minute-attendance-input"
                    controls={false}
                    min={0}
                    aria-label="Asistencia"
                    value={attendance}
                    onChange={(value) =>
                      setAttendance(typeof value === "number" ? value : 0)
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </header>

        <section className="minute-two-columns minute-basic">
          <LineField label="Preside" value={presides} onChange={setPresides} />
          <LineField label="Dirige" value={leads} onChange={setLeads} />
        </section>

        <LinedText
          label="Bienvenida y reconocimiento de autoridades"
          rows={2}
          value={welcomeAndAcknowledgmentsOfAuthorities}
          onChange={setWelcomeAndAcknowledgmentsOfAuthorities}
        />

        <LinedText
          label="Anuncios:"
          note="(deben reducirse al mínimo)"
          rows={5}
          className="minute-announcements"
          value={announcements}
          onChange={setAnnouncements}
        />

        <section className="minute-section minute-music">
          <HymnField
            label="Primer himno"
            className="minute-full-line"
            value={firstHymn}
            onChange={setFirstHymn}
          />
          <div className="minute-two-columns">
            <LineField label="Directora" value={director} onChange={setDirector} />
            <LineField label="Pianista" value={pianist} onChange={setPianist} />
          </div>
          <LineField
            label="Primera oración"
            className="minute-prayer-field"
            value={openingPrayer}
            onChange={setOpeningPrayer}
          />
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
              <TableRows
                rows={wardAndStakeBusinessRows}
                labels={["Asunto", "Nombre", "Detalle"]}
                onCellChange={(rowIndex, cellIndex, value) =>
                  updateTableCell(
                    wardAndStakeBusinessRows,
                    setWardAndStakeBusinessRows,
                    rowIndex,
                    cellIndex,
                    value
                  )
                }
              />
            </tbody>
          </table>
        </section>

        <section className="minute-section minute-sacrament">
          <HymnField
            label="Himno sacramental"
            value={sacramentalHymn}
            onChange={setSacramentalHymn}
          />
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
              <TableRows
                rows={messageRows}
                labels={["Nombre", "Tiempo", "Tema"]}
                onCellChange={(rowIndex, cellIndex, value) =>
                  updateTableCell(
                    messageRows,
                    setMessageRows,
                    rowIndex,
                    cellIndex,
                    value
                  )
                }
              />
            </tbody>
          </table>
        </section>

        <section className="minute-section minute-closing">
          <HymnField
            label="Último himno"
            value={lastHymn}
            onChange={setLastHymn}
          />
          <LineField
            label="Última oración"
            value={closingPrayer}
            onChange={setClosingPrayer}
          />
        </section>
      </section>
    </div>
  );
}
