import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("Session in layout:", session);
  const fullName =
    `${session?.user?.name || ""} ${session?.user?.lastname || ""}`.trim() ||
    "Usuario";
  const calling = session?.user?.callings || "Sin llamamiento asignado";

  return (
    <DashboardShell userFullName={fullName} userCalling={calling}>
      {children}
    </DashboardShell>
  );
}
