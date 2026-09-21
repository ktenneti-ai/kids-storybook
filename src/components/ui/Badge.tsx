import type { ReactNode } from "react";

export function Badge({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "amber" | "green" }) {
  const toneClasses = {
    violet: "bg-violet-100 text-violet-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-700",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}>{children}</span>;
}
