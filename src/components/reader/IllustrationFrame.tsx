import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import type { AssetStatus } from "@/lib/types";

interface IllustrationFrameProps {
  status: AssetStatus;
  imageUrl?: string;
  error?: string;
  alt: string;
  aspect?: "portrait" | "square";
  onRegenerate: () => void;
  regenerateLabel: string;
  /** Rendered as a scrim anchored to the bottom of the image once it's ready — e.g. the page's story text, laid directly onto the illustration like a real picture-book page. */
  overlay?: ReactNode;
}

export function IllustrationFrame({ status, imageUrl, error, alt, aspect = "square", onRegenerate, regenerateLabel, overlay }: IllustrationFrameProps) {
  const aspectClass = aspect === "portrait" ? "aspect-[2/3]" : "aspect-square";

  return (
    <div className={`group relative w-full overflow-hidden rounded-2xl bg-violet-100 ${aspectClass}`}>
      {status === "ready" && imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : null}

      {status === "ready" && overlay ? (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/45 to-transparent px-4 pb-4 pt-12 sm:px-6 sm:pb-6 sm:pt-16">
          {overlay}
        </div>
      ) : null}

      {status === "loading" || status === "idle" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-violet-100 to-fuchsia-100">
          <Spinner />
          <span className="text-xs font-medium text-violet-500">Painting the illustration&hellip;</span>
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
            onClick={onRegenerate}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600 shadow-sm hover:bg-rose-100"
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === "ready" ? (
        <button
          type="button"
          onClick={onRegenerate}
          className="absolute top-2 right-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus:opacity-100"
        >
          🔄 {regenerateLabel}
        </button>
      ) : null}
    </div>
  );
}
