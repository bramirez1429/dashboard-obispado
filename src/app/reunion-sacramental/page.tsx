import { connection } from "next/server";
import { headers } from "next/headers";
import AdminMeetingMinuteView from "./AdminMeetingMinuteView";
import MinuteRealtimeRefresh from "./MinuteRealtimeRefresh";
import { auth } from "@/auth";
import BackCircleButton from "@/components/common/BackCircleButton";
import { MeetingMinuteView } from "@/components/meeting-minutes/MeetingMinuteView";
import type { MeetingMinute } from "@/components/meeting-minutes/MeetingMinuteView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PublicCurrentMeetingMinuteResponse = {
  success: boolean;
  data?: MeetingMinute | null;
  error?: string;
};

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

const getRequestBaseUrl = async () => {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return getBaseUrl();
};

const getPublicCurrentMeetingMinute =
  async (): Promise<PublicCurrentMeetingMinuteResponse> => {
    const baseUrl = await getRequestBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/meeting-minutes/public-current`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: "No se pudo cargar la reunión sacramental.",
        data: null,
      };
    }

    return response.json();
};

const SacramentalMeetingPage = async () => {
  await connection();

  const session = await auth();
  const showDashboardBackButton = session?.user?.role === "Admin";
  const result = await getPublicCurrentMeetingMinute();
  const minute = result.data ?? null;

  console.log("Resultado GET /api/meeting-minutes/public-current:", result);
  console.log("Minuta seleccionada:", minute);

  return (
    <>
      <MinuteRealtimeRefresh
        minuteId={minute?.id ? String(minute.id) : undefined}
      />
      {showDashboardBackButton ? (
        <>
          <div style={{ padding: "16px 16px 0", background: "#eef3f7" }}>
            <BackCircleButton
              href="/dashboard/minuta"
              ariaLabel="Volver a minuta"
            />
          </div>
          <AdminMeetingMinuteView minute={minute} />
        </>
      ) : (
        <MeetingMinuteView minute={minute} />
      )}
    </>
  );
};

export default SacramentalMeetingPage;
