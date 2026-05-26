import {
  MeetingMinuteView,
  type MeetingMinute,
} from "@/components/meeting-minutes/MeetingMinuteView";

type MeetingMinutesResponse = {
  success: boolean;
  table?: string;
  count?: number | null;
  data?: MeetingMinute[];
  error?: string;
};

export const dynamic = "force-dynamic";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return "http://localhost:3000";
};

const getMeetingMinutes = async (): Promise<MeetingMinutesResponse> => {
  const response = await fetch(`${getBaseUrl()}/api/meeting-minutes`, {
    method: "GET",
    next: { revalidate: 10 },
  });

  if (!response.ok) {
    return {
      success: false,
      error: "No se pudo cargar la minuta.",
      data: [],
    };
  }

  return response.json();
};

const ViewMinutePage = async () => {
  const result = await getMeetingMinutes();

  console.log("Resultado GET /api/meeting-minutes:", result);

  const minute = result.data?.[0] ?? null;

  return <MeetingMinuteView minute={minute} />;
};

export default ViewMinutePage;
