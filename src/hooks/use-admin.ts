"use client"
import { authClient } from "@/lib/auth-client";

export function useAdmin() {
  async function listUsers(params?: Parameters<typeof authClient.admin.listUsers>[0]) {
    return authClient.admin.listUsers(params as any);
  }

  async function createUser(payload: { name: string; email: string; password?: string; image?: string; role?: string }) {
    // Si better-auth expone admin.createUser, úsalo; si no, recurre a signUp con flujo admin
    // Placeholder:
    // @ts-expect-error - dependiendo de la versión
    if (authClient.admin?.createUser) return authClient.admin.createUser(payload);
    return { data: null, error: { message: "createUser no disponible en esta versión" } } as const;
  }

  async function updateUser(userId: string, updates: Record<string, unknown>) {
    // @ts-expect-error
    if (authClient.admin?.updateUser) return authClient.admin.updateUser(userId, updates);
    return { data: null, error: { message: "updateUser no disponible" } } as const;
  }

  async function deleteUser(userId: string) {
    // @ts-expect-error
    if (authClient.admin?.deleteUser) return authClient.admin.deleteUser(userId);
    return { data: null, error: { message: "deleteUser no disponible" } } as const;
  }

  return { listUsers, createUser, updateUser, deleteUser } as const;
}
