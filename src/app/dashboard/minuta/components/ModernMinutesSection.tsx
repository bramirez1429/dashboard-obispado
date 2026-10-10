"use client";

import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Grid,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Tour,
  type InputRef,
  type TourProps,
  Tooltip,
  Typography,
  message,
} from "antd";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { deleteMinuteAction } from "./actions";
import { isFastingTestimoniesDate } from "@/lib/fasting-testimonies";
import styles from "./ModernMinutesSection.module.css";

export type ModernMinuteCard = {
  id: string | number;
  date: string;
  leads: string;
  presides: string;
  attendance?: number | null;
  testimonies?: { person_name?: string | null }[];
};

type ModernMinutesSectionProps = {
  minutes: ModernMinuteCard[];
};

const { Text } = Typography;
const { useBreakpoint } = Grid;
const TOUR_STORAGE_KEY = "dashboard-minuta-testimonies-tour-v1";

const ModernMinutesSection = ({ minutes }: ModernMinutesSectionProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState(minutes);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeMinute, setActiveMinute] = useState<ModernMinuteCard | null>(null);
  const [testimonyName, setTestimonyName] = useState("");
  const [isSavingTestimony, setIsSavingTestimony] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourCurrent, setTourCurrent] = useState(0);
  const [tourMinuteId, setTourMinuteId] = useState<string | null>(null);
  const [tourOpenedModal, setTourOpenedModal] = useState(false);
  const tourMinuteCardRef = useRef<HTMLElement | null>(null);
  const scheduleButtonRef = useRef<HTMLButtonElement | null>(null);
  const pdfButtonRef = useRef<HTMLButtonElement | null>(null);
  const testimonyInputRef = useRef<InputRef>(null);
  const addTestimonyButtonRef = useRef<HTMLButtonElement | null>(null);
  const testimoniesListRef = useRef<HTMLDivElement | null>(null);
  const deleteTestimonyButtonRef = useRef<HTMLButtonElement | null>(null);
  const tourInitializedRef = useRef(false);

  useEffect(() => {
    if (
      tourInitializedRef.current ||
      localStorage.getItem(TOUR_STORAGE_KEY) === "true"
    ) {
      return;
    }

    tourInitializedRef.current = true;
    const fastingMinute = items.find((minute) =>
      isFastingTestimoniesDate(minute.date)
    );

    setTourMinuteId(fastingMinute ? String(fastingMinute.id) : null);
    setTourCurrent(0);
    setTourOpen(true);
  }, []);

  const handleDelete = async (minute: ModernMinuteCard) => {
    const minuteId = String(minute.id);

    setDeletingId(minuteId);

    try {
      const result = await deleteMinuteAction(minuteId);

      if (!result.success) {
        throw new Error(result.error || "No se pudo borrar la minuta");
      }

      setItems((currentItems) =>
        currentItems.filter((item) => String(item.id) !== minuteId)
      );
      messageApi.success("Minuta borrada");
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "No se pudo borrar la minuta"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openTestimonies = (minute: ModernMinuteCard) => {
    setActiveMinute(minute);
    setTestimonyName("");
  };

  const closeTestimonies = () => {
    if (!isSavingTestimony) {
      setActiveMinute(null);
      setTestimonyName("");
    }
  };

  const handleAddTestimony = async () => {
    if (!activeMinute) return;

    const personName = testimonyName.trim();
    if (!personName) {
      messageApi.warning("Ingresá el nombre completo");
      return;
    }

    const currentTestimonies = activeMinute.testimonies || [];
    if (
      currentTestimonies.some(
        (testimony) =>
          testimony.person_name?.trim().toLocaleLowerCase() ===
          personName.toLocaleLowerCase()
      )
    ) {
      messageApi.warning("Esa persona ya está agendada");
      return;
    }

    const updatedTestimonies = [
      ...currentTestimonies,
      { person_name: personName },
    ];
    setIsSavingTestimony(true);

    try {
      const response = await fetch(`/api/minuta/${activeMinute.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonies: updatedTestimonies }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "No se pudo guardar el testimonio");
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          String(item.id) === String(activeMinute.id)
            ? { ...item, testimonies: updatedTestimonies }
            : item
        )
      );
      setActiveMinute((currentMinute) =>
        currentMinute
          ? { ...currentMinute, testimonies: updatedTestimonies }
          : currentMinute
      );
      setTestimonyName("");
      messageApi.success("Testimonio agendado");
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "No se pudo guardar el testimonio"
      );
    } finally {
      setIsSavingTestimony(false);
    }
  };

  const handleDeleteTestimony = async (selectedIndex: number) => {
    if (!activeMinute || isSavingTestimony) return;

    const currentTestimonies = activeMinute.testimonies || [];
    const updatedTestimonies = currentTestimonies.filter(
      (_, index) => index !== selectedIndex
    );
    setIsSavingTestimony(true);

    try {
      const response = await fetch(`/api/minuta/${activeMinute.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonies: updatedTestimonies }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "No se pudo eliminar el testimonio");
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          String(item.id) === String(activeMinute.id)
            ? { ...item, testimonies: updatedTestimonies }
            : item
        )
      );
      setActiveMinute((currentMinute) =>
        currentMinute
          ? { ...currentMinute, testimonies: updatedTestimonies }
          : currentMinute
      );
      messageApi.success("Testimonio eliminado correctamente.");
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : "No se pudo eliminar el testimonio"
      );
    } finally {
      setIsSavingTestimony(false);
    }
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");

    if (tourOpenedModal) {
      setActiveMinute(null);
    }
    setTourOpen(false);
    setTourCurrent(0);
    setTourMinuteId(null);
    setTourOpenedModal(false);
  };

  const handleTourChange = (current: number) => {
    setTourCurrent(current);

    const selectedMinute = items.find(
      (minute) => String(minute.id) === tourMinuteId
    );

    if (current === 2 && selectedMinute && !activeMinute) {
      setActiveMinute(selectedMinute);
      setTestimonyName("");
      setTourOpenedModal(true);
    }

    if (current === 6 && tourOpenedModal) {
      setActiveMinute(null);
      setTestimonyName("");
      setTourOpenedModal(false);
    }
  };

  const selectedTourMinute = items.find(
    (minute) => String(minute.id) === tourMinuteId
  );
  const hasFastingMinute = Boolean(selectedTourMinute);
  const hasTourTestimonies = Boolean(activeMinute?.testimonies?.length);

  const tourStepContent: TourProps["steps"] = hasFastingMinute
    ? [
        {
          title: "Reunión de ayuno y testimonios",
          description:
            "Estas reuniones se realizan el primer domingo de cada mes, excepto en abril y octubre, cuando corresponden al segundo domingo.",
          target: () => tourMinuteCardRef.current as HTMLElement,
        },
        {
          title: "Agendar testimonios",
          description:
            "Desde este botón podés registrar a las personas que compartirán su testimonio durante la reunión sacramental.",
          target: () => scheduleButtonRef.current as HTMLElement,
          placement: "bottom",
        },
        {
          title: "Agregar una persona",
          description:
            "Escribí el nombre completo de la persona que compartirá su testimonio.",
          target: () => testimonyInputRef.current?.input as HTMLElement,
          placement: "bottom",
        },
        {
          title: "Agregar testimonio",
          description:
            "Presioná Agregar para guardar el nombre. Los testimonios quedan asociados a esta minuta.",
          target: () => addTestimonyButtonRef.current as HTMLElement,
          placement: "bottom",
        },
        {
          title: "Personas agendadas",
          description:
            "Aquí podés consultar los nombres registrados, en el mismo orden en que fueron agregados.",
          target: () => testimoniesListRef.current as HTMLElement,
          placement: "bottom",
        },
        {
          title: "Eliminar un testimonio",
          description: hasTourTestimonies
            ? "Si una persona ya no desea compartir su testimonio, podés quitarla utilizando el ícono de papelera."
            : "Cuando existan personas agendadas, podrás quitarlas utilizando el ícono de papelera.",
          target: () => deleteTestimonyButtonRef.current as HTMLElement,
          placement: "bottom",
        },
        {
          title: "Ver testimonios en el PDF",
          description:
            "Al abrir el PDF de la minuta, los nombres agendados aparecerán en la sección Tiempo de mensajes.",
          target: () => pdfButtonRef.current as HTMLElement,
          placement: "bottom",
        },
        {
          title: "¡Todo listo!",
          description:
            "Ahora podés agendar testimonios, consultar los nombres, eliminarlos cuando sea necesario y verlos reflejados en el PDF de la minuta.",
        },
      ]
    : [
        {
          title: "Reunión de ayuno y testimonios",
          description:
            "Estas reuniones se realizan el primer domingo de cada mes, excepto en abril y octubre, cuando corresponden al segundo domingo. Todavía no hay una minuta correspondiente para mostrar.",
        },
        {
          title: "¡Todo listo!",
          description:
            "Cuando exista una minuta de ayuno y testimonios, podrás iniciar el recorrido para conocer todas sus funciones.",
        },
      ];

  const tourSteps = (tourStepContent || []).map((step, index, steps) => ({
    ...step,
    description:
      index === 3
        ? "Una vez ingresado el nombre completo, presioná este botón para guardar el testimonio en la minuta."
        : step.description,
    prevButtonProps:
      index > 0 ? { children: "Anterior" } : step.prevButtonProps,
    nextButtonProps: {
      children: index === steps.length - 1 ? "Finalizar" : "Siguiente",
    },
  }));

  const renderButtons = (minute: ModernMinuteCard) => (
    <Space className={styles.buttons} wrap>
      <Link href={`/dashboard/minuta/pdf/${minute.id}`} prefetch={false}>
        <Button
          ref={String(minute.id) === tourMinuteId ? pdfButtonRef : undefined}
          icon={<FilePdfOutlined />}
          size="small"
          type="text"
        >
          Ver PDF
        </Button>
      </Link>
      <Divider vertical />
      {isFastingTestimoniesDate(minute.date) ? (
        <>
          <Button
            ref={
              String(minute.id) === tourMinuteId
                ? scheduleButtonRef
                : undefined
            }
            icon={<CalendarOutlined />}
            size="small"
            type="text"
            onClick={() => openTestimonies(minute)}
          >
            Agendar testimonios
          </Button>
          <Divider vertical />
        </>
      ) : null}
      <Link href={`/dashboard/minuta/editar/${minute.id}`} prefetch={false}>
        <Button
          aria-label="Editar minuta"
          icon={<EditOutlined />}
          size="small"
          type="text"
        />
      </Link>
      <Divider vertical />
      <Popconfirm
        title="Borrar minuta"
        description="Seguro que queres borrar esta minuta?"
        okText="Borrar"
        okButtonProps={{ danger: true }}
        cancelText="Cancelar"
        onConfirm={() => handleDelete(minute)}
      >
        <Button
          aria-label="Borrar minuta"
          danger
          icon={<DeleteOutlined />}
          loading={deletingId === String(minute.id)}
          size="small"
          type="text"
        />
      </Popconfirm>
    </Space>
  );

  return (
    <>
      {contextHolder}
      <Tour
        open={tourOpen}
        current={tourCurrent}
        onChange={handleTourChange}
        onClose={completeTour}
        onFinish={completeTour}
        steps={tourSteps}
        arrow={{ pointAtCenter: true }}
        gap={{ offset: 6, radius: 4 }}
        mask
        zIndex={1200}
      />
      <Modal
        open={Boolean(activeMinute)}
        title="Agendar testimonios"
        onCancel={closeTestimonies}
        footer={null}
        destroyOnHidden
      >
        {activeMinute ? (
          <Flex vertical gap={16}>
            <Text strong>Fecha de la reunión: {activeMinute.date}</Text>
            <Flex gap={8}>
              <Input
                ref={testimonyInputRef}
                placeholder="Nombre completo"
                value={testimonyName}
                onChange={(event) => setTestimonyName(event.target.value)}
                onPressEnter={() => void handleAddTestimony()}
              />
              <Button
                ref={addTestimonyButtonRef}
                type="primary"
                loading={isSavingTestimony}
                onClick={() => void handleAddTestimony()}
              >
                Agregar
              </Button>
            </Flex>
            <div ref={testimoniesListRef}>
              <Text strong>Testimonios agendados</Text>
              <List
                size="small"
                bordered
                dataSource={activeMinute.testimonies || []}
                locale={{ emptyText: "No hay testimonios agendados" }}
                renderItem={(testimony, index) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key={`delete-${index}`}
                        title="¿Querés eliminar este testimonio?"
                        description="La persona dejará de aparecer en la lista y en el PDF de la minuta."
                        okText="Eliminar"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                        disabled={isSavingTestimony}
                        onConfirm={() => handleDeleteTestimony(index)}
                      >
                        <Tooltip title="Eliminar testimonio">
                          <Button
                            ref={
                              index === 0
                                ? deleteTestimonyButtonRef
                                : undefined
                            }
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            aria-label="Eliminar testimonio"
                            disabled={isSavingTestimony}
                          />
                        </Tooltip>
                      </Popconfirm>,
                    ]}
                  >
                    {index + 1}. {testimony.person_name}
                  </List.Item>
                )}
              />
            </div>
          </Flex>
        ) : null}
      </Modal>
      <section className={styles.list} aria-label="Minutas sacramentales">
        {items.length ? (
          items.map((minute) => (
            <article
              className={styles.card}
              key={String(minute.id)}
              ref={
                String(minute.id) === tourMinuteId ? tourMinuteCardRef : undefined
              }
            >
              <div className={styles.main}>
                <div className={styles.meta}>
                  <Avatar
                    className={styles.avatar}
                    icon={<FileTextOutlined />}
                    shape="circle"
                    size={isMobile ? 48 : 56}
                    style={{
                      flex: `0 0 ${isMobile ? 48 : 56}px`,
                      height: isMobile ? 48 : 56,
                      width: isMobile ? 48 : 56,
                    }}
                  />
                  <div className={styles.metaContent}>
                    <span className={styles.title}>Minuta sacramental</span>
                    {isMobile ? (
                      <Flex vertical>
                        <Text className={styles.description}>
                          Dirige: {minute.leads}
                        </Text>
                        <Text className={styles.description}>
                          Preside: {minute.presides}
                        </Text>
                      </Flex>
                    ) : (
                      <Text className={styles.description}>
                        Dirige: {minute.leads} - Preside: {minute.presides}
                      </Text>
                    )}
                  </div>
                </div>
                {renderButtons(minute)}
                {isMobile ? (
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: "100%",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                    vertical
                  >
                    <Text className={styles.minuteDate}>
                      Domingo {minute.date}
                    </Text>
                    <Text className={styles.minuteAttendance}>
                      Asistencia: {minute.attendance ?? "-"}
                    </Text>
                  </Flex>
                ) : null}
              </div>
              {!isMobile ? (
                <Card className={styles.minuteInfoCard}>
                  <Text className={styles.minuteDate}>Domingo {minute.date}</Text>
                  <Text className={styles.minuteAttendance}>
                    Asistencia: {minute.attendance ?? "-"}
                  </Text>
                </Card>
              ) : null}
            </article>
          ))
        ) : (
          <Empty className={styles.empty} description="No hay minutas" />
        )}
      </section>
    </>
  );
};

export default ModernMinutesSection;
