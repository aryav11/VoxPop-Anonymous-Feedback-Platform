import { apiFetch } from "@/lib/apiClient";
import type { SubmissionResult } from "../types";

export const submitFeedback = async (
  feedback: string,
  category: string
): Promise<SubmissionResult> => {
  return apiFetch<SubmissionResult>("/feedback", {
    method: "POST",
    body: JSON.stringify({
      text: feedback,
      category: category || undefined,
      isAnonymous: true,
    }),
  });
};
