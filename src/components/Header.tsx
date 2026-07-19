import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/curriculum", label: "Curriculum" },
  { to: "/admissions", label: "Admissions" },
  { to: "/donate", label: "Donate" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-paper/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-saffron to-saffron-deep text-paper font-display text-lg shadow-[0_0_0_3px_var(--paper),0_0_0_4px_var(--gold)]">
            ॐ
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base sm:text-lg text-maroon leading-tight">
              Shantibrahma Gurukulam
            </span>
            <span className="block text-[10px] tracking-[0.24em] uppercase text-ink-soft">
              Varkari Shikshan Sanstha
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm font-medium text-ink-soft hover:text-saffron-deep rounded-md transition-colors"
                activeProps={{ className: "text-maroon" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/donate"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gold text-maroon text-sm font-semibold hover:bg-gold-light transition-all hover:-translate-y-0.5"
          >
            Donate
          </Link>
          <Link
            to="/admissions"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-br from-saffron to-saffron-deep shadow-[0_6px_16px_-4px_var(--saffron)] hover:-translate-y-0.5 transition-all"
          >
            Admissions →
          </Link>

          <button
            className="lg:hidden ml-1 p-2 -mr-2"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="block w-6 h-0.5 bg-maroon mb-1.5" />
            <span className="block w-6 h-0.5 bg-maroon mb-1.5" />
            <span className="block w-6 h-0.5 bg-maroon" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-ink border-b border-border/60 last:border-0"
                activeProps={{ className: "text-maroon" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
