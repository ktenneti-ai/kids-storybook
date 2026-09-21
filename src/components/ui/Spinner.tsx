interface SpinnerProps {
  className?: string;
  tone?: "violet" | "white";
}

const TONE_CLASSES: Record<NonNullable<SpinnerProps["tone"]>, string> = {
  violet: "border-violet-300 border-t-fuchsia-500",
  white: "border-white/30 border-t-white",
};

export function Spinner({ className = "h-6 w-6", tone = "violet" }: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-[3px] ${TONE_CLASSES[tone]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
