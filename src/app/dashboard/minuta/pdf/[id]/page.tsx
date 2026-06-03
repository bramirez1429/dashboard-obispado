import { notFound } from "next/navigation";
import Link from "next/link";
import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import type { MeetingMinute } from "@/types/meeting-minute";
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

function normalizeMinute(minute: MeetingMinute): MeetingMinute {
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
    wardAndStakeBusiness: minute.wardAndStakeBusiness || emptyBusiness,
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
