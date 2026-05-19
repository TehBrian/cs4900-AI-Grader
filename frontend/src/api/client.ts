import createClient from "openapi-fetch";
import type { paths } from "./schema";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(request: Request): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  const abortRequest = () => controller.abort(request.signal.reason);
  if (request.signal.aborted) {
    abortRequest();
  } else {
    request.signal.addEventListener("abort", abortRequest, { once: true });
  }

  try {
    return await fetch(new Request(request, { signal: controller.signal }));
  } finally {
    window.clearTimeout(timeoutId);
    request.signal.removeEventListener("abort", abortRequest);
  }
}

export function createApiClient(accessToken?: string) {
  const client = createClient<paths>({ baseUrl: BASE_URL, fetch: fetchWithTimeout });

  if (accessToken) {
    client.use({
      onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${accessToken}`);
        return request;
      },
    });
  }

  return client;
}

// Unauthenticated client for login, register, forgot/reset password
export const publicClient = createApiClient();
