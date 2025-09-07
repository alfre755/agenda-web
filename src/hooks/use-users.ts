"use client";
import { useMemo } from "react";
import { authClient } from "@/lib/auth-client";

export function useUsers() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user ?? null;

  const userId = currentUser?.id ?? null;
  const userEmail = currentUser?.email ?? null;
  const userName = currentUser?.name ?? null;
  const userImage = currentUser?.image ?? null;

  const hasRole = (role: string) => currentUser?.role === role;

  const initials = useMemo(() => {
    if (!userName) return "";
    const parts = userName.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (head + tail).toUpperCase();
  }, [userName]);

  return {
    currentUser,
    userId,
    userEmail,
    userName,
    userImage,
    initials,
    hasRole,
  } as const;
}
