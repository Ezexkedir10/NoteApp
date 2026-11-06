import { API_BASE_URL } from "@/lib/config";
import type { ApiResponse } from "@/types/api";

const REQUEST_TIMEOUT_MS = 15_000;

/** Every failed request is surfaced as an ApiError with a human-readable message. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly fieldErrors?: Record<string, string>;

  /** status 0 means the request never got a response (network error / timeout). */
  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Safe text for any thrown value. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  return error instanceof ApiError ? error.message : fallback;
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function buildApiError<T>(status: number, payload: ApiResponse<T> | null): ApiError {
  if (payload && payload.success === false && payload.message) {
    return new ApiError(payload.message, status, payload.errors);
  }
  if (status === 404) return new ApiError("We couldn't find what you were looking for.", status);
  if (status >= 500) return new ApiError("The server ran into a problem. Please try again in a moment.", status);
  return new ApiError("The request could not be completed. Please try again.", status);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

/**
 * The single place where the frontend talks to the backend.
 * Returns the `data` field of a successful response, or throws ApiError.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Copy frontend/.env.example to frontend/.env.local, then restart the dev server.",
      0
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const hasBody = options.body !== undefined;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const payload = await parseJson<T>(response);
    if (response.ok && payload?.success === true) {
      return payload.data;
    }
    throw buildApiError(response.status, payload);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The server took too long to respond. Please try again.", 0);
    }
    throw new ApiError("Can't reach the server. Check your connection and make sure the backend is running.", 0);
  } finally {
    clearTimeout(timeout);
  }
}
