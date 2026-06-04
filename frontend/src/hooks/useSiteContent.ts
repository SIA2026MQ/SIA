import { useEffect, useMemo, useState } from "react";
import {
  loadManagedBlogs,
  loadManagedCourses,
  loadManagedRetreats,
  loadManagedWebinars,
  type ManagedBlog,
  type ManagedCourse,
  type ManagedRetreat,
  type ManagedWebinar,
} from "@/utils/contentStore";
import { blogPosts, courses, webinars } from "@/utils/constants";

export function useSiteContent() {
  const [managedCourses, setManagedCourses] = useState<ManagedCourse[]>([]);
  const [managedBlogs, setManagedBlogs] = useState<ManagedBlog[]>([]);
  const [managedWebinars, setManagedWebinars] = useState<ManagedWebinar[]>([]);
  const [managedRetreats, setManagedRetreats] = useState<ManagedRetreat[]>([]);

  useEffect(() => {
    const sync = () => {
      setManagedCourses(loadManagedCourses());
      setManagedBlogs(loadManagedBlogs());
      setManagedWebinars(loadManagedWebinars());
      setManagedRetreats(loadManagedRetreats());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("sia-content-updated", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("sia-content-updated", sync as EventListener);
    };
  }, []);

  return useMemo(
    () => ({
      courses: [...courses, ...managedCourses],
      blogs: [...blogPosts, ...managedBlogs],
      webinars: [...webinars, ...managedWebinars],
      retreats: managedRetreats,
    }),
    [managedBlogs, managedCourses, managedRetreats, managedWebinars],
  );
}
