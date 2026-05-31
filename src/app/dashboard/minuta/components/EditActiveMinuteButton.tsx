"use client";

import { Button } from "antd";
import Link from "next/link";

type EditActiveMinuteButtonProps = {
  minuteId?: string;
};

export default function EditActiveMinuteButton({
  minuteId,
}: EditActiveMinuteButtonProps) {
  return (
    <div
      className="no-print"
      style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
    >
      {minuteId ? (
        <Link href={`/dashboard/minuta/editar/${minuteId}`} prefetch={false}>
          <Button size="small" type="primary">
            Editar minuta
          </Button>
        </Link>
      ) : (
        <Button size="small" disabled>
          Editar minuta
        </Button>
      )}
    </div>
  );
}
