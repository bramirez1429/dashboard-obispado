import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const fullName =
    `${session?.user?.name || ""} ${session?.user?.lastname || ""}`.trim() ||
    session?.user?.username ||
    "Usuario";
  const calling = session?.user?.callings || "Sin llamamiento asignado";
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

  return (
    <DashboardShell
      userFullName={fullName}
      userCalling={calling}
      isAdmin={isAdmin}
      isCollaborator={isCollaborator}
      canAccessCalendar={canAccessCalendar}
    >
      {children}
    </DashboardShell>
  );
}
