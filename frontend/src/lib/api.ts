import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) return user.getIdToken();
  // Wait for auth state to resolve
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      resolve(user ? await user.getIdToken() : null);
    });
  });
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getMe: () => request<{ user: any }>("/api/auth/me"),
  // ... other endpoints
};