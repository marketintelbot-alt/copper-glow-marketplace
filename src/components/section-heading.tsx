import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "light";
};

export function SectionHeading({ eyebrow, title, description, align = "left", tone = "default" }: Props) {
  return (
    <div className={cn("space-y-4", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}>
      <p
        className={cn(
          "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] shadow-[0_12px_26px_rgba(102,54,72,0.08)]",
          tone === "light"
            ? "border-white/10 bg-white/6 text-[rgba(255,243,247,0.74)]"
            : "border-white/65 bg-white/70 text-[color:var(--color-ink-muted)]"
        )}
      >
        <span
          className={cn(
            "inline-flex h-2.5 w-2.5 rounded-full",
            tone === "light"
              ? "bg-[color:var(--color-champagne)] shadow-[0_0_0_4px_rgba(221,181,139,0.14)]"
              : "bg-[color:var(--color-accent-strong)] shadow-[0_0_0_4px_rgba(171,83,109,0.14)]"
          )}
        />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display text-3xl leading-[0.98] tracking-[-0.06em] sm:text-5xl",
          tone === "light" ? "text-[rgba(255,243,247,0.94)]" : "text-[color:var(--color-ink)]"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-[42rem] text-sm leading-8 sm:text-base",
            tone === "light" ? "text-[rgba(255,243,247,0.72)]" : "text-[color:var(--color-ink-muted)]"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
