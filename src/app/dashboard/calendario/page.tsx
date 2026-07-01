import { auth } from "@/auth";
import MissionaryLunchCalendar from "@/components/missionary-lunch-calendar/MissionaryLunchCalendar";
import { redirect } from "next/navigation";

export default async function CalendarioPage() {
  const session = await auth();
  const role = session?.user?.role;
  const normalizedRole = role
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const roleKey =
    normalizedRole === "admin"
      ? "administrador"
      : normalizedRole === "bishopric"
        ? "gestion"
        : normalizedRole === "leader"
          ? "colaborador"
          : normalizedRole;
  const isAdmin = roleKey === "administrador";
  const isGestion = roleKey === "gestion";
  const isCollaborator = roleKey === "colaborador";
  const canAccessCalendar = isAdmin || isGestion || isCollaborator;
  const canManageCalendar = isAdmin || isCollaborator;

  if (!canAccessCalendar) {
    redirect("/dashboard");
  }

  return <MissionaryLunchCalendar mode={canManageCalendar ? "admin" : "public"} />;
}
