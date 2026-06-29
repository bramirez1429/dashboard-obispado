import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InterviewsClient from "./InterviewsClient";

export default async function AdminInterviewsPage() {
  const session = await auth();

  if (session?.user?.role !== "Admin") {
    redirect("/dashboard");
  }

  return <InterviewsClient />;
}
