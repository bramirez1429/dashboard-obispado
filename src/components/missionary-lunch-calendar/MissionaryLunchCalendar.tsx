"use client";

import { supabase } from "@/lib/supabase/client";
import { FilePdfOutlined, ShareAltOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, FloatButton, Form, Input, Modal, Select, Spin, Typography, message } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CalendarMode = "public" | "admin";
type LunchStatus = "available" | "occupied";
type Companionship = "chacabuco_1" | "chacabuco_2" | "both";

type MissionaryLunch = {
  id: string | number;
  lunch_date: string;
  status: LunchStatus;
  person_name: string | null;
  lunch_time: string | null;
  companionship: Companionship | null;
  chacabuco_1_elders?: string | null;
  chacabuco_2_elders?: string | null;
  created_at: string | null;
};

type LunchFormValues = {
  person_name: string;
  lunch_time: string;
  companionship: Companionship;
  chacabuco_1_elders?: string;
  chacabuco_2_elders?: string;
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type MissionariesFormValues = {
  chacabuco_1_elders: string;
  chacabuco_2_elders: string;
};

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const companionshipLabels: Record<Companionship, string> = {
  chacabuco_1: "Chacabuco 1",
  chacabuco_2: "Chacabuco 2",
  both: "Ambos compañerismos",
};

const DEFAULT_CHACABUCO_1_ELDERS = "Élder Romero y Élder Vaklerio";
const DEFAULT_CHACABUCO_2_ELDERS = "Élder Castro y Élder Vance";

const getChacabuco1Elders = (lunch?: MissionaryLunch | null) =>
  lunch?.chacabuco_1_elders || DEFAULT_CHACABUCO_1_ELDERS;

const getChacabuco2Elders = (lunch?: MissionaryLunch | null) =>
  lunch?.chacabuco_2_elders || DEFAULT_CHACABUCO_2_ELDERS;

const getCompanionshipLabel = (lunch: MissionaryLunch) => {
  if (lunch.companionship === "chacabuco_1") {
    return `Chacabuco 1 - ${getChacabuco1Elders(lunch)}`;
  }

  if (lunch.companionship === "chacabuco_2") {
    return `Chacabuco 2 - ${getChacabuco2Elders(lunch)}`;
  }

  if (lunch.companionship === "both") {
    return "Ambos compañerismos";
  }

  return lunch.companionship ? companionshipLabels[lunch.companionship] : "";
};

const getCompanionshipShortLabel = (companionship?: string | null) => {
  if (companionship === "chacabuco_1") return "Chacabuco 1";
  if (companionship === "chacabuco_2") return "Chacabuco 2";
  if (companionship === "both") return "Ambos compañerismos";
  return "";
};

const lunchTimeOptions = [
  { label: "12:00", value: "12:00" },
  { label: "12:30", value: "12:30" },
  { label: "13:00", value: "13:00" },
  { label: "13:30", value: "13:30" },
  { label: "14:00", value: "14:00" },
];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toDateKey(start), end: toDateKey(end) };
}

function getCalendarDays(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const mondayBasedStart = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = Array.from({ length: mondayBasedStart }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return formatSelectedDate(new Date(year, month - 1, day));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isMobileView() {
  return window.innerWidth <= 768;
}

export default function MissionaryLunchCalendar({ mode }: { mode: CalendarMode }) {
  const isAdminMode = mode === "admin";
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [occupiedLunch, setOccupiedLunch] = useState<MissionaryLunch | null>(null);
  const [lunches, setLunches] = useState<MissionaryLunch[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMissionariesModalOpen, setIsMissionariesModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingMissionaries, setIsSavingMissionaries] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chacabuco1Elders, setChacabuco1Elders] = useState(DEFAULT_CHACABUCO_1_ELDERS);
  const [chacabuco2Elders, setChacabuco2Elders] = useState(DEFAULT_CHACABUCO_2_ELDERS);
  const [form] = Form.useForm<LunchFormValues>();
  const [missionariesForm] = Form.useForm<MissionariesFormValues>();
  const selectedLunchDetailRef = useRef<HTMLDivElement | null>(null);

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const calendarTitle = `${MONTHS_ES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  const lunchesByDate = useMemo(() => {
    return new Map(lunches.map((lunch) => [lunch.lunch_date, lunch]));
  }, [lunches]);
  const companionshipOptions = useMemo(
    () => [
      { value: "chacabuco_1", label: `Chacabuco 1 - ${chacabuco1Elders}` },
      { value: "chacabuco_2", label: `Chacabuco 2 - ${chacabuco2Elders}` },
      { value: "both", label: "Ambos compañerismos" },
    ],
    [chacabuco1Elders, chacabuco2Elders],
  );
  const getCalendarCompanionshipLabel = (lunch: MissionaryLunch) => {
    if (lunch.companionship === "chacabuco_1") {
      return `Chacabuco 1 - ${lunch.chacabuco_1_elders || chacabuco1Elders}`;
    }

    if (lunch.companionship === "chacabuco_2") {
      return `Chacabuco 2 - ${lunch.chacabuco_2_elders || chacabuco2Elders}`;
    }

    return getCompanionshipLabel(lunch);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const loadLunches = useCallback(async () => {
    setIsLoading(true);
    const range = getMonthRange(currentMonth);
    const { data, error } = await supabase
      .from("Missionary_lunches")
      .select("id,lunch_date,status,person_name,lunch_time,companionship,chacabuco_1_elders,chacabuco_2_elders,created_at")
      .gte("lunch_date", range.start)
      .lte("lunch_date", range.end)
      .eq("status", "occupied")
      .order("lunch_date", { ascending: true });

    if (error) {
      message.error("No se pudieron cargar los almuerzos.");
      setLunches([]);
      setIsLoading(false);
      return [];
    }

    const loadedLunches = (data ?? []) as MissionaryLunch[];
    const latestLunchWithElders = loadedLunches.find(
      (lunch) => lunch.chacabuco_1_elders || lunch.chacabuco_2_elders,
    );
    setChacabuco1Elders(latestLunchWithElders?.chacabuco_1_elders || DEFAULT_CHACABUCO_1_ELDERS);
    setChacabuco2Elders(latestLunchWithElders?.chacabuco_2_elders || DEFAULT_CHACABUCO_2_ELDERS);
    setLunches(loadedLunches);
    setIsLoading(false);
    return loadedLunches;
  }, [currentMonth]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLunches();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLunches]);

  const handleMonthChange = (offset: number) => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
    setSelectedDate(null);
    setOccupiedLunch(null);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleEditLunch = () => {
    if (!isAdminMode || !occupiedLunch) {
      return;
    }

    const [year, month, day] = occupiedLunch.lunch_date.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
    form.setFieldsValue({
      person_name: occupiedLunch.person_name ?? "",
      lunch_time: occupiedLunch.lunch_time ?? "",
      companionship: occupiedLunch.companionship ?? undefined,
    });
    setIsModalOpen(true);
  };

  const handleDeleteLunch = () => {
    if (!isAdminMode || !selectedDate) {
      message.error("Seleccioná una fecha.");
      return;
    }

    const selectedDateKey = toDateKey(selectedDate);

    Modal.confirm({
      title: "¿Querés borrar este registro?",
      content: "El día seguirá disponible para que otra hermana pueda anotarse.",
      okText: "Borrar registro",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      async onOk() {
        setIsDeleting(true);

        try {
          const { error } = await supabase
            .from("Missionary_lunches")
            .update({
              status: "available",
              person_name: null,
              lunch_time: null,
              companionship: null,
              chacabuco_1_elders: null,
              chacabuco_2_elders: null,
            })
            .eq("lunch_date", selectedDateKey);

          if (error) {
            message.error(error.message || "No se pudo borrar el registro.");
            return;
          }

          message.success("Registro borrado correctamente.");
          setOccupiedLunch(null);
          await loadLunches();
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleDayClick = (day: Date) => {
    const dateKey = toDateKey(day);
    const lunch = lunchesByDate.get(dateKey);
    setSelectedDate(day);

    if (lunch?.status === "occupied") {
      setOccupiedLunch(lunch);
      setIsModalOpen(false);
      form.resetFields();
      requestAnimationFrame(() => {
        if (isMobileView()) {
          selectedLunchDetailRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
      return;
    }

    setOccupiedLunch(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleShareCalendar = () => {
    const calendarUrl = "https://dashboard-obispado.vercel.app/almuerzos-misioneros";
    const text = `Hola hermanas, pueden anotarse para el almuerzo de los misioneros en este calendario:\n\n${calendarUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportPdf = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      message.error("No se pudo abrir la ventana de impresión.");
      return;
    }

    const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const firstDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
    const totalDays = monthEnd.getDate();

    const emptyDays = Array.from({ length: firstDay });

    const monthDays = Array.from({ length: totalDays }, (_, index) => {
      const dayNumber = index + 1;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
      const dateKey = date.toISOString().slice(0, 10);
      const lunch = lunches.find((item) => item.lunch_date === dateKey);

      return {
        dayNumber,
        dateKey,
        lunch,
      };
    });

    const daysHtml = [
      ...emptyDays.map(
        () => `<div class="day empty" aria-hidden="true"></div>`,
      ),
      ...monthDays.map(({ dayNumber, lunch }) => {
        const isOccupied = lunch?.status === "occupied";

        return `
          <div class="day ${isOccupied ? "occupied" : ""}">
            <div class="day-number">${dayNumber}</div>
            ${
              isOccupied
                ? `
                  <div class="lunch-info">
                    <div class="person">${escapeHtml(lunch?.person_name || "")}</div>
                    <div class="time">${escapeHtml(lunch?.lunch_time || "")}</div>
                  </div>
                `
                : ""
            }
          </div>
        `;
      }),
    ].join("");

    const weekdaysHtml = weekdays.map((day) => `<div class="weekday">${day}</div>`).join("");

    const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Calendario de almuerzos misioneros</title>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, sans-serif;
        color: #111;
        background: #fff;
      }

      h1 {
        margin: 0;
        text-align: center;
        font-size: 24px;
      }

      h2 {
        margin: 8px 0 22px;
        text-align: center;
        font-size: 19px;
        font-weight: 600;
      }

      .calendar {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 6px;
      }

      .weekday {
        padding: 8px 4px;
        text-align: center;
        font-weight: 700;
        border-bottom: 1px solid #777;
      }

      .day {
        min-height: 95px;
        border: 1px solid #bdbdbd;
        padding: 7px;
        font-size: 12px;
        background: #fff;
      }

      .day.empty {
        border: none;
      }

      .day.occupied {
        background: #fff1f1;
        border-color: #ff9b9b;
      }

      .day-number {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .lunch-info {
        font-size: 12px;
        line-height: 1.35;
      }

      .person {
        font-weight: 700;
      }

      .time {
        margin-top: 4px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <h1>Calendario de almuerzos misioneros</h1>
    <h2>${escapeHtml(calendarTitle)}</h2>
    <div class="calendar">
      ${weekdaysHtml}
      ${daysHtml}
    </div>
    <script>
      window.onload = function () {
        window.focus();
        window.print();
      };
    </script>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleOpenMissionariesModal = async () => {
    if (!isAdminMode) {
      return;
    }

    const latestLunchWithElders = lunches.find(
      (lunch) => lunch.chacabuco_1_elders || lunch.chacabuco_2_elders,
    );
    const currentChacabuco1 =
      latestLunchWithElders?.chacabuco_1_elders || DEFAULT_CHACABUCO_1_ELDERS;
    const currentChacabuco2 =
      latestLunchWithElders?.chacabuco_2_elders || DEFAULT_CHACABUCO_2_ELDERS;
    missionariesForm.setFieldsValue({
      chacabuco_1_elders: currentChacabuco1,
      chacabuco_2_elders: currentChacabuco2,
    });
    setIsMissionariesModalOpen(true);
  };

  const handleCloseMissionariesModal = () => {
    setIsMissionariesModalOpen(false);
    missionariesForm.resetFields();
  };

  const handleSaveMissionaries = async (values: MissionariesFormValues) => {
    setIsSavingMissionaries(true);

    try {
      const chacabuco1 = values.chacabuco_1_elders?.trim() || DEFAULT_CHACABUCO_1_ELDERS;
      const chacabuco2 = values.chacabuco_2_elders?.trim() || DEFAULT_CHACABUCO_2_ELDERS;
      const { error } = await supabase
        .from("Missionary_lunches")
        .update({
          chacabuco_1_elders: chacabuco1,
          chacabuco_2_elders: chacabuco2,
        })
        .not("id", "is", null);

      if (error) {
        message.error(error.message || "No se pudieron actualizar los nombres.");
        return;
      }

      setChacabuco1Elders(chacabuco1);
      setChacabuco2Elders(chacabuco2);
      message.success("Nombres de misioneros actualizados.");
      handleCloseMissionariesModal();
      await loadLunches();
    } finally {
      setIsSavingMissionaries(false);
    }
  };

  const handleSave = async (values: LunchFormValues) => {
    if (!selectedDate) {
      message.error("Seleccioná una fecha.");
      return;
    }

    setIsSaving(true);

    try {
      const selectedDateKey = toDateKey(selectedDate);
      const rpcName = isAdminMode ? "save_missionary_lunch" : "signup_missionary_lunch";
      const { data, error } = await supabase.rpc(rpcName, {
        p_lunch_date: selectedDateKey,
        p_person_name: values.person_name.trim(),
        p_lunch_time: values.lunch_time,
        p_companionship: values.companionship,
        p_chacabuco_1_elders: chacabuco1Elders,
        p_chacabuco_2_elders: chacabuco2Elders,
      });

      if (error) {
        console.log(`Error RPC ${rpcName}:`, {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          stringified: JSON.stringify(error),
        });

        message.error(error?.message || "No se pudo guardar el almuerzo.");
        return;
      }

      console.log("Almuerzo guardado:", data);

      message.success(isAdminMode ? "Almuerzo guardado correctamente." : "Gracias, quedaste anotada.");
      setIsModalOpen(false);
      form.resetFields();
      const loadedLunches = await loadLunches();
      setOccupiedLunch(loadedLunches.find((lunch) => lunch.lunch_date === selectedDateKey) ?? null);
    } catch (error) {
      console.log("Error inesperado guardando almuerzo:", {
        error,
        message: error instanceof Error ? error.message : null,
        stack: error instanceof Error ? error.stack : null,
        stringified: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      message.error("No se pudo guardar el almuerzo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={isAdminMode ? "page-stack" : "public-lunch-page"}>
      <FloatButton
        shape="circle"
        type="primary"
        icon={<ShareAltOutlined />}
        tooltip="Compartir calendario"
        onClick={handleShareCalendar}
        style={{
          right: 24,
          bottom: 24,
        }}
      />

      <Card className="calendar-page-card">
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          {isAdminMode ? "Calendario" : "Almuerzos para los misioneros"}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {isAdminMode
            ? "Días habilitados para almuerzos misioneros."
            : "Elegí un día disponible para anotarte."}
        </Typography.Paragraph>

        <div className="calendar-share-row">
          <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>
            Exportar PDF
          </Button>
          {isAdminMode ? (
            <Button type="default" icon={<TeamOutlined />} onClick={handleOpenMissionariesModal}>
              Misioneros
            </Button>
          ) : null}
        </div>

        <div className="calendar-legend">
          <div className="calendar-legend-item calendar-legend-available">
            Disponible
          </div>
          <div className="calendar-legend-item calendar-legend-occupied">
            No disponible
          </div>
        </div>

        <div className={`simple-calendar-header ${isAdminMode ? "" : "simple-calendar-header-public"}`}>
          {isAdminMode ? (
            <Button size="large" onClick={() => handleMonthChange(-1)}>
              Anterior
            </Button>
          ) : null}
          <Typography.Title level={3}>{calendarTitle}</Typography.Title>
          {isAdminMode ? (
            <Button size="large" onClick={() => handleMonthChange(1)}>
              Siguiente
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="simple-calendar-loading">
            <Spin />
          </div>
        ) : (
          <div className="simple-calendar-grid">
            {weekdayLabels.map((day) => (
              <div className="simple-calendar-weekday" key={day}>
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div className="simple-calendar-empty" key={`empty-${index}`} />;
              }

              const dateKey = toDateKey(day);
              const lunch = lunchesByDate.get(dateKey);
              const isOccupied = lunch?.status === "occupied";
              const isSelected = selectedDate ? toDateKey(selectedDate) === dateKey : false;

              return (
                <button
                  className={`simple-calendar-day ${
                    isOccupied
                      ? "simple-calendar-day-occupied"
                      : "simple-calendar-day-available"
                  } ${isSelected ? "simple-calendar-day-selected" : ""}`}
                  type="button"
                  key={dateKey}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="calendar-day-number">{day.getDate()}</span>
                  {isAdminMode && isOccupied && lunch?.person_name ? (
                    <span className="calendar-day-person">{lunch.person_name}</span>
                  ) : null}
                  {isAdminMode && isOccupied && lunch?.lunch_time ? (
                    <span className="calendar-day-time">{lunch.lunch_time}</span>
                  ) : null}
                  {isOccupied && lunch?.companionship ? (
                    <span className="calendar-day-companionship">
                      {getCompanionshipShortLabel(lunch.companionship)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {occupiedLunch ? (
        <div ref={selectedLunchDetailRef} className="selected-lunch-detail">
          <Card className="calendar-selected-card">
            <Typography.Text className="occupied-day-message">
              Este día ya está ocupado.
            </Typography.Text>
            <p>
              <strong>Fecha:</strong> {formatDateKey(occupiedLunch.lunch_date)}
            </p>
            <p>
              <strong>Nombre:</strong> {occupiedLunch.person_name || "-"}
            </p>
            <p>
              <strong>Horario:</strong> {occupiedLunch.lunch_time || "-"}
            </p>
            <p>
              <strong>Compañerismo:</strong>{" "}
              {getCalendarCompanionshipLabel(occupiedLunch) || "-"}
            </p>
            {isAdminMode ? (
              <div className="calendar-selected-actions">
                <Button size="large" type="primary" onClick={handleEditLunch}>
                  Editar
                </Button>
                <Button size="large" danger loading={isDeleting} onClick={handleDeleteLunch}>
                  Borrar registro
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      ) : selectedDate ? (
        <div ref={selectedLunchDetailRef} className="selected-lunch-detail">
          <Card className="calendar-selected-card">
            <Typography.Title level={3}>Fecha seleccionada:</Typography.Title>
            <p className="calendar-selected-date">{formatSelectedDate(selectedDate)}</p>
            <p>
              <strong>Estado:</strong> Habilitado
            </p>
            <p>Este día está habilitado para almuerzo misionero.</p>
          </Card>
        </div>
      ) : null}

      {mounted ? (
        <Modal
          title="Anotarse para almuerzo"
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          forceRender
          destroyOnHidden
        >
          <Form<LunchFormValues> form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item label="Fecha seleccionada">
              <Input
                size="large"
                readOnly
                value={selectedDate ? formatSelectedDate(selectedDate) : ""}
              />
            </Form.Item>

          <Form.Item
            label="Nombre completo"
            name="person_name"
            rules={[{ required: true, message: "Ingresá tu nombre completo" }]}
          >
            <Input size="large" autoComplete="name" />
          </Form.Item>

          <Form.Item
            label="Horario"
            name="lunch_time"
            rules={[{ required: true, message: "Seleccioná un horario" }]}
          >
            <Select size="large" placeholder="Seleccioná un horario" options={lunchTimeOptions} />
          </Form.Item>

          <Form.Item
            label="Compañerismo"
            name="companionship"
            rules={[{ required: true, message: "Seleccioná un compañerismo" }]}
          >
            <Select
              size="large"
              placeholder="Seleccioná el compañerismo"
              options={companionshipOptions}
            />
          </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={isSaving}>
              Guardar
            </Button>
          </Form>
        </Modal>
      ) : null}

      {mounted ? (
        <Modal
          title="Misioneros asignados"
          open={isMissionariesModalOpen}
          onCancel={handleCloseMissionariesModal}
          footer={null}
          forceRender
          destroyOnHidden
        >
          <Form<MissionariesFormValues>
            form={missionariesForm}
            layout="vertical"
            onFinish={handleSaveMissionaries}
          >
            <Form.Item
              label="Chacabuco 1"
              name="chacabuco_1_elders"
              rules={[{ required: true, message: "Ingresá los misioneros de Chacabuco 1" }]}
            >
              <Input size="large" placeholder={DEFAULT_CHACABUCO_1_ELDERS} />
            </Form.Item>

            <Form.Item
              label="Chacabuco 2"
              name="chacabuco_2_elders"
              rules={[{ required: true, message: "Ingresá los misioneros de Chacabuco 2" }]}
            >
              <Input size="large" placeholder={DEFAULT_CHACABUCO_2_ELDERS} />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={isSavingMissionaries}>
              Guardar
            </Button>
          </Form>
        </Modal>
      ) : null}
    </div>
  );
}
