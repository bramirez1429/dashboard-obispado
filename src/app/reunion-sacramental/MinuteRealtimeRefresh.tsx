"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

type MinuteRealtimeRefreshProps = {
  minuteId?: string;
};

export default function MinuteRealtimeRefresh({
  minuteId,
}: MinuteRealtimeRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!minuteId) {
      return;
    }

    const channel = supabase
      .channel(`public-meeting-minute-${minuteId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Meeting_minutes",
          filter: `id=eq.${minuteId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [minuteId, router]);

  return null;
}
