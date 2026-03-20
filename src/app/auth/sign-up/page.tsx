import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <div className="container-shell section-space">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <section className="rounded-[36px] border border-white/60 bg-[linear-gradient(145deg,rgba(245,226,218,0.86),rgba(255,255,255,0.9))] p-8 shadow-[0_28px_66px_rgba(42,29,24,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
            Create account
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
            Save your favorites, manage bookings, and leave verified reviews.
          </h1>
          <p className="mt-4 text-sm leading-8 text-[color:var(--color-ink-muted)]">
            This local auth flow stores demo-friendly accounts directly in the database so the marketplace
            can be previewed end-to-end without third-party credentials.
          </p>
        </section>
        <div className="space-y-4">
          <AuthForm mode="sign-up" />
          <p className="text-center text-sm text-[color:var(--color-ink-muted)]">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-[color:var(--color-accent-strong)]">
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
