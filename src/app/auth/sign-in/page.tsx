import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const redirect = typeof query.redirect === "string" ? query.redirect : undefined;

  return (
    <div className="container-shell section-space">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <section className="rounded-[36px] border border-white/60 bg-[linear-gradient(145deg,rgba(245,226,218,0.86),rgba(255,255,255,0.9))] p-8 shadow-[0_28px_66px_rgba(42,29,24,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-ink-muted)]">
            Sign in
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-[-0.06em] text-[color:var(--color-ink)]">
            Step back into your bookings, favorites, and trust-first search.
          </h1>
          <p className="mt-4 text-sm leading-8 text-[color:var(--color-ink-muted)]">
            Use a seeded demo account or sign in with a locally created account. Everything runs without
            external auth providers in this preview build.
          </p>
        </section>
        <div className="space-y-4">
          <AuthForm mode="sign-in" redirectTo={redirect} />
          <p className="text-center text-sm text-[color:var(--color-ink-muted)]">
            Need an account?{" "}
            <Link href="/auth/sign-up" className="font-medium text-[color:var(--color-accent-strong)]">
              Create one here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
