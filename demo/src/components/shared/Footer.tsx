import Link from "next/link";

import { Wordmark } from "@/components/shared/Wordmark";

export const Footer = () => (
  <footer className="border-t border-border bg-paper py-10">
    <div className="mx-auto grid max-w-[100rem] gap-8 px-6 text-sm text-text-muted md:grid-cols-12 md:px-10 lg:px-14 2xl:px-20">
      <div className="md:col-span-5">
        <Wordmark className="text-xl" />
        <p className="mt-2 max-w-sm leading-6">
          A small studio in Hamburg that publishes its tools as open source.
        </p>
      </div>
      <p className="font-mono text-xs md:col-span-3 md:col-start-7">
        <a href="https://github.com/shiftbloom-studio/symphony-state" className="brand-link">
          symphony-state
        </a>{" "}
        · AGPL-3.0-or-later
      </p>
      <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 md:col-span-3 md:justify-end">
        <Link href="/imprint" className="brand-link">Imprint</Link>
        <Link href="/privacy" className="brand-link">Privacy</Link>
        <Link href="/impressum" className="brand-link" lang="de">Impressum</Link>
        <Link href="/datenschutz" className="brand-link" lang="de">Datenschutz</Link>
      </nav>
    </div>
  </footer>
);
