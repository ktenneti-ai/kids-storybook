import type { ReactNode } from "react";

interface ErrorBannerProps {
  message: string;
  children?: ReactNode;
}

export function ErrorBanner({ message, children }: ErrorBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none" aria-hidden>
          ⚠️
        </span>
        <p className="text-sm font-medium">{message}</p>
      </div>
      {children ? <div className="flex shrink-0 gap-2">{children}</div> : null}
    </div>
  );
}
