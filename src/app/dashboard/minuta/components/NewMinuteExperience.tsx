"use client";

import { Button, Flex, Grid, Space, Typography } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./NewMinuteExperience.module.css";

type NewMinuteExperienceProps = {
  children: ReactNode;
};

const { Title } = Typography;
const { useBreakpoint } = Grid;

const NewMinuteExperience = ({ children }: NewMinuteExperienceProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <section className={styles.section}>
      <Flex align="flex-start" justify="space-between" gap={16} wrap>
        <Title level={2} style={{ marginBottom: 16 }}>
          Experiencia nueva de minuta
        </Title>
        <Flex style={{ marginBottom: isMobile ? 16 : 0 }}>
          <Space wrap>
            <Link href="/reunion-sacramental" prefetch={false}>
              <Button>Ver minuta sacramental</Button>
            </Link>
            <Link href="/dashboard/minuta/nueva" prefetch={false}>
              <Button type="primary">Crear minuta</Button>
            </Link>
          </Space>
        </Flex>
      </Flex>
      {children}
    </section>
  );
};

export default NewMinuteExperience;
