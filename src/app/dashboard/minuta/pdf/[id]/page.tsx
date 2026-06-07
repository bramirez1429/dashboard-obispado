import { notFound } from "next/navigation";
import Link from "next/link";
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
          font-size: 12px;
          font-weight: 400;
          line-height: 6.2mm;
        }

        @media print {
          .minute-pdf-page .minute-readonly-lines {
            min-height: var(--minute-readonly-print-height, 4.75mm) !important;
            padding: 1mm !important;
            line-height: 4.75mm !important;
          }

          .minute-pdf-page .minute-hymn-readonly-value {
            color: #111827 !important;
            font-size: 12px !important;
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="minute-pdf-actions no-print">
        <Link
          className="minute-back-arrow"
          href="/dashboard/minuta"
          prefetch={false}
          aria-label="Volver a minuta"
        >
          ←
        </Link>
        <PrintMinuteButton />
      </div>
      <section className="minute-pdf-print-area">
        <SacramentalMinuteSheet initialMinute={minute} readOnly />
      </section>
    </main>
  );
}
