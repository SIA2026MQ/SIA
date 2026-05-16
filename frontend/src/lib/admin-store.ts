// Centralised CRUD store for courses, events, blog posts and coupons.
// Backed by localStorage so admin edits persist across navigations.
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  COURSES as SEED_COURSES,
  EVENTS as SEED_EVENTS,
  BLOG_POSTS as SEED_BLOGS,
  type SIACourse,
  type SIAEvent,
  type BlogPost,
} from "./sia-data";
import { readLS, writeLS } from "./storage";

export interface Coupon {
  code: string;
  /** percent off, 0-100 */
  percent: number;
  active: boolean;
  description?: string;
}

const SEED_COUPONS: Coupon[] = [
  { code: "AWAKEN10", percent: 10, active: true, description: "Welcome — 10% off any course" },
  { code: "PATHLESS25", percent: 25, active: true, description: "Limited — 25% off all retreats" },
  { code: "SATSANG50", percent: 50, active: false, description: "Half off — past members only" },
];

const KEYS = {
  courses: "sia:courses",
  events: "sia:events",
  blogs: "sia:blogs",
  coupons: "sia:coupons",
} as const;

type StoreKey = keyof typeof KEYS;

const seeds = {
  courses: SEED_COURSES,
  events: SEED_EVENTS,
  blogs: SEED_BLOGS,
  coupons: SEED_COUPONS,
} as const;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

// --- NEW IN-MEMORY CACHE ---
const cache: Partial<Record<StoreKey, any>> = {};

function get<T>(key: StoreKey): T {
  // Read from cache first to guarantee stable object references
  if (cache[key] === undefined) {
    cache[key] = readLS(KEYS[key], seeds[key] as unknown);
  }
  return cache[key] as T;
}

function set<T>(key: StoreKey, value: T) {
  cache[key] = value; // Update the cache
  writeLS(KEYS[key], value); // Persist to LocalStorage
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useCourses() {
  return useSyncExternalStore(
    subscribe,
    () => get<SIACourse[]>("courses"),
    () => SEED_COURSES,
  );
}
export function useEvents() {
  return useSyncExternalStore(
    subscribe,
    () => get<SIAEvent[]>("events"),
    () => SEED_EVENTS,
  );
}
export function useBlogs() {
  return useSyncExternalStore(
    subscribe,
    () => get<BlogPost[]>("blogs"),
    () => SEED_BLOGS,
  );
}
export function useCoupons() {
  return useSyncExternalStore(
    subscribe,
    () => get<Coupon[]>("coupons"),
    () => SEED_COUPONS,
  );
}

// Mutators
export const adminApi = {
  saveCourse(c: SIACourse) {
    const list = [...get<SIACourse[]>("courses")];
    const i = list.findIndex((x) => x.id === c.id);
    if (i >= 0) list[i] = c;
    else list.unshift(c);
    set("courses", list);
  },
  deleteCourse(id: string) {
    set(
      "courses",
      get<SIACourse[]>("courses").filter((c) => c.id !== id),
    );
  },
  saveEvent(e: SIAEvent) {
    const list = [...get<SIAEvent[]>("events")];
    const i = list.findIndex((x) => x.id === e.id);
    if (i >= 0) list[i] = e;
    else list.unshift(e);
    set("events", list);
  },
  deleteEvent(id: string) {
    set(
      "events",
      get<SIAEvent[]>("events").filter((e) => e.id !== id),
    );
  },
  saveBlog(b: BlogPost) {
    const list = [...get<BlogPost[]>("blogs")];
    const i = list.findIndex((x) => x.slug === b.slug);
    if (i >= 0) list[i] = b;
    else list.unshift(b);
    set("blogs", list);
  },
  deleteBlog(slug: string) {
    set(
      "blogs",
      get<BlogPost[]>("blogs").filter((b) => b.slug !== slug),
    );
  },
  saveCoupon(c: Coupon) {
    const list = [...get<Coupon[]>("coupons")];
    const i = list.findIndex((x) => x.code.toLowerCase() === c.code.toLowerCase());
    if (i >= 0) list[i] = c;
    else list.unshift(c);
    set("coupons", list);
  },
  deleteCoupon(code: string) {
    set(
      "coupons",
      get<Coupon[]>("coupons").filter((c) => c.code !== code),
    );
  },
  validateCoupon(code: string): Coupon | null {
    const list = get<Coupon[]>("coupons");
    return (
      list.find((c) => c.active && c.code.toLowerCase() === code.trim().toLowerCase()) ?? null
    );
  },
  resetAll() {
    Object.keys(KEYS).forEach((k) => {
      const key = k as StoreKey;
      cache[key] = seeds[key]; // Reset cache in memory
      writeLS(KEYS[key], seeds[key]); // Reset local storage
    });
    notify();
  },
};

// Helper: parse "$129", "Free", "FREE", "$1,840" → number
export function priceToNumber(price: string): number {
  if (!price) return 0;
  if (/free/i.test(price)) return 0;
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

export function formatPrice(n: number): string {
  if (n <= 0) return "Free";
  return `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}

// SSR-safe hydration flag
export function useIsHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}