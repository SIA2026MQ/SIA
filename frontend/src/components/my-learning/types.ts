export type Tab = "dashboard" | "practices" | "scriptures" | "webinars";

export interface EnrolledCourse {
  id: string;
  title: string;
  imageUrl?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  category: "practices" | "scriptures";
}