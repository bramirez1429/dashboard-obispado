import { notFound } from "next/navigation";
import PublicMessageCard, { PublicSpeech } from "@/components/speeches/PublicMessageCard";

export const dynamic = "force-dynamic";

type SpeechGetResponse = {
  success: boolean;
  data?: PublicSpeech;
  error?: string;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const PublicMessagePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  console.log("PUBLIC SPEECH PARAM ID:", id);
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/api/speeches/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const result = (await response.json()) as SpeechGetResponse;

  if (!result.success || !result.data) {
    notFound();
  }

  return <PublicMessageCard speech={result.data} />;
};

export default PublicMessagePage;
