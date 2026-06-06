export const CREATOR_DEV_ASSESSMENT_STORAGE_KEY = "creatorDevAssessment";

export type CreatorDevAssessmentSession = {
  assessmentId: string;
  customerEmail: string;
  fullName: string;
};

export function saveCreatorDevAssessmentSession(
  data: CreatorDevAssessmentSession
): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(CREATOR_DEV_ASSESSMENT_STORAGE_KEY, JSON.stringify(data));
}

export function readCreatorDevAssessmentSession(): CreatorDevAssessmentSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(CREATOR_DEV_ASSESSMENT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CreatorDevAssessmentSession>;
    if (
      typeof parsed.assessmentId === "string" &&
      typeof parsed.customerEmail === "string" &&
      typeof parsed.fullName === "string"
    ) {
      return {
        assessmentId: parsed.assessmentId,
        customerEmail: parsed.customerEmail,
        fullName: parsed.fullName,
      };
    }
  } catch {
    return null;
  }

  return null;
}
