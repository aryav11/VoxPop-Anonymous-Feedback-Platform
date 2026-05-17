import { apiBaseUrl, publicAnonKey } from "@/config/supabase";
import { handleLocalApi } from "@/lib/localMockApi";

type ApiError = {
  error?: string;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (import.meta.env.VITE_USE_LOCAL_DATA === "true") {
    return handleLocalApi<T>(path, options);
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${publicAnonKey}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.warn("Supabase request failed; using local demo data instead.", error);
    return handleLocalApi<T>(path, options);
  }

  const data = await readJson<ApiError | T>(response);

  if (!response.ok) {
    const serverError = new Error((data as ApiError)?.error || `Request failed with status ${response.status}`);

    if (import.meta.env.VITE_DISABLE_LOCAL_FALLBACK !== "true") {
      try {
        return await handleLocalApi<T>(path, options);
      } catch {
        throw serverError;
      }
    }

    throw serverError;
  }

  return data as T;
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { error: text } as T;
  }
}
