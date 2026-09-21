interface ProgressBarProps {
  done: number;
  total: number;
  label?: string;
}

export function ProgressBar({ done, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-sm font-medium text-violet-700">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div className="h-3 w-full overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-linear-to-r from-fuchsia-500 via-pink-400 to-orange-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
