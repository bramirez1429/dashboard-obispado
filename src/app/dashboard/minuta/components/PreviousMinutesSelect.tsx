"use client";

import { Button, Modal, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import type { MeetingMinute } from "@/types/meeting-minute";

type PreviousMinuteOption = {
  id: string;
  date: string;
};

type PreviousMinutesSelectProps = {
  minutes: PreviousMinuteOption[];
};

function formatMinuteDate(date: string) {
  const [day, month, year] = date.split("-");

  if (!day || !month || !year) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

export default function PreviousMinutesSelect({
  minutes,
}: PreviousMinutesSelectProps) {
  const [selectedMinuteId, setSelectedMinuteId] = useState<string>();
  const [selectedMinute, setSelectedMinute] = useState<MeetingMinute | null>(
    null
  );
  const [isLoadingMinute, setIsLoadingMinute] = useState(false);

  const selectedMinuteOption = useMemo(
    () =>
      minutes.find((minute) => String(minute.id) === selectedMinuteId) ?? null,
    [minutes, selectedMinuteId]
  );

  useEffect(() => {
    if (!selectedMinuteId) {
      return;
    }

    let ignoreResponse = false;

    const loadSelectedMinute = async () => {
      try {
        const response = await fetch(
          `/api/meeting-minutes?id=${encodeURIComponent(selectedMinuteId)}`
        );
        const result = await response.json();

        if (ignoreResponse) {
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          console.error("Error loading previous minute", result.error);
          setSelectedMinute(null);
          return;
        }

        setSelectedMinute(result.data as MeetingMinute);
      } catch (error) {
        if (!ignoreResponse) {
          console.error("Error loading previous minute", error);
          setSelectedMinute(null);
        }
      } finally {
        if (!ignoreResponse) {
          setIsLoadingMinute(false);
        }
      }
    };

    void loadSelectedMinute();

    return () => {
      ignoreResponse = true;
    };
  }, [selectedMinuteId]);

  const handlePrintSelectedMinute = () => {
    if (!selectedMinute) {
      return;
    }

    const cleanup = () => {
      document.body.classList.remove("printing-previous-minute");
    };

    document.body.classList.add("printing-previous-minute");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    window.setTimeout(cleanup, 500);
  };

  const handleSelectMinute = (minuteId: string) => {
    setSelectedMinuteId(minuteId);
    setSelectedMinute(null);
    setIsLoadingMinute(true);
  };

  const handleCloseModal = () => {
    setSelectedMinuteId(undefined);
    setSelectedMinute(null);
    setIsLoadingMinute(false);
  };

  return (
    <div className="previous-minutes-select">
      <Select
        aria-label="Minutas anteriores"
        disabled={minutes.length === 0}
        options={minutes.map((minute) => ({
          value: String(minute.id),
          label: formatMinuteDate(minute.date),
        }))}
        placeholder="Minutas anteriores"
        value={selectedMinuteId}
        onChange={handleSelectMinute}
      />
      <Modal
        className="previous-minute-modal"
        footer={null}
        loading={isLoadingMinute}
        open={Boolean(selectedMinuteId)}
        title={
          selectedMinuteOption
            ? `Minuta ${formatMinuteDate(selectedMinuteOption.date)}`
            : "Minuta anterior"
        }
        width={1120}
        onCancel={handleCloseModal}
      >
        {selectedMinute ? (
          <>
            <div className="previous-minute-print-actions no-print">
              <Button type="primary" onClick={handlePrintSelectedMinute}>
                Imprimir / Guardar PDF
              </Button>
            </div>
            <div className="previous-minute-print-area">
              <SacramentalMinuteSheet
                key={String(selectedMinute.id)}
                initialMinute={selectedMinute}
                readOnly
              />
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
