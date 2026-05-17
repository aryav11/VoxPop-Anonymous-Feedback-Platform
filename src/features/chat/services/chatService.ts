import { apiFetch } from "@/lib/apiClient";
import type { Message, SessionData } from "../types";

export const loadSessionAPI = async (id: string): Promise<SessionData> => {
  return apiFetch<SessionData>(`/session/${id}`).catch((error) => {
    if (error instanceof Error && error.message === "Session not found") {
      throw new Error("Session not found. Please check your session ID.");
    }

    throw error;
  });
};

export const sendMessageAPI = async (
  sessionId: string,
  message: string
): Promise<{ message: Message }> => {
  return apiFetch<{ message: Message }>(`/session/${sessionId}/message`, {
    method: "POST",
    body: JSON.stringify({
      message,
      isAdmin: false,
    }),
  });
};
