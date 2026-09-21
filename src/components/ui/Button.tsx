import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-linear-to-r from-fuchsia-500 to-orange-400 text-white shadow-lg shadow-fuchsia-500/25 hover:brightness-105 active:brightness-95",
  secondary: "bg-white text-violet-700 border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50",
  ghost: "bg-transparent text-violet-700 hover:bg-violet-100",
  danger: "bg-white text-rose-600 border-2 border-rose-200 hover:bg-rose-50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-base rounded-2xl gap-2",
  lg: "px-7 py-3.5 text-lg rounded-2xl gap-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", icon, loading, disabled, className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-display font-semibold tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
