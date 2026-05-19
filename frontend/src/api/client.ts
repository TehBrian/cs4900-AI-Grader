import createClient from "openapi-fetch";
import type { paths } from "./schema";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function createApiClient(accessToken?: string) {
  const client = createClient<paths>({ baseUrl: BASE_URL });

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
