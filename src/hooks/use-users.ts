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

  const hasRole = (role: string) => {
    const raw = currentUser?.role || "";
    return raw
      .split(",")
      .map((r) => r.trim().toLowerCase())
      .includes(role.toLowerCase());
  };

  const initials = useMemo(() => {
    if (!userName) return "";
    const parts = userName.trim().split(/\s+/);
    const head = parts[0]?.[0] ?? "";
    const tail = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (head + tail).toUpperCase();
  }, [userName]);

  async function updateUser(input: { name?: string; image?: string }) {
    return authClient.updateUser(input as any);
  }

  async function changeEmail(input: { newEmail: string; callbackURL?: string }) {
    return authClient.changeEmail(input as any);
  }

  async function changePassword(input: { newPassword: string; currentPassword: string; revokeOtherSessions?: boolean }) {
    return authClient.changePassword(input as any);
  }

  return {
    currentUser,
    userId,
    userEmail,
    userName,
    userImage,
    initials,
    hasRole,
    updateUser,
    changeEmail,
    changePassword,
  } as const;
}
