"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { MeetingMinute } from "@/types/meeting-minute";
import { revalidatePath } from "next/cache";

export type CreateMinuteValues = MeetingMinute;

const getMessages = (values: CreateMinuteValues) =>
  (values.messages ?? [])
    .map((message) => ({
      speechId: message.speechId,
      name: message.name?.trim() ?? "",
      time: Number(message.time ?? 0),
      topic: message.topic?.trim() ?? "",
    }))
    .filter(
      (message) => message.speechId || message.name || message.time || message.topic
    );

const getWardAndStakeBusiness = (values: CreateMinuteValues) => {
  const businessItems = Array.isArray(values.wardAndStakeBusiness)
    ? values.wardAndStakeBusiness
    : [values.wardAndStakeBusiness];
  const business = businessItems
    .map((item) => ({
      interviewId: item?.interviewId,
      subject: item?.subject?.trim() || "",
      name: item?.name?.trim() || "",
      details: item?.details?.trim() || "",
    }))
    .filter((item) => item.interviewId || item.subject || item.name || item.details);

  return business.length
    ? business
    : [
        {
          subject: "",
          name: "",
          details: "",
        },
      ];
};

export const createMinuteAction = async (values: CreateMinuteValues) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      ok: false,
      error: "No autorizado",
      message: "No autorizado",
    };
  }

  if (!values.date?.trim()) {
    return {
      success: false,
      ok: false,
      error: "La fecha de la reunion es obligatoria",
      message: "La fecha de la reunion es obligatoria",
    };
  }

  const payload = {
    attendance: values.attendance || 0,
    date: values.date,
    presides: values.presides?.trim() || "",
    leads: values.leads?.trim() || "",
    welcomeAndAcknowledgmentsOfAuthorities:
      values.welcomeAndAcknowledgmentsOfAuthorities?.trim() || "",
    announcements: values.announcements?.trim() || "",
    firstHymn: values.firstHymn,
    director: values.director?.trim() || "",
    pianist: values.pianist?.trim() || "",
    openingPrayer: values.openingPrayer?.trim() || "",
    wardAndStakeBusiness: getWardAndStakeBusiness(values),
    sacramentalHymn: values.sacramentalHymn,
    messages: getMessages(values),
    lastHymn: values.lastHymn,
    closingPrayer: values.closingPrayer?.trim() || "",
  };

  console.log("payload Meeting_minutes:", payload);

  const { data, error } = await supabaseAdmin
    .from("Meeting_minutes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creando minuta:", error);

    return {
      success: false,
      ok: false,
      error: error.message,
      message: error.message,
    };
  }

  revalidatePath("/dashboard/minuta");
  revalidatePath("/reunion-sacramental");

  return {
    success: true,
    ok: true,
    message: "Minuta creada correctamente",
    data,
    id: data?.id ? String(data.id) : undefined,
  };
};

export const deleteMinuteAction = async (minuteId: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "No autorizado",
    };
  }

  const { error } = await supabaseAdmin
    .from("Meeting_minutes")
    .delete()
    .eq("id", minuteId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
};
