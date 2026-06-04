import { type ReactNode } from "react";

export const ADMIN_LABEL_CLASS = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";
export const ADMIN_INPUT_CLASS = "h-12 w-full rounded-full border border-border bg-input px-4 text-foreground placeholder:text-muted-foreground";
export const ADMIN_TEXTAREA_CLASS = "min-h-32 w-full rounded-3xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground";

export function AdminFormField({ label, className, children }: { label: string; className?: string; children: ReactNode; }) {
  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <span className={ADMIN_LABEL_CLASS}>{label}</span>
      {children}
    </label>
  );
}

export async function fileToDataUrl(file: File | null) {
  if (!file) return "";
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function makeFallbackImage(label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='64' viewBox='0 0 96 64'><rect width='96' height='64' fill='hsl(309 12% 92%)'/><text x='48' y='36' text-anchor='middle' font-family='serif' font-size='12' fill='hsl(310 20% 34%)'>${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}