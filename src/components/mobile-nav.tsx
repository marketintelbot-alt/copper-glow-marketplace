"use client";

import Link from "next/link";
import { ArrowRightLeft, LogOut, Menu, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { signOutAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavItem[];
  accountHref: string;
  accountLabel: string;
  isAuthenticated: boolean;
  userFirstName?: string | null;
};

export function MobileNav({
  items,
  accountHref,
  accountLabel,
  isAuthenticated,
  userFirstName,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/80 text-[color:var(--color-ink)] shadow-[0_10px_22px_rgba(54,40,35,0.08)] md:hidden"
        aria-label="Toggle navigation"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(35,25,21,0.24)] backdrop-blur-sm transition md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "fixed inset-x-4 top-24 z-50 rounded-[28px] border border-white/70 bg-[rgba(250,244,238,0.95)] p-4 shadow-[0_24px_60px_rgba(46,34,30,0.2)] backdrop-blur-xl transition md:hidden",
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={accountHref}
            onClick={() => setOpen(false)}
            className="rounded-[22px] border border-[rgba(171,83,109,0.18)] bg-[linear-gradient(135deg,rgba(255,238,244,0.96),rgba(246,219,230,0.94))] px-4 py-3 text-sm font-semibold text-[color:var(--color-ink)] shadow-[0_16px_34px_rgba(171,83,109,0.12)]"
          >
            <span className="inline-flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              {accountLabel}
            </span>
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/auth/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-[color:var(--color-border)] bg-white/78 px-4 py-3 text-sm font-medium text-[color:var(--color-ink)] transition hover:bg-white"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Switch account
                </span>
              </Link>
              <form action={signOutAction} onSubmit={() => setOpen(false)}>
                <Button tone="secondary" type="submit" className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </form>
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-ink-muted)]">
                Signed in as {userFirstName ?? "member"}
              </p>
            </>
          ) : null}
        </nav>
      </div>
    </>
  );
}
