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
    "Usuario";
  const calling = session?.user?.callings || "Sin llamamiento asignado";
  const isAdmin = session?.user?.role === "Admin";

  return (
    <DashboardShell
      userFullName={fullName}
      userCalling={calling}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
