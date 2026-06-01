import { notFound } from "next/navigation";
import MinuteEditForms from "../../components/MinuteEditForms";
import type { MeetingMinute } from "@/types/meeting-minute";

export const revalidate = 120;

const emptyHymn = {
  number: "",
  title: "",
};

const emptyBusiness = {
  subject: "",
  name: "",
  details: "",
};

async function getMinuteById(id: string) {
  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  const minute = data as MeetingMinute;

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

export default async function EditMinutePage({
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
    <main style={{ maxWidth: 980, margin: "0 auto", paddingBottom: 32 }}>
      <div style={{ marginBottom: 12 }}>
        <h1
          style={{
            margin: 0,
            color: "#263746",
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: 0,
          }}
        >
          Editar minuta
        </h1>
      </div>
      <MinuteEditForms minute={minute} />
    </main>
  );
}
