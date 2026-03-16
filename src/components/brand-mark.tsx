import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
  tone?: "default" | "footer";
};

export function BrandMark({ className, compact = false, tone = "default" }: Props) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3 text-[color:var(--color-ink)]", className)}
    >
      <span
        className={cn(
          "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] border shadow-[0_16px_30px_rgba(127,67,91,0.16)]",
          tone === "footer"
            ? "border-white/14 bg-[linear-gradient(145deg,rgba(255,239,245,0.18),rgba(222,150,178,0.36),rgba(144,74,101,0.72))]"
            : "border-[rgba(171,83,109,0.14)] bg-[linear-gradient(145deg,#fff6fa_0%,#f4ccd9_52%,#d988a1_100%)]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0",
            tone === "footer"
              ? "bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_60%)]"
              : "bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_60%)]"
          )}
        />
        <span
          className={cn(
            "relative text-sm font-semibold tracking-[0.2em]",
            tone === "footer" ? "text-[rgba(255,245,248,0.96)]" : "text-[color:var(--color-ink)]"
          )}
        >
          CG
        </span>
      </span>
      <span className="flex flex-col">
        <span className="font-display text-[1.15rem] leading-none tracking-[-0.04em]">
          {siteConfig.name}
        </span>
        {!compact ? (
          <span className="mt-1 text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
            {siteConfig.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
