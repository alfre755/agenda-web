"use client"
import { authClient } from "@/lib/auth-client";

export function useAdmin() {
  async function listUsers(params?: Parameters<typeof authClient.admin.listUsers>[0]) {
    return authClient.admin.listUsers(params as any);
  }

  async function createUser(payload: { name: string; email: string; password: string; image?: string; role?: string | string[]; data?: Record<string, any> }) {
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

  async function removeUser(input: { userId: string }) {
    // @ts-expect-error
    if (authClient.admin?.removeUser) return authClient.admin.removeUser(input);
    return { data: null, error: { message: "removeUser no disponible" } } as const;
  }

  // Alias por compatibilidad si en algún lugar se usa deleteUser
  async function deleteUser(userId: string) {
    return removeUser({ userId });
  }

  async function setRole(input: { userId: string; role: string | string[] }) {
    // @ts-expect-error
    if (authClient.admin?.setRole) return authClient.admin.setRole(input);
    return { data: null, error: { message: "setRole no disponible" } } as const;
  }

  async function setUserPassword(input: { userId: string; newPassword: string }) {
    // @ts-expect-error
    if (authClient.admin?.setUserPassword) return authClient.admin.setUserPassword(input);
    return { data: null, error: { message: "setUserPassword no disponible" } } as const;
  }

  return { listUsers, createUser, updateUser, removeUser, deleteUser, setRole, setUserPassword } as const;
}
