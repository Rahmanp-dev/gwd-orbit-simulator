/**
 * api-client.ts — Typed fetch wrappers for all GWD Orbit API calls.
 * 
 * Usage:
 *   const { data, error } = await apiGet<{ deals: Deal[] }>('/api/deals');
 *   const { data, error } = await apiMutate<{ deal: Deal }>('/api/deals', { body: payload });
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * GET request with typed response.
 * Throws ApiError on non-2xx responses for SWR error handling.
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error || `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

/**
 * Safe GET that returns { data, error } instead of throwing.
 */
export async function apiGetSafe<T = unknown>(url: string): Promise<ApiResult<T>> {
  try {
    const data = await apiGet<T>(url);
    return { data, error: null, status: 200 };
  } catch (err) {
    if (err instanceof ApiError) {
      return { data: null, error: err.message, status: err.status };
    }
    return { data: null, error: (err as Error).message, status: 500 };
  }
}

/**
 * POST/PUT/PATCH/DELETE request with typed response.
 */
export async function apiMutate<T = unknown>(
  url: string,
  options: {
    method?: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: options.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        data: null,
        error: (json as any).error || `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return { data: json as T, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "Network error",
      status: 0,
    };
  }
}

/** SWR fetcher that works with apiGet (throws on error for SWR error handling) */
export const swrFetcher = <T>(url: string) => apiGet<T>(url);
