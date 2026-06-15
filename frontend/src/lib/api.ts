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

  // USER & AUTH
  getMe: async () => api.fetch("/auth/me", { method: "GET" }),

  // COURSES
  getAllCourses: async () => api.fetch("/courses", { method: "GET" }),
  getCourseById: async (courseId: string) => api.fetch(`/courses/${courseId}`, { method: "GET" }),
  createCourse: async (data: any) => api.fetch("/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: async (courseId: string, data: any) => api.fetch(`/courses/${courseId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCourse: async (courseId: string) => api.fetch(`/courses/${courseId}`, { method: "DELETE" }),
  addVideoToCourse: async (courseId: string, data: any) => api.fetch(`/courses/${courseId}/videos`, { method: "POST", body: JSON.stringify(data) }),
  getUploadUrl: async (fileName: string, contentType: string, courseId: string) => api.fetch("/courses/upload-url", { method: "POST", body: JSON.stringify({ fileName, contentType, courseId }) }),
  getMyEnrolledCourses: async () => api.fetch("/courses/enrolled/me", { method: "GET" }),

  // PAYMENTS & CART
  checkoutCart: async (items: any[]) => api.fetch("/payments/checkout-cart", { method: "POST", body: JSON.stringify({ items }) }),
  createUnifiedOrder: async (data: { itemId: string; itemType: string; customAmountInr?: number }) => api.fetch("/payments/create-order", { method: "POST", body: JSON.stringify(data) }),
  verifyUnifiedPayment: async (paymentData: any) => api.fetch("/payments/verify", { method: "POST", body: JSON.stringify(paymentData) }),
  // PAYMENTS & CART
  // PAYMENTS & CART
  submitGroupRequest: async (data: { memberCount: number; emails: string[] }) => api.fetch("/payments/group-request", { method: "POST", body: JSON.stringify(data) }),
  validateCoupon: async (code: string) => api.fetch("/payments/validate-coupon", { method: "POST", body: JSON.stringify({ code }) }),

  // DAILY SESSIONS
  getTodaySession: async () => api.fetch("/sessions/today", { method: "GET" }),
  getSessionHistory: async () => api.fetch("/sessions/history", { method: "GET" }),
  createDailySession: async (data: { title: string; zoomLink: string }) => api.fetch("/sessions/today", { method: "POST", body: JSON.stringify(data) }),
  getAllPlans: async () => api.fetch("/sessions/plans", { method: "GET" }),

  // ---------------------------------------------------------------------------
  // WEBINARS (CRUD Operations)
  // ---------------------------------------------------------------------------
  getWebinars: async () => api.fetch("/webinars", { method: "GET" }),
  createWebinar: async (data: any) => api.fetch("/webinars", { method: "POST", body: JSON.stringify(data) }),
  updateWebinar: async (id: string, data: any) => api.fetch(`/webinars/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWebinar: async (id: string) => api.fetch(`/webinars/${id}`, { method: "DELETE" }),
  redeemWebinarCredit: async (webinarId: string) => api.fetch("/webinars/redeem", { method: "POST", body: JSON.stringify({ webinarId }) }),

  // ---------------------------------------------------------------------------
  // RETREATS & APPLICATIONS
  // ---------------------------------------------------------------------------
  getRetreats: async () => api.fetch("/retreats", { method: "GET" }),
  createRetreat: async (data: any) => api.fetch("/retreats", { method: "POST", body: JSON.stringify(data) }),
  updateRetreat: async (id: string, data: any) => api.fetch(`/retreats/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRetreat: async (id: string) => api.fetch(`/retreats/${id}`, { method: "DELETE" }),
  applyForRetreat: async (data: { retreatId: string; name: string; email: string; phone: string }) => api.fetch("/retreats/apply", { method: "POST", body: JSON.stringify(data) }),
  getAllApplications: async () => api.fetch("/retreats/applications", { method: "GET" }),
  getMyRetreatApplications: async () => api.fetch("/retreats/my-applications", { method: "GET" }),
  updateApplicationStatus: async (applicationId: string, status: "APPROVED" | "REJECTED") => api.fetch(`/retreats/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // ---------------------------------------------------------------------------
  // BLOGS (CRUD Operations)
  // ---------------------------------------------------------------------------
  getBlogs: async () => api.fetch("/blogs", { method: "GET" }),
  createBlog: async (data: any) => api.fetch("/blogs", { method: "POST", body: JSON.stringify(data) }),
  updateBlog: async (id: string, data: any) => api.fetch(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getBlogBySlug: async (slug: string) => api.fetch(`/blogs/slug/${slug}`, { method: "GET" }),
  deleteBlog: async (id: string) => api.fetch(`/blogs/${id}`, { method: "DELETE" }),

  // ADMIN COUPON MANAGEMENT
  getAdminGroupRequests: async () => api.fetch("/payments/admin/group-requests", { method: "GET" }),
  approveGroupRequest: async (requestId: string, discountPercent: number) => api.fetch(`/payments/admin/group-requests/${requestId}/approve`, { method: "POST", body: JSON.stringify({ discountPercent }) }),
  deleteCoupon: async (couponId: string) => api.fetch(`/payments/admin/coupons/${couponId}`, { method: "DELETE" }),
};

