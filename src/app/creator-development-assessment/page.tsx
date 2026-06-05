import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** Legacy URL — forwards to /creator-development */
export default function CreatorDevelopmentAssessmentRedirect() {
  redirect(ROUTES.creatorDevelopment);
}
