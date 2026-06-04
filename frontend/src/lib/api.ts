import { auth } from "./firebase";

// Automatically uses the correct base URL
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

export const api = {
  // Core fetch wrapper
  async fetch(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Automatically attach the secure Firebase token if the user is logged in
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  },

  // Calls your existing backend route!
  getMe: async () => {
    return api.fetch("/auth/me", {
      method: "GET",
    });
  },
};