"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/demo/inventory", label: "Demo" },
  { href: "/playground", label: "Playground" },
  { href: "/docs/mental-model", label: "Mental Model" },
];

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white text-xs">
            S
          </span>
          <span className="text-text-primary">symphony-state</span>
          <span className="text-text-muted text-xs">demo</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-surface-3 text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
