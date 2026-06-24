import PossibleSpeakersClient from "./PossibleSpeakersClient";
import type { PossibleSpeaker } from "./PossibleSpeakersClient";
import { supabase } from "@/lib/supabase/client";

export const revalidate = 0;

async function getPossibleSpeakers() {
  const { data, error } = await supabase
    .from("Possible_speakers")
    .select("id, first_name, last_name, discourse")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error loading possible speakers:", error);
    return [];
  }

  return (data || []) as PossibleSpeaker[];
}

export default async function PossibleSpeakersPage() {
  const speakers = await getPossibleSpeakers();

  return <PossibleSpeakersClient initialSpeakers={speakers} />;
}
