import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, Disc, Drum, Guitar, Phone, Piano, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/AppShell";
import { CATEGORIES, type Category } from "@/components/PhoneFrame";
import { prettyDate, toISODate } from "@/lib/calendar";
import { findFreeArtists, type FreeArtist } from "@/lib/free-artists";

const categoryIcons: Record<string, React.ElementType> = {
  Keyboard: Piano,
  Tabla: Drum,
  Octapad: Disc,
  Banjo: Guitar,
};

/** Find Artist — Step 1: category, Step 2: start/end date, Step 3: available artists. */
export function AvailabilitySearch() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [query, setQuery] = useState<{ from: string; to: string; category: string } | null>(null);

  const { data: results = [], isLoading } = useQuery<FreeArtist[]>({
    queryKey: ["find-artists", query?.from, query?.to, query?.category],
    enabled: !!query,
    queryFn: () => findFreeArtists(supabase, query!),
  });

  const today = toISODate(new Date());

  function search() {
    if (!fromDate || !toDate) return;
    const from = fromDate <= toDate ? fromDate : toDate;
    const to = fromDate <= toDate ? toDate : fromDate;
    setQuery({ from, to, category });
    setStep(3);
  }

  if (step === 1) {
    return (
      <SectionCard title="Find Artist" subtitle="Step 1 — Category select karein">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = categoryIcons[c] ?? Search;
            const selected = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition ${
                  selected
                    ? "border-gold bg-surf3 text-maroon shadow-md-sv"
                    : "border-border bg-surface text-ink2"
                }`}
              >
                <Icon className="h-7 w-7" />
                <span className="text-sm font-bold">{c}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setStep(2)}
          className="bg-hero mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm"
        >
          Continue <ArrowRight className="h-5 w-5" />
        </button>
      </SectionCard>
    );
  }

  if (step === 2) {
    return (
      <SectionCard title="Find Artist" subtitle={`Step 2 — ${category} ke liye dates chunein`}>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink2">Start date</span>
          <input
            type="date"
            value={fromDate}
            min={today}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
          />
        </label>
        <label className="mt-4 block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink2">End date</span>
          <input
            type="date"
            value={toDate}
            min={fromDate || today}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex items-center justify-center gap-1 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-bold text-ink2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={search}
            disabled={!fromDate || !toDate}
            className="bg-hero flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm disabled:opacity-50"
          >
            <Search className="h-5 w-5" /> Show available artists
          </button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={`${query?.category} — available`}
      subtitle={query ? `${prettyDate(query.from)} se ${prettyDate(query.to)} tak free artists` : ""}
    >
      <button
        onClick={() => setStep(2)}
        className="mb-4 flex items-center gap-1 text-xs font-bold text-maroon"
      >
        <ChevronLeft className="h-4 w-4" /> Dates badlein
      </button>

      {isLoading ? (
        <p className="text-sm text-ink3">Loading…</p>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surf2 p-6 text-center">
          <Search className="mx-auto mb-2 h-5 w-5 text-ink3" />
          <p className="text-sm text-ink2">In dates par koi {query?.category} artist available nahi hai.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {results.map((artist) => (
            <li key={artist.id} className="rounded-xl border border-border bg-surf2 p-4">
              <p className="font-semibold text-maroon">{artist.full_name || "Artist"}</p>
              <p className="mt-0.5 text-xs text-ink3">{artist.category}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {artist.dates.slice(0, 6).map((d) => (
                  <span key={d} className="chip-sv text-[11px]">
                    {prettyDate(d)}
                  </span>
                ))}
                {artist.dates.length > 6 && (
                  <span className="text-[11px] text-ink3">+{artist.dates.length - 6} more</span>
                )}
              </div>
              {artist.phone ? (
                <a
                  href={`tel:${artist.phone}`}
                  className="bg-hero mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-warm"
                >
                  <Phone className="h-4 w-4" /> {artist.phone}
                </a>
              ) : (
                <p className="mt-3 text-xs text-ink3">Contact number available nahi hai.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
