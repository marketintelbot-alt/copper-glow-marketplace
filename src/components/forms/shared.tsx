"use client";

import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
        {children}
      </span>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-[20px] border border-[color:var(--color-border)] bg-white/90 px-4 text-sm text-[color:var(--color-ink)] outline-none transition placeholder:text-[color:var(--color-ink-subtle)] focus:border-[color:var(--color-accent-strong)]",
        props.className
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-[22px] border border-[color:var(--color-border)] bg-white/90 px-4 py-3 text-sm text-[color:var(--color-ink)] outline-none transition placeholder:text-[color:var(--color-ink-subtle)] focus:border-[color:var(--color-accent-strong)]",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-12 w-full rounded-[20px] border border-[color:var(--color-border)] bg-white/90 px-4 text-sm text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-accent-strong)]",
        props.className
      )}
    />
  );
}

export function ActionMessage({
  status,
  message,
}: {
  status?: "success" | "error" | "idle";
  message?: string;
}) {
  if (!message || status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-[18px] px-4 py-3 text-sm",
        status === "error"
          ? "border border-[rgba(165,73,73,0.22)] bg-[rgba(249,230,230,0.88)] text-[color:#7d3c3c]"
          : "border border-[rgba(104,145,112,0.22)] bg-[rgba(231,245,234,0.92)] text-[color:#2f6441]"
      )}
    >
      {message}
    </div>
  );
}
