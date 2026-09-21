export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-[3px] border-violet-300 border-t-fuchsia-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
