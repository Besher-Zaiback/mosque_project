import { useCallback } from "react";
import axios from "axios";
import type { useAuth } from "../hooks/useAuth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

export function useApi(auth: ReturnType<typeof useAuth>) {
  return useCallback(
    async function request(
      path: string,
      method: "get" | "post" = "get",
      body?: unknown
    ) {
      const headers = { Authorization: `Bearer ${auth.token}` };
      return method === "get"
        ? (await api.get(path, { headers })).data
        : (await api.post(path, body, { headers })).data;
    },
    [auth.token]
  );
}
