import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import type { AssetStatus } from "@/lib/types";

interface IllustrationFrameProps {
  status: AssetStatus;
  imageUrl?: string;
  error?: string;
  alt: string;
  aspect?: "cover" | "page";
  onRetry: () => void;
  /** Rendered as a scrim anchored to the bottom of the image once it's ready — e.g. the page's story text, laid directly onto the illustration like a real picture-book page. */
  overlay?: ReactNode;
}

export function IllustrationFrame({ status, imageUrl, error, alt, aspect = "page", onRetry, overlay }: IllustrationFrameProps) {
  const aspectClass = aspect === "cover" ? "aspect-[2/3]" : "aspect-[4/5]";

  return (
    <div className={`relative w-full overflow-hidden bg-violet-900 ${aspectClass}`}>
      {status === "ready" && imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : null}

      {status === "ready" && overlay ? (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/50 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-8 sm:pt-24">
          {overlay}
        </div>
      ) : null}

      {status === "loading" || status === "idle" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-violet-800 to-fuchsia-900">
          <Spinner className="h-8 w-8" tone="white" />
          <span className="text-sm font-medium text-white/80">Painting the illustration&hellip;</span>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rose-50 p-4 text-center">
          <span className="text-2xl" aria-hidden>
            🖌️
          </span>
          <p className="text-xs font-medium text-rose-600">{error || "Couldn't create this illustration."}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm hover:bg-rose-100"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
