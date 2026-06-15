export type CourseLesson = {
  title: string;
  videoDataUrl?: string;
  videoName?: string;
};

export type ManagedCourse = {
  id: string;
  category: "Practices" | "Scriptures";
  title: string;
  description: string;
  priceINR: number; // Price set by admin for Indian users
  priceUSD: number;
  duration: string;
  lessons: number;
  lessonTitles?: string[];
  lessonItems?: CourseLesson[];
  rating: number;
  imageUrl?: string;
  imageDataUrl?: string;
};

export type ManagedWebinar = {
  id: string;
  title: string;
  date: string;
  description: string;
  link?: string;
  price?: string;
  imageUrl?: string;
  imageDataUrl?: string;
};

export type ManagedRetreat = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  price: string;
  imageUrl?: string;
  imageDataUrl?: string;
};

export type ManagedBlog = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  body: string[];
  imageUrl?: string;
  imageDataUrl?: string;
};

export type Coupon = {
  code: string;
  discount: number;
  type: "percent" | "fixed";
};

export type RetreatInquiry = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  preferredRetreat: string;
  message: string;
  createdAt: string;
};

const KEYS = {
  courses: "sia-managed-courses",
  webinars: "sia-managed-webinars",
  retreats: "sia-managed-retreats",
  blogs: "sia-managed-blogs",
  coupons: "sia-managed-coupons",
  retreatInquiries: "sia-retreat-inquiries",
} as const;

function loadArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function saveArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadManagedCourses() {
  return loadArray<ManagedCourse>(KEYS.courses);
}

export function saveManagedCourses(value: ManagedCourse[]) {
  saveArray(KEYS.courses, value);
}

export function loadManagedWebinars() {
  return loadArray<ManagedWebinar>(KEYS.webinars);
}

export function saveManagedWebinars(value: ManagedWebinar[]) {
  saveArray(KEYS.webinars, value);
}

export function loadManagedBlogs() {
  return loadArray<ManagedBlog>(KEYS.blogs);
}

export function saveManagedBlogs(value: ManagedBlog[]) {
  saveArray(KEYS.blogs, value);
}

export function loadCoupons() {
  const saved = loadArray<Coupon>(KEYS.coupons);
  return [{ code: "WELCOME10", discount: 10, type: "percent" as const }, ...saved];
}

export function saveCoupons(value: Coupon[]) {
  saveArray(KEYS.coupons, value);
}

export function loadRetreatInquiries() {
  return loadArray<RetreatInquiry>(KEYS.retreatInquiries);
}

export function saveRetreatInquiries(value: RetreatInquiry[]) {
  saveArray(KEYS.retreatInquiries, value);
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function priceToNumber(price: string) {
  const numeric = Number(price.replace(/[^\d.]/g, ""));
  if (Number.isNaN(numeric)) return 0;
  return numeric;
}
