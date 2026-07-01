import MissionaryLunchCalendar, {
  type MissionaryLunch,
} from "@/components/missionary-lunch-calendar/MissionaryLunchCalendar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AlmuerzosMisionerosPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dayOfMonth = today.getDate();
  const canViewNextMonth = dayOfMonth >= 27;
  const MONTHS_ES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const nextMonthDate = new Date(year, month + 1, 1);
  const nextMonthLabel = MONTHS_ES[nextMonthDate.getMonth()];

  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Missionary_lunches")
    .select(
      "id,lunch_date,status,person_name,lunch_time,companionship,chacabuco_1_elders,chacabuco_2_elders,created_at",
    )
    .gte("lunch_date", startDate)
    .lte("lunch_date", endDate)
    .eq("status", "occupied")
    .order("lunch_date", { ascending: true });

  const initialLunches = error ? [] : ((data ?? []) as MissionaryLunch[]);

  return (
    <MissionaryLunchCalendar
      mode="public"
      initialLunches={initialLunches}
      initialYear={year}
      initialMonth={month}
      canViewNextMonth={canViewNextMonth}
      nextMonthLabel={nextMonthLabel}
    />
  );
}
