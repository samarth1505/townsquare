import { createContext, useContext } from "react";
import type { Session } from "@hub/core";

export type AuthContextValue = {
  session: Session | null; // null = not logged in
  isRestoring: boolean; // true while we check, at startup, whether the refresh cookie gives us a session
  signIn: (session: Session) => void;
  signOut: () => void;
};

// The "notice board". null means "no provider above me", which is a programming mistake.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Custom hook: components call useAuth() instead of touching the context object directly.
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return value;
}
