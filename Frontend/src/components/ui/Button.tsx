import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={clsx(
        "inline-flex h-9 items-center justify-center rounded-md px-4 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700",
        variant === "secondary" && "border border-[#e4d6c2] bg-white text-brand-700 hover:bg-[#fbf7f0]",
        variant === "danger" && "border border-[#f0d1d1] bg-white text-[#d45d5d] hover:bg-[#fff5f5]",
        className
      )}
      {...props}
    />
  );
}
