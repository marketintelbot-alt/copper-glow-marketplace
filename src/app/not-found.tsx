import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-shell section-space">
      <div className="mx-auto max-w-2xl rounded-[36px] border border-white/60 bg-white/90 px-6 py-16 text-center shadow-[0_30px_70px_rgba(42,29,24,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
          Not found
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
          This page stepped out of the booking flow.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--color-ink-muted)]">
          Try browsing providers, heading back home, or checking your account dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button tone="secondary">Go home</Button>
          </Link>
          <Link href="/browse">
            <Button>Browse providers</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
