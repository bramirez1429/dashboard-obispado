import { notFound } from "next/navigation";
import BackCircleButton from "@/components/common/BackCircleButton";
import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import type {
  MeetingMinute,
  MeetingMinuteWardAndStakeBusinessValue,
} from "@/types/meeting-minute";
import PrintMinuteButton from "./PrintMinuteButton";

export const revalidate = 120;

const emptyHymn = {
  number: "",
  title: "",
  url: "",
};

const emptyBusiness = {
  subject: "",
  name: "",
  details: "",
};

function getBusinessSortRank(subject: string) {
  const normalizedSubject = subject.toLowerCase();

  if (normalizedSubject.includes("relevo")) return 0;
  if (normalizedSubject.includes("sosten")) return 1;
  return 2;
}

function sortWardAndStakeBusinessForPdf(
  wardAndStakeBusiness: MeetingMinuteWardAndStakeBusinessValue
): MeetingMinuteWardAndStakeBusinessValue {
  if (!Array.isArray(wardAndStakeBusiness)) {
    return wardAndStakeBusiness;
  }

  return wardAndStakeBusiness
    .map((item, index) => ({ item, index }))
    .sort((firstItem, secondItem) => {
      const firstRank = getBusinessSortRank(firstItem.item.subject);
      const secondRank = getBusinessSortRank(secondItem.item.subject);

      return firstRank - secondRank || firstItem.index - secondItem.index;
    })
    .map(({ item }) => item);
}

function normalizeMinute(minute: MeetingMinute): MeetingMinute {
  const wardAndStakeBusiness = minute.wardAndStakeBusiness || emptyBusiness;

  return {
    ...minute,
    attendance: minute.attendance || 0,
    date: minute.date || "",
    presides: minute.presides || "",
    leads: minute.leads || "",
    welcomeAndAcknowledgmentsOfAuthorities:
      minute.welcomeAndAcknowledgmentsOfAuthorities || "",
    announcements: minute.announcements || "",
    firstHymn: minute.firstHymn || emptyHymn,
    director: minute.director || "",
    pianist: minute.pianist || "",
    openingPrayer: minute.openingPrayer || "",
    wardAndStakeBusiness: sortWardAndStakeBusinessForPdf(wardAndStakeBusiness),
    sacramentalHymn: minute.sacramentalHymn || emptyHymn,
    messages: minute.messages || [],
    lastHymn: minute.lastHymn || emptyHymn,
    closingPrayer: minute.closingPrayer || "",
  };
}

async function getMinuteById(id: string) {
  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return normalizeMinute(data as MeetingMinute);
}

export default async function MinutePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const minute = await getMinuteById(id);

  if (!minute?.id) {
    notFound();
  }

  return (
    <main className="minute-pdf-page">
      <style>{`
        .minute-pdf-page .minute-sheet {
          font-size: 14px;
        }

        .minute-pdf-page .minute-top h1 {
          font-size: 30px;
        }

        .minute-pdf-page .minute-summary-table,
        .minute-pdf-page .minute-table {
          font-size: 13px;
        }

        .minute-pdf-page .minute-summary-table th,
        .minute-pdf-page .minute-table th {
          font-size: 12px;
        }

        .minute-pdf-page .minute-field span {
          font-size: 13px;
        }

        .minute-pdf-page .minute-field input,
        .minute-pdf-page .minute-lined-text,
        .minute-pdf-page .minute-sheet input,
        .minute-pdf-page .minute-sheet textarea,
        .minute-pdf-page .minute-sheet [contenteditable="true"],
        .minute-pdf-page .minute-date-picker .ant-picker-input > input,
        .minute-pdf-page .minute-number-input .ant-input-number-input {
          font-size: 15px !important;
          line-height: 1.4 !important;
        }

        .minute-pdf-page .minute-field input,
        .minute-pdf-page .minute-hymn-readonly-value,
        .minute-pdf-page .hymn-print-value,
        .minute-pdf-page .ant-select-selection-item {
          font-size: 15px !important;
          line-height: 1.4 !important;
        }

        .minute-pdf-page .minute-table td {
          font-size: 14.5px !important;
          line-height: 1.4 !important;
        }

        .minute-pdf-page .minute-table input,
        .minute-pdf-page .minute-table textarea {
          font-size: 14.5px !important;
          line-height: 1.4 !important;
          padding-top: 0.9mm;
          padding-bottom: 0.9mm;
        }

        .minute-pdf-page .minute-section-title strong {
          font-size: 13px;
        }

        .minute-pdf-page .minute-section-title span {
          font-size: 12px;
        }

        .minute-pdf-page .minute-director-pianist-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: 18px;
          row-gap: 0;
          width: 100%;
          margin-top: 8px;
        }

        .minute-pdf-page .minute-music-person-field {
          grid-column: span 6;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          column-gap: 8px;
          align-items: end;
          border-bottom: 1px solid #8aa7c7;
          padding-bottom: 4px;
        }

        .minute-pdf-page .minute-music-person-field span {
          padding-bottom: 0;
          white-space: nowrap;
        }

        .minute-pdf-page .minute-music-person-field input {
          height: auto;
          min-height: 0;
          padding: 0;
          line-height: 1.12;
        }

        .minute-pdf-page .minute-readonly-lines {
          min-height: var(--minute-readonly-screen-height, 5.1mm);
          padding: 1mm;
          line-height: 5.1mm;
        }

        .minute-pdf-page .minute-hymn-readonly-value {
          flex: 1 1 auto;
          padding: 0.8mm 1mm 0.4mm;
          color: #111827;
          font: inherit;
          font-size: 15px !important;
          font-weight: 400;
          line-height: 1.4 !important;
        }

        @media print {
          .minute-pdf-page .minute-sheet {
            font-size: 14px !important;
          }

          .minute-pdf-page .minute-top h1 {
            font-size: 30px !important;
          }

          .minute-pdf-page .minute-summary-table,
          .minute-pdf-page .minute-table {
            font-size: 13px !important;
          }

          .minute-pdf-page .minute-summary-table th,
          .minute-pdf-page .minute-table th {
            font-size: 12px !important;
          }

          .minute-pdf-page .minute-field span {
            font-size: 13px !important;
          }

          .minute-pdf-page .minute-field input,
          .minute-pdf-page .minute-lined-text,
          .minute-pdf-page .minute-sheet input,
          .minute-pdf-page .minute-sheet textarea,
          .minute-pdf-page .minute-sheet [contenteditable="true"],
          .minute-pdf-page .minute-date-picker .ant-picker-input > input,
          .minute-pdf-page .minute-number-input .ant-input-number-input {
            font-size: 15px !important;
            line-height: 1.4 !important;
          }

          .minute-pdf-page .minute-field input,
          .minute-pdf-page .minute-hymn-readonly-value,
          .minute-pdf-page .hymn-print-value,
          .minute-pdf-page .ant-select-selection-item {
            font-size: 15px !important;
            line-height: 1.4 !important;
          }

          .minute-pdf-page .minute-table td {
            font-size: 14.5px !important;
            line-height: 1.4 !important;
          }

          .minute-pdf-page .minute-table input,
          .minute-pdf-page .minute-table textarea {
            font-size: 14.5px !important;
            line-height: 1.4 !important;
            padding-top: 0.9mm !important;
            padding-bottom: 0.9mm !important;
          }

          .minute-pdf-page .minute-section-title strong {
            font-size: 13px !important;
          }

          .minute-pdf-page .minute-section-title span {
            font-size: 12px !important;
          }

          .minute-pdf-page .minute-director-pianist-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            column-gap: 18px !important;
            row-gap: 0 !important;
            width: 100% !important;
            margin-top: 8px !important;
          }

          .minute-pdf-page .minute-music-person-field {
            grid-column: span 6 !important;
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr) !important;
            column-gap: 8px !important;
            align-items: end !important;
            border-bottom: 1px solid #8aa7c7 !important;
            padding-bottom: 4px !important;
          }

          .minute-pdf-page .minute-music-person-field span {
            padding-bottom: 0 !important;
            white-space: nowrap !important;
          }

          .minute-pdf-page .minute-music-person-field input {
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            line-height: 1.12 !important;
          }

          .minute-pdf-page .minute-readonly-lines {
            min-height: var(--minute-readonly-print-height, 4.75mm) !important;
            padding: 1mm !important;
            line-height: 4.75mm !important;
          }

          .minute-pdf-page .minute-hymn-readonly-value {
            color: #111827 !important;
            font-size: 15px !important;
            line-height: 1.4 !important;
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="minute-pdf-actions no-print">
        <BackCircleButton href="/dashboard/minuta" />
        <PrintMinuteButton />
      </div>
      <section className="minute-pdf-print-area">
        <SacramentalMinuteSheet initialMinute={minute} readOnly />
      </section>
    </main>
  );
}
