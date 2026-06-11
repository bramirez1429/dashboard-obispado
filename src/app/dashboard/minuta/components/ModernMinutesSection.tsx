"use client";

import {
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
  Popconfirm,
  Space,
  Typography,
  message,
} from "antd";
import Link from "next/link";
import { useState } from "react";
import { deleteMinuteAction } from "./actions";
import styles from "./ModernMinutesSection.module.css";

export type ModernMinuteCard = {
  id: string | number;
  date: string;
  leads: string;
  presides: string;
  attendance?: number | null;
};

type ModernMinutesSectionProps = {
  minutes: ModernMinuteCard[];
};

const { Text } = Typography;

const ModernMinutesSection = ({ minutes }: ModernMinutesSectionProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [items, setItems] = useState(minutes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const renderButtons = (minute: ModernMinuteCard) => (
    <Space className={styles.buttons} wrap>
      <Link href={`/dashboard/minuta/pdf/${minute.id}`} prefetch={false}>
        <Button icon={<FilePdfOutlined />} size="small" type="text">
          Ver PDF
        </Button>
      </Link>
      <Divider vertical />
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
      <section className={styles.list} aria-label="Minutas sacramentales">
        {items.length ? (
          items.map((minute) => (
            <article className={styles.card} key={String(minute.id)}>
              <div className={styles.main}>
                <div className={styles.meta}>
                  <Avatar
                    className={styles.avatar}
                    icon={<FileTextOutlined />}
                    size={56}
                  />
                  <div className={styles.metaContent}>
                    <span className={styles.title}>Minuta sacramental</span>
                    <Text className={styles.description}>
                      Dirige: {minute.leads} - Preside: {minute.presides}
                    </Text>
                  </div>
                </div>
                {renderButtons(minute)}
              </div>
              <Card className={styles.minuteInfoCard}>
                <Text className={styles.minuteDate}>Domingo {minute.date}</Text>
                <Text className={styles.minuteAttendance}>
                  Asistencia: {minute.attendance ?? "-"}
                </Text>
              </Card>
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
