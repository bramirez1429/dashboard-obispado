import { supabase } from "@/lib/supabase/client";

type SpeechRequestBody = {
  name?: string;
  date?: string;
  speech?: string;
  time?: number;
  references?: string;
  additional_instructions?: string;
  internal_observations?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SpeechRequestBody;

  if (!body.name || !body.date || !body.speech || body.time === undefined) {
    return Response.json(
      {
        success: false,
        error: "Missing required fields",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("Speeches")
    .insert({
      name: body.name,
      date: body.date,
      speech: body.speech,
      time: body.time,
      references: body.references,
    })
    .select()
    .single();

  if (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return Response.json(
    { success: true, data },
    { status: 201 },
  );
}
