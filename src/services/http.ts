// src/services/http.ts
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    // Nếu backend trả lỗi -> đọc toàn bộ text để log
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (ct.includes("application/json")) {
    return res.json() as Promise<T>;
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON but got: ${ct}. Body: ${text.slice(0, 200)}…`);
  }
}
