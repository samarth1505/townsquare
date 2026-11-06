import { singleFlight } from "./singleFlight";

// Codes the client itself produces (not sent by the backend).
export const ERROR_CODES = {
  network: "network_error",
  timeout: "timeout",
  unknown: "unknown_error",
} as const;

// A failed HTTP call, with the status and the backend's error code (e.g. "wrong_otp").
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000; // never let a request hang forever

export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
}

export interface HttpClientConfig {
  baseUrl: string;
  // Attach "Authorization: Bearer <token>" when this returns a token.
  getAccessToken?: () => string | null;
  // Called when a request gets 401. Return true if a new token is now available (the request is retried once).
  refreshSession?: () => Promise<boolean>;
  // Abort a request that takes longer than this (default 10 s).
  timeoutMs?: number;
  // Headers added to EVERY request (for example the mobile app identifies itself with "x-client: mobile").
  headers?: Record<string, string>;
}

// Created ONCE at app start. Feature APIs receive this client; they never see the base URL.
export function createHttpClient({
  baseUrl,
  getAccessToken,
  refreshSession,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  headers: defaultHeaders = {},
}: HttpClientConfig): HttpClient {
  // Single-flight: if 10 requests get 401 together, they all wait for ONE refresh.
  // Refresh tokens are single-use, so ten parallel refreshes would reject nine of them.
  const refreshOnce = refreshSession ? singleFlight(refreshSession) : null;

  async function send(method: "GET" | "POST", path: string, body?: unknown): Promise<Response> {
    const headers: Record<string, string> = { ...defaultHeaders };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = getAccessToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    // AbortController: calling abort() makes the fetch reject. A timer calls it when time is up.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(baseUrl + path, {
        method,
        headers,
        credentials: "include", // lets the browser store/send the httpOnly refresh cookie
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      // An aborted fetch rejects with an error named "AbortError": that means OUR timer fired.
      if ((err as { name?: string }).name === "AbortError")
        throw new ApiError(0, ERROR_CODES.timeout);
      throw err; // anything else is a real network failure
    } finally {
      clearTimeout(timer); // always stop the timer, success or failure
    }
  }

  async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    let res = await send(method, path, body);

    if (res.status === 401 && refreshOnce) {
      const refreshed = await refreshOnce();
      if (refreshed) res = await send(method, path, body); // retry exactly once with the new token
    }

    const data = await res.json().catch(() => ({})); // an error response may have no JSON body
    if (!res.ok) throw new ApiError(res.status, data.error ?? ERROR_CODES.unknown); // fetch only rejects on network failure, not on 4xx/5xx
    return data as T;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
  };
}
