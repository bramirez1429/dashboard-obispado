import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SpeechRecord = {
  id?: string | number;
  public_id?: string | number;
  uid?: string | number;
  token?: string | number;
  link_id?: string | number;
  route_id?: string | number;
};

const publicSpeechIdFields = [
  "id",
  "public_id",
  "uid",
  "token",
  "link_id",
  "route_id",
] as const;

function matchesPublicSpeechParam(speech: SpeechRecord, id: string) {
  return publicSpeechIdFields.some((field) => String(speech[field] ?? "") === id);
}

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;
  console.log("PUBLIC SPEECH PARAM ID:", id);

  const { data, error } = await supabase
    .from("Speeches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Speech query error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  if (data) {
    return Response.json({
      success: true,
      data,
    });
  }

  const { data: speeches, error: fallbackError } = await supabase
    .from("Speeches")
    .select("*");

  if (fallbackError) {
    console.error("Speech query error:", fallbackError);

    return Response.json(
      { success: false, error: fallbackError.message },
      { status: 500 },
    );
  }

  const speech = (speeches as SpeechRecord[] | null)?.find((item) =>
    matchesPublicSpeechParam(item, id)
  );

  if (!speech) {
    console.log("Speech not found for param:", id);

    return Response.json(
      { success: false, error: "Mensaje no encontrado" },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data: speech,
  });
};

export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;
  const body = await request.json();
  const valuesToUpdate: {
    status?: "pending" | "shared";
    did_speak?: boolean;
    name?: string;
    gender?: "masculine" | "feminine";
    date?: string;
    speech?: string;
    time?: number;
    references?: string;
  } = {};

  if (body.status === "pending" || body.status === "shared") {
    valuesToUpdate.status = body.status;
  }

  if (typeof body.did_speak === "boolean") {
    valuesToUpdate.did_speak = body.did_speak;
  }

  if (typeof body.name === "string") {
    valuesToUpdate.name = body.name;
  }

  if (body.gender === "masculine" || body.gender === "feminine") {
    valuesToUpdate.gender = body.gender;
  }

  if (typeof body.date === "string") {
    valuesToUpdate.date = body.date;
  }

  if (typeof body.speech === "string") {
    valuesToUpdate.speech = body.speech;
  }

  if (typeof body.time === "number") {
    valuesToUpdate.time = body.time;
  }

  if (typeof body.references === "string") {
    valuesToUpdate.references = body.references;
  }

  if (!Object.keys(valuesToUpdate).length) {
    return Response.json(
      { success: false, error: "No hay campos validos para actualizar" },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("Speeches")
    .update(valuesToUpdate)
    .eq("id", id);

  if (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return Response.json({
    success: true,
  });
};

export const DELETE = async (
  _request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;
  const { error } = await supabaseAdmin.from("Speeches").delete().eq("id", id);

  if (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return Response.json({
    success: true,
  });
};
