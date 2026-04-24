import { useState } from "react";
import type { AuthUser, Role } from "../types/models";

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("token") ?? "");
  const [user, setUser] = useState<AuthUser | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") as string)
      : null
  );
  const save = (nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };
  const clear = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };
  return { token, user, save, clear };
}

export type AuthState = ReturnType<typeof useAuth>;

export function roleHome(role: Role) {
  if (role === "SUPERVISOR") return "/supervisor";
  if (role === "MOSQUE_MANAGER") return "/manager";
  if (role === "GENERAL_MANAGER") return "/general";
  if (role === "PARENT") return "/parent";
  return "/login";
}
