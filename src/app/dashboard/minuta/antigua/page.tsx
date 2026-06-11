import BackCircleButton from "@/components/common/BackCircleButton";
import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import EditActiveMinuteButton from "../components/EditActiveMinuteButton";

export default function OldMinutePage() {
  return (
    <div className="minute-page">
      <BackCircleButton href="/dashboard/minuta/nueva" />
      <EditActiveMinuteButton minuteId={undefined} />
      <SacramentalMinuteSheet />
    </div>
  );
}
