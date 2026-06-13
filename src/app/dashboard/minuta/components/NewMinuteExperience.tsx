"use client";

import { Button, Flex, Space, Typography } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./NewMinuteExperience.module.css";

type NewMinuteExperienceProps = {
  children: ReactNode;
};

const { Title } = Typography;

const NewMinuteExperience = ({ children }: NewMinuteExperienceProps) => (
  <section className={styles.section}>
    <Flex align="flex-start" justify="space-between" gap={16} wrap>
      <Title level={2} style={{ marginBottom: 16 }}>
        Experiencia nueva de minuta
      </Title>
      <Space wrap>
        <Link href="/reunion-sacramental" prefetch={false}>
          <Button>Ver minuta sacramental</Button>
        </Link>
        <Link href="/dashboard/minuta/nueva" prefetch={false}>
          <Button type="primary">Crear minuta</Button>
        </Link>
      </Space>
    </Flex>
    {children}
  </section>
);

export default NewMinuteExperience;
