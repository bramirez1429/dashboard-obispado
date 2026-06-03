"use client";

import { Button } from "antd";

export default function PrintMinuteButton() {
  return (
    <Button type="primary" onClick={() => window.print()}>
      Imprimir / Guardar PDF
    </Button>
  );
}
