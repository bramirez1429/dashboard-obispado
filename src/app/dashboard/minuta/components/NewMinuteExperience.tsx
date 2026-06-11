"use client";

import { Button, Typography } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./NewMinuteExperience.module.css";

type NewMinuteExperienceProps = {
  children: ReactNode;
};

const { Text, Title } = Typography;

const NewMinuteExperience = ({ children }: NewMinuteExperienceProps) => (
  <section className={styles.section}>
    <div className={styles.header}>
      <div>
        <Text className={styles.eyebrow}>Nueva experiencia</Text>
        <Title className={styles.title} level={2}>
          Experiencia nueva de minuta
        </Title>
      </div>
      <Link href="/dashboard/minuta/nueva" prefetch={false}>
        <Button type="primary">Crear minuta</Button>
      </Link>
    </div>
    {children}
  </section>
);

export default NewMinuteExperience;
