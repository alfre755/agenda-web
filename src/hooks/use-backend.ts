"use client"

export function useBackend() {
  async function get<T = any>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, { ...init, method: "GET" });
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return (await res.json()) as T;
  }

  async function post<T = any>(url: string, body?: any, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
    return (await res.json()) as T;
  }

  return { get, post } as const;
}
