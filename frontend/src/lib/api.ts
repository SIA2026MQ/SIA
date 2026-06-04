import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Missing Firebase config. Check .env.local");
}

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();

const rawApiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE = rawApiBase.replace(/^["']|["']$/g, '').replace(/\/$/, '');

async function getAuthToken(): Promise<string | null> {
  if (auth.currentUser) return await auth.currentUser.getIdToken();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

// ---------------------------------------------------------------------------
// API ENDPOINT EXPORTS
// ---------------------------------------------------------------------------
export const api = {
  // Auth - Ensure this starts with /api
  getMe: () => request<{ message: string, user: any }>("/api/auth/me"),
  
  // Courses
  getAllCourses: () => request<any>("/api/courses"),
  getCourseById: (courseId: string) => request<any>(`/api/courses/${courseId}`),
  
  // Admin
  createCourse: (data: any) => request<any>("/api/courses", { method: "POST", body: JSON.stringify(data) }),
  addVideoToCourse: (courseId: string, data: any) => request<any>(`/api/courses/${courseId}/videos`, { method: "POST", body: JSON.stringify(data) }),
  
  // Webinars & Sessions
  getTodaySession: () => request<any>("/sessions/today"),
  getUpcomingWebinars: () => request<any>("/webinars"),
  redeemWebinarCredit: (webinarId: string) => request<any>("/webinars/redeem", {
    method: "POST",
    body: JSON.stringify({ webinarId })
  }),
  
  // Blogs
  getAllBlogs: () => request<any>("/blogs"),
  getBlogById: (blogId: string) => request<any>(`/blogs/${blogId}`),
};