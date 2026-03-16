import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const reference = single(query.reference);

  return (
    <div className="container-shell section-space">
      <div className="mx-auto max-w-2xl rounded-[38px] border border-white/60 bg-white/92 px-6 py-16 text-center shadow-[0_28px_66px_rgba(42,29,24,0.08)]">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-[rgba(135,181,145,0.16)] text-[color:#2f6441]">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
          Booking confirmed
        </p>
        <h1 className="mt-4 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
          Your appointment is reserved.
        </h1>
        <p className="mt-4 text-sm leading-8 text-[color:var(--color-ink-muted)]">
          Reference {reference ?? "pending"} has been saved to your account. In this demo build, the
          confirmation email and payout workflow are mocked, but the booking, payment history, and
          management surfaces all update like a live marketplace.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account">
            <Button>Go to account</Button>
          </Link>
          <Link href="/browse">
            <Button tone="secondary">Keep browsing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
