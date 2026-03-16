import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

export function Button({
  className,
  tone = "primary",
  size = "md",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium tracking-[0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        tone === "primary" &&
          "border border-[rgba(171,83,109,0.2)] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-strong))] px-5 text-white shadow-[0_18px_34px_rgba(171,83,109,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(171,83,109,0.32)]",
        tone === "secondary" &&
          "border border-[color:var(--color-border-strong)] bg-white/84 px-5 text-[color:var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 hover:border-[color:var(--color-accent-strong)] hover:bg-white",
        tone === "ghost" &&
          "px-4 text-[color:var(--color-ink-muted)] hover:bg-white/80 hover:text-[color:var(--color-ink)]",
        tone === "soft" &&
          "bg-[rgba(171,83,109,0.11)] px-4 text-[color:var(--color-ink)] hover:bg-[rgba(171,83,109,0.16)]",
        size === "sm" && "h-10 text-sm",
        size === "md" && "h-11 text-sm",
        size === "lg" && "h-13 px-6 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
