import type { AdminStats, HistoryItem, Review, User } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export function setToken(token: string) {
  window.localStorage.setItem("token", token);
}

export function clearToken() {
  window.localStorage.removeItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "请求失败";
    try {
      const data = await response.json();
      message = data.detail ?? message;
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  async login(email: string, password: string) {
    return request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async register(name: string, email: string, password: string) {
    return request<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  async me() {
    return request<User>("/auth/me");
  },
  async reviewEssay(payload: { title: string; prompt?: string; text: string }) {
    return request<Review>("/essays/review", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async listHistory() {
    return request<HistoryItem[]>("/essays");
  },
  async getReview(id: number) {
    return request<Review>(`/essays/${id}`);
  },
  async adminStats() {
    return request<AdminStats>("/admin/stats");
  },
};

