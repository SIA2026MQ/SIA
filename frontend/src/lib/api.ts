import { auth } from "./firebase";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

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
      if (response.status === 403) {
        await auth.signOut();
        throw new Error("Account Suspended");
      }
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  },

  // ---------------------------------------------------------------------------
  // USER & AUTH
  // ---------------------------------------------------------------------------
  getMe: async () => api.fetch("/auth/me", { method: "GET" }),
  getUserSubscription: async () => api.fetch("/auth/subscription", { method: "GET" }),

  // 🚨 NEW: Notifications
  getEventNotifications: async () => api.fetch(`/auth/notifications?_t=${Date.now()}`, { method: "GET" }),
  markEventCategoryAsRead: async (category: string) => api.fetch("/auth/notifications/read", { method: "POST", body: JSON.stringify({ category }) }),

  // ---------------------------------------------------------------------------
  // COURSES
  // ---------------------------------------------------------------------------
  getAllCourses: async () => api.fetch("/courses", { method: "GET" }),
  getCourseById: async (courseId: string) => api.fetch(`/courses/${courseId}`, { method: "GET" }),
  createCourse: async (data: any) => api.fetch("/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: async (courseId: string, data: any) => api.fetch(`/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCourse: async (courseId: string) => api.fetch(`/courses/${courseId}`, { method: "DELETE" }),
  addVideoToCourse: async (courseId: string, data: any) => api.fetch(`/courses/${courseId}/videos`, { method: "POST", body: JSON.stringify(data) }),
  getMyEnrolledCourses: async () => api.fetch("/courses/enrolled/me", { method: "GET" }),
  deleteCourseVideo: async (courseId: string, videoId: string) =>
    api.fetch(`/courses/${courseId}/videos/${videoId}`, { method: "DELETE" }),

  requestVideoUploadUrl: async (payload: { fileName: string; contentType: string; courseId: string }) =>
    api.fetch("/courses/upload-url", { method: "POST", body: JSON.stringify(payload) }),
  initMultipartUpload: async (payload: { fileName: string; contentType: string; courseId: string }) =>
    api.fetch("/courses/multipart/init", { method: "POST", body: JSON.stringify(payload) }),
  getMultipartUrls: async (payload: { r2ObjectKey: string; uploadId: string; partsCount: number }) =>
    api.fetch("/courses/multipart/urls", { method: "POST", body: JSON.stringify(payload) }),
  completeMultipartUpload: async (payload: { r2ObjectKey: string; uploadId: string; parts: { ETag: string, PartNumber: number }[] }) =>
    api.fetch("/courses/multipart/complete", { method: "POST", body: JSON.stringify(payload) }),

  markVideoProgress: async (courseId: string, videoId: string) =>
    api.fetch(`/courses/${courseId}/videos/${videoId}/progress`, { method: "POST" }),

  // ---------------------------------------------------------------------------
  // PAYMENTS & COUPONS
  // ---------------------------------------------------------------------------
  checkoutCart: async (items: any[]) => api.fetch("/payments/checkout-cart", { method: "POST", body: JSON.stringify({ items }) }),

  createUnifiedOrder: async (data: { itemId: string; itemType: string; customAmountInr?: number; couponId?: string | null }) =>
    api.fetch("/payments/create-order", { method: "POST", body: JSON.stringify(data) }),

  verifyUnifiedPayment: async (paymentData: any) => api.fetch("/payments/verify", { method: "POST", body: JSON.stringify(paymentData) }),
  submitGroupRequest: async (data: { memberCount: number; emails: string[] }) => api.fetch("/payments/group-request", { method: "POST", body: JSON.stringify(data) }),
  validateCoupon: async (code: string, email?: string) =>
    api.fetch("/payments/validate-coupon", { method: "POST", body: JSON.stringify({ code, email }) }),

  createCourseCoupon: async (data: any) => api.fetch("/payments/admin/course-coupons", { method: "POST", body: JSON.stringify(data) }),
  getCourseCoupons: async () => api.fetch("/payments/admin/course-coupons", { method: "GET" }),

  // ---------------------------------------------------------------------------
  // SESSIONS, PLANS & SCHEDULES
  // ---------------------------------------------------------------------------
  getAllPlans: async () => api.fetch("/sessions/plans", { method: "GET" }),
  createPlan: async (data: any) => api.fetch("/sessions/plans", { method: "POST", body: JSON.stringify(data) }),
  updatePlan: async (id: string, data: any) => api.fetch(`/sessions/plans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePlan: async (id: string) => api.fetch(`/sessions/plans/${id}`, { method: "DELETE" }),

  getTodaySession: async () => api.fetch("/sessions/today", { method: "GET" }),
  getSessionHistory: async () => api.fetch("/sessions/history", { method: "GET" }),
  createDailySession: async (data: { title: string; zoomLink: string; time: string; sessionType: string; isActive: boolean }) =>
    api.fetch("/sessions/today", { method: "POST", body: JSON.stringify(data) }),
  updateDailySession: async (id: string, data: { title: string; zoomLink: string; time: string; sessionType: string; isActive: boolean }) =>
    api.fetch(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDailySession: async (id: string) => api.fetch(`/sessions/${id}`, { method: "DELETE" }),
  logSessionAttendance: async (sessionId: string) => api.fetch(`/sessions/${sessionId}/attend`, { method: "POST" }),
  toggleDailySession: async (id: string, isActive: boolean) =>
    api.fetch(`/sessions/${id}/toggle`, { method: "PATCH", body: JSON.stringify({ isActive }) }),

  getSchedules: async () => api.fetch("/sessions/schedules", { method: "GET" }),
  createSchedule: async (data: any) => api.fetch("/sessions/schedules", { method: "POST", body: JSON.stringify(data) }),
  updateSchedule: async (id: string, data: any) => api.fetch(`/sessions/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSchedule: async (id: string) => api.fetch(`/sessions/schedules/${id}`, { method: "DELETE" }),

  // ---------------------------------------------------------------------------
  // WEBINARS
  // ---------------------------------------------------------------------------
  getWebinars: async () => api.fetch("/webinars", { method: "GET" }),
  getUpcomingWebinars: async () => api.fetch("/webinars", { method: "GET" }),
  createWebinar: async (data: any) => api.fetch("/webinars", { method: "POST", body: JSON.stringify(data) }),
  updateWebinar: async (id: string, data: any) => api.fetch(`/webinars/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWebinar: async (id: string) => api.fetch(`/webinars/${id}`, { method: "DELETE" }),
  redeemWebinarCredit: async (webinarId: string) => api.fetch("/webinars/redeem", { method: "POST", body: JSON.stringify({ webinarId }) }),
  logWebinarAttendance: async (webinarId: string) =>
    api.fetch(`/webinars/${webinarId}/attend`, { method: "POST" }),

  // ---------------------------------------------------------------------------
  // RETREATS
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
  // BLOGS
  // ---------------------------------------------------------------------------
  getBlogs: async () => api.fetch("/blogs", { method: "GET" }),
  createBlog: async (data: any) => api.fetch("/blogs", { method: "POST", body: JSON.stringify(data) }),
  updateBlog: async (id: string, data: any) => api.fetch(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getBlogBySlug: async (slug: string) => api.fetch(`/blogs/slug/${slug}`, { method: "GET" }),
  deleteBlog: async (id: string) => api.fetch(`/blogs/${id}`, { method: "DELETE" }),

  // ---------------------------------------------------------------------------
  // ADMIN UTILS & CRM
  // ---------------------------------------------------------------------------
  getAdminGroupRequests: async () => api.fetch("/payments/admin/group-requests", { method: "GET" }),
  approveGroupRequest: async (requestId: string, discountPercent: number) => api.fetch(`/payments/admin/group-requests/${requestId}/approve`, { method: "POST", body: JSON.stringify({ discountPercent }) }),
  deleteCoupon: async (couponId: string) => api.fetch(`/payments/admin/coupons/${couponId}`, { method: "DELETE" }),
  getAdminStats: async () => api.fetch("/admin/stats", { method: "GET" }),
  getAdminUsers: async (page: number, search: string = "") => api.fetch(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`, { method: "GET" }),
  updateUserLevel: async (userId: string, level: number) => api.fetch(`/admin/users/${userId}/level`, { method: "PUT", body: JSON.stringify({ level }) }),
  toggleUserBlock: async (userId: string, isBlocked: boolean) => api.fetch(`/admin/users/${userId}/block`, { method: "PUT", body: JSON.stringify({ isBlocked }) }),

  // 🚨 NEW: Legacy Course Migrations
  getPendingMigrations: async () => api.fetch("/admin/migrations/pending", { method: "GET" }),
  grantMigrationAccess: async (data: { userId: string; email: string }) =>
    api.fetch("/admin/migrations/grant", { method: "POST", body: JSON.stringify(data) }),
};