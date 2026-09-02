"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/demo/inventory", label: "Demo" },
  { href: "/playground", label: "Playground" },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-6 md:px-10 lg:px-14"
        aria-label="Primary navigation"
      >
        <Link href="/" className="flex min-w-0 items-baseline gap-3" aria-label="Symphony State home">
          <span className="brand-display whitespace-nowrap text-lg font-semibold tracking-[-0.035em] text-ink">
            shiftbloom studio<span className="text-bloom-red">.</span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted sm:inline">
            / symphony state
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`brand-label relative py-2 transition-colors ${
                  active ? "text-root-red" : "text-text-secondary hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                {active ? (
                  <span className="absolute -bottom-[13px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-bloom-red" />
                ) : null}
              </Link>
            );
          })}
          <a
            href="https://github.com/shiftbloom-studio/symphony-state"
            className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-root-red md:inline"
          >
            GitHub ↗
          </a>
        </div>
      </nav>
    </header>
  );
};
