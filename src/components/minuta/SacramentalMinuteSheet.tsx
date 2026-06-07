"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Button, DatePicker, InputNumber, Modal, Select, message } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import hymnsByNumberData from "@/data/hymns-by-number.json";
import type {
  MeetingMinute,
  MeetingMinuteHymn,
  MeetingMinuteMessage,
  MeetingMinuteWardAndStakeBusiness,
  MeetingMinuteWardAndStakeBusinessValue,
} from "@/types/meeting-minute";

dayjs.extend(customParseFormat);

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

type LineFieldProps = {
  label: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
};

type LinedTextProps = {
  label: string;
  note?: string;
  rows: number;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  readOnlyDisplay?: "lines";
};

type HymnFieldProps = {
  label: string;
  className?: string;
  value: MeetingMinuteHymn;
  onChange: (value: MeetingMinuteHymn) => void;
  readOnly?: boolean;
};

const emptyHymn: MeetingMinuteHymn = {
  number: "",
  title: "",
  url: "",
};

const emptyWardAndStakeBusiness: MeetingMinuteWardAndStakeBusiness = {
  subject: "",
  name: "",
  details: "",
};

function withCatalogHymnData(hymn: MeetingMinuteHymn): MeetingMinuteHymn {
  const number = String(hymn.number ?? "");
  const catalogHymn = hymnsByNumber[number];

  return {
    number,
    title: hymn.title || catalogHymn?.title || "",
    url: hymn.url || catalogHymn?.url || "",
  };
}

function LineField({
  label,
  className = "",
  value = "",
  onChange,
  readOnly = false,
}: LineFieldProps) {
  return (
    <label className={`minute-field ${className}`}>
      <span>{label}</span>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
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
  readOnly = false,
}: HymnFieldProps) {
  if (readOnly) {
    return (
      <label className={`minute-field minute-hymn-field ${className}`}>
        <span>{label}</span>
        <span className="minute-hymn-readonly-value">
          {value.number ? `${value.number} ${value.title}` : ""}
        </span>
      </label>
    );
  }

  const updateHymn = (value?: string) => {
    if (!value) {
      onChange(emptyHymn);
      return;
    }

    const hymn = hymnsByNumber[value];

    onChange({
      number: String(hymn?.number ?? value),
      title: hymn?.title ?? "",
      url: hymn?.url ?? "",
    });
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
          value={value.number ? String(value.number) : undefined}
          options={hymnOptions}
          disabled={readOnly}
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
        readOnly={readOnly}
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
  readOnly = false,
  readOnlyDisplay,
}: LinedTextProps) {
  const readOnlyItems = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className={`minute-section ${className}`}>
      <div className="minute-section-title">
        <strong>{label}</strong>
        {note ? <span>{note}</span> : null}
      </div>
      {readOnly && readOnlyDisplay === "lines" ? (
        <div
          className="minute-lined-text minute-readonly-lines"
          style={
            {
              "--minute-readonly-screen-height": `${rows * 5.1}mm`,
              "--minute-readonly-print-height": `${rows * 4.75}mm`,
            } as CSSProperties
          }
        >
          {readOnlyItems.map((item, index) => (
            <div key={`${item}-${index}`}>{item}</div>
          ))}
        </div>
      ) : (
        <textarea
          className="minute-lined-text"
          rows={rows}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
    </section>
  );
}

function TableRows({
  rows,
  labels,
  onCellChange,
  readOnly = false,
}: {
  rows: string[][];
  labels: string[];
  onCellChange: (rowIndex: number, cellIndex: number, value: string) => void;
  readOnly?: boolean;
}) {
  return rows.map((row, rowIndex) => (
    <tr key={rowIndex}>
      {row.map((cellValue, cellIndex) => (
        <td key={cellIndex}>
          <input
            type="text"
            value={cellValue}
            readOnly={readOnly}
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
  wardAndStakeBusiness: MeetingMinuteWardAndStakeBusinessValue
) {
  const wardAndStakeBusinessItems = Array.isArray(wardAndStakeBusiness)
    ? wardAndStakeBusiness
    : [wardAndStakeBusiness];
  const businessRows = wardAndStakeBusinessItems
    .filter((item) => item.subject || item.name || item.details)
    .map((item) => [item.subject, item.name, item.details]);
  const fillerRows = Array.from(
    { length: Math.max(5 - businessRows.length, 0) },
    () => ["", "", ""]
  );

  return [...businessRows, ...fillerRows];
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

  if (!String(formValues.firstHymn?.number ?? "").trim()) {
    missingFields.push("Número del primer himno");
  }
  if (!formValues.firstHymn?.title?.trim()) {
    missingFields.push("Título del primer himno");
  }

  if (!String(formValues.sacramentalHymn?.number ?? "").trim()) {
    missingFields.push("Número del himno sacramental");
  }
  if (!formValues.sacramentalHymn?.title?.trim()) {
    missingFields.push("Título del himno sacramental");
  }

  if (!String(formValues.lastHymn?.number ?? "").trim()) {
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

type SacramentalMinuteSheetProps = {
  initialDate?: string;
  initialMinute?: MeetingMinute;
  readOnly?: boolean;
};

export function SacramentalMinuteSheet({
  initialDate,
  initialMinute,
  readOnly = false,
}: SacramentalMinuteSheetProps) {
  const [minuteId, setMinuteId] = useState<string | number | undefined>(
    initialMinute?.id
  );
  const [attendance, setAttendance] = useState(initialMinute?.attendance || 0);
  const [date, setDate] = useState(initialMinute?.date || initialDate || "");
  const [presides, setPresides] = useState(initialMinute?.presides || "");
  const [leads, setLeads] = useState(initialMinute?.leads || "");
  const [
    welcomeAndAcknowledgmentsOfAuthorities,
    setWelcomeAndAcknowledgmentsOfAuthorities,
  ] = useState(initialMinute?.welcomeAndAcknowledgmentsOfAuthorities || "");
  const [announcements, setAnnouncements] = useState(
    initialMinute?.announcements || ""
  );
  const [firstHymn, setFirstHymn] = useState<MeetingMinuteHymn>(
    initialMinute?.firstHymn || emptyHymn
  );
  const [director, setDirector] = useState(initialMinute?.director || "");
  const [pianist, setPianist] = useState(initialMinute?.pianist || "");
  const [openingPrayer, setOpeningPrayer] = useState(
    initialMinute?.openingPrayer || ""
  );
  const [wardAndStakeBusinessRows, setWardAndStakeBusinessRows] =
    useState(
      wardAndStakeBusinessToRows(
        initialMinute?.wardAndStakeBusiness || emptyWardAndStakeBusiness
      )
    );
  const [sacramentalHymn, setSacramentalHymn] =
    useState<MeetingMinuteHymn>(
      initialMinute?.sacramentalHymn || emptyHymn
    );
  const [messageRows, setMessageRows] = useState(
    messagesToRows(initialMinute?.messages || [])
  );
  const [lastHymn, setLastHymn] = useState<MeetingMinuteHymn>(
    initialMinute?.lastHymn || emptyHymn
  );
  const [closingPrayer, setClosingPrayer] = useState(
    initialMinute?.closingPrayer || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialDate || initialMinute) {
      return;
    }

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
  }, [initialDate, initialMinute]);

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
    if (readOnly) {
      return;
    }

    const payload: MeetingMinute = {
      ...(minuteId ? { id: minuteId } : {}),
      attendance,
      date,
      presides,
      leads,
      welcomeAndAcknowledgmentsOfAuthorities,
      announcements,
      firstHymn: withCatalogHymnData(firstHymn),
      director,
      pianist,
      openingPrayer,
      wardAndStakeBusiness: rowsToWardAndStakeBusiness(
        wardAndStakeBusinessRows
      ),
      sacramentalHymn: withCatalogHymnData(sacramentalHymn),
      messages: rowsToMessages(messageRows),
      lastHymn: withCatalogHymnData(lastHymn),
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

      const responseText = await response.text();

      let result;

      try {
        result = responseText
          ? JSON.parse(responseText)
          : { success: false, error: "La API no devolvió respuesta" };
      } catch {
        console.error("La API no devolvió JSON válido:", responseText);

        result = {
          success: false,
          error: responseText || "La API devolvió una respuesta inválida",
        };
      }

      if (!response.ok || !result.success) {
        console.error("Error saving Meeting_minutes", result);
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
      {!readOnly ? (
        <>
          <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Link href="/reunion-sacramental" prefetch={false}>
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
        </>
      ) : null}

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
                    inputReadOnly={readOnly}
                    disabled={readOnly}
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
                    disabled={readOnly}
                    aria-label="Asistencia"
                    value={readOnly ? null : attendance}
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
          <LineField
            label="Preside"
            value={presides}
            onChange={setPresides}
            readOnly={readOnly}
          />
          <LineField
            label="Dirige"
            value={leads}
            onChange={setLeads}
            readOnly={readOnly}
          />
        </section>

        <LinedText
          label="Bienvenida y reconocimiento de autoridades"
          rows={2}
          value={welcomeAndAcknowledgmentsOfAuthorities}
          onChange={setWelcomeAndAcknowledgmentsOfAuthorities}
          readOnly={readOnly}
          readOnlyDisplay="lines"
        />

        <LinedText
          label="Anuncios:"
          note="(deben reducirse al mínimo)"
          rows={5}
          className="minute-announcements"
          value={announcements}
          onChange={setAnnouncements}
          readOnly={readOnly}
          readOnlyDisplay="lines"
        />

        <section className="minute-section minute-music">
          <HymnField
            label="Primer himno"
            className="minute-full-line"
            value={firstHymn}
            onChange={setFirstHymn}
            readOnly={readOnly}
          />
          <div className="minute-two-columns">
            <LineField
              label="Directora"
              value={director}
              onChange={setDirector}
              readOnly={readOnly}
            />
            <LineField
              label="Pianista"
              value={pianist}
              onChange={setPianist}
              readOnly={readOnly}
            />
          </div>
          <LineField
            label="Primera oración"
            className="minute-prayer-field"
            value={openingPrayer}
            onChange={setOpeningPrayer}
            readOnly={readOnly}
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
                readOnly={readOnly}
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
            readOnly={readOnly}
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
                readOnly={readOnly}
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
            readOnly={readOnly}
          />
          <LineField
            label="Última oración"
            value={closingPrayer}
            onChange={setClosingPrayer}
            readOnly={readOnly}
          />
        </section>
      </section>
    </div>
  );
}
