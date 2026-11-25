"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Wordmark } from "@/components/shared/Wordmark";

const links = [
  { href: "/demo/inventory", label: "Demo" },
  { href: "/playground", label: "Playground" },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 px-6 md:px-10 lg:px-14 2xl:px-20"
        aria-label="Primary navigation"
      >
        <Link href="/" className="flex min-w-0 items-baseline gap-3" aria-label="Symphony State home">
          <Wordmark className="text-base sm:text-lg" />
          <span className="hidden font-mono text-xs text-text-muted sm:inline">/ symphony-state</span>
        </Link>

        <div className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm font-medium sm:gap-6">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 transition-colors ${
                  active ? "text-root-red" : "text-text-secondary hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-[9px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-bloom-red" />
                ) : null}
              </Link>
            );
          })}
          <a
            href="https://github.com/shiftbloom-studio/symphony-state"
            className="py-2 text-text-secondary transition-colors hover:text-root-red"
          >
            GitHub<span className="hidden sm:inline"> ↗</span>
          </a>
        </div>
      </nav>
    </header>
  );
};
