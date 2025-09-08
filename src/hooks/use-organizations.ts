"use client"
import { authClient } from "@/lib/auth-client";

export function useOrganizations() {
  async function listOrganizations(params?: any) {
    // @ts-expect-error depende de versión/plugin
    if (authClient.admin?.listOrganizations) return authClient.admin.listOrganizations(params);
    // @ts-expect-error
    if (authClient.organization?.list) return authClient.organization.list(params);
    return { data: null, error: { message: "listOrganizations no disponible" } } as const;
  }

  async function createOrganization(payload: { name: string; slug: string; logo?: string; metadata?: Record<string, any>; keepCurrentActiveOrganization?: boolean }) {
    // Preferir API de organización del cliente
    // @ts-expect-error
    if (authClient.organization?.create) return authClient.organization.create(payload);
    // Fallback admin (si existiera en tu versión)
    // @ts-expect-error
    if (authClient.admin?.createOrganization) return authClient.admin.createOrganization(payload);
    return { data: null, error: { message: "createOrganization no disponible" } } as const;
  }

  async function updateOrganization(orgId: string, updates: Record<string, any>) {
    // Preferir API moderna: organization.update({ data, organizationId })
    // @ts-expect-error
    if (authClient.organization?.update) {
      return authClient.organization.update({ data: updates, organizationId: orgId });
    }
    // Fallback hipotético admin.updateOrganization({ organizationId, data }) si existiera
    // @ts-expect-error
    if (authClient.admin?.updateOrganization) {
      return authClient.admin.updateOrganization({ organizationId: orgId, data: updates });
    }
    return { data: null, error: { message: "updateOrganization no disponible" } } as const;
  }

  async function removeOrganization(orgId: string) {
    // API moderna: organization.delete({ organizationId })
    // @ts-expect-error
    if (authClient.organization?.delete) return authClient.organization.delete({ organizationId: orgId });
    // Fallback admin
    // @ts-expect-error
    if (authClient.admin?.removeOrganization) return authClient.admin.removeOrganization({ organizationId: orgId });
    return { data: null, error: { message: "removeOrganization no disponible" } } as const;
  }

  return { listOrganizations, createOrganization, updateOrganization, removeOrganization } as const;
}
