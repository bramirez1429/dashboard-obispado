"use client";

import { Button, Card } from "antd";
import Link from "next/link";
import PreviousMinutesSelect from "./PreviousMinutesSelect";

type PreviousMinuteOption = {
  id: string;
  date: string;
};

type ExistingMinuteCardProps = {
  activeMinuteId: string;
  previousMinutes: PreviousMinuteOption[];
};

export default function ExistingMinuteCard({
  activeMinuteId,
  previousMinutes,
}: ExistingMinuteCardProps) {
  return (
    <Card>
      <h2 className="existing-minute-title">
        Ya está hecha una minuta. ¿Te gustaría poder verla?
      </h2>
      <div className="existing-minute-actions">
        <Link href="/reunion-sacramental" prefetch={false}>
          <Button type="primary">Ver minuta</Button>
        </Link>
        <Link href={`/dashboard/minuta/editar/${activeMinuteId}`} prefetch={false}>
          <Button>Editar minuta</Button>
        </Link>
        <Link href={`/dashboard/minuta/pdf/${activeMinuteId}`} prefetch={false}>
          <Button>Ver minuta para PDF</Button>
        </Link>
        <Link href="/dashboard/minuta?createNext=true" prefetch={false}>
          <Button>Crear minuta siguiente</Button>
        </Link>
      </div>
      <PreviousMinutesSelect minutes={previousMinutes} />
    </Card>
  );
}
