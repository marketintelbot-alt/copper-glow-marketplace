import Link from "next/link";
import { ArrowRightLeft, LogOut, UserCircle2 } from "lucide-react";
import { signOutAction } from "@/actions";
import { BrandMark } from "@/components/brand-mark";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNav, HeaderChrome } from "@/components/site-header-client";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

type Props = {
  accountLabel: string;
  accountHref: string;
  isAuthenticated: boolean;
  userFirstName?: string | null;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/trust", label: "How It Works" },
  { href: "/providers/apply", label: "For Providers" },
];

export function SiteHeader({ accountHref, accountLabel, isAuthenticated, userFirstName }: Props) {
  return (
    <header className="sticky top-3 z-30 px-3">
      <HeaderChrome>
        <div className="flex items-center gap-4">
          <BrandMark />
          <span className="hidden rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] xl:inline-flex">
            {siteConfig.launchMarket.shortName} launch
          </span>
        </div>
        <DesktopNav items={navItems} />
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={accountHref}
              className="inline-flex items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-white/86 px-4 py-2 text-sm font-medium text-[color:var(--color-ink)] shadow-[0_12px_24px_rgba(42,30,25,0.08)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)]"
            >
              <UserCircle2 className="h-4 w-4" />
              <span>{accountLabel}</span>
              {isAuthenticated && userFirstName ? (
                <span className="rounded-full bg-[rgba(171,83,109,0.1)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
                  {userFirstName}
                </span>
              ) : null}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white/80 px-4 py-2 text-sm font-medium text-[color:var(--color-ink-muted)] shadow-[0_10px_22px_rgba(42,30,25,0.05)] transition hover:-translate-y-0.5 hover:bg-white hover:text-[color:var(--color-ink)]"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Switch account
                </Link>
                <form action={signOutAction}>
                  <Button tone="secondary" size="sm" type="submit" className="gap-2 px-4">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </form>
              </>
            ) : null}
          </div>
          <Link href="/browse" className="hidden md:block">
            <Button size="sm" className="min-w-[152px]">
              {siteConfig.ctaBrowse}
            </Button>
          </Link>
          <MobileNav
            items={navItems}
            accountHref={accountHref}
            accountLabel={accountLabel}
            isAuthenticated={isAuthenticated}
            userFirstName={userFirstName}
          />
        </div>
      </HeaderChrome>
    </header>
  );
}
