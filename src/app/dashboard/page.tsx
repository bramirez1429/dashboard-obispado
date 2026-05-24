import { auth } from "@/auth";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

export default async function DashboardPage() {
  const session = await auth();
  const fullName =
    `${session?.user?.name || ""} ${session?.user?.lastname || ""}`.trim() ||
    "Usuario";
  // const calling = session?.user?.callings || "Sin llamamiento asignado";

  return <DashboardHome fullName={fullName} /* calling={calling}  *//>;
}
