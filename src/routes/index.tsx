import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import {
  homeSlides,
  founder,
  features,
  stats,
  gallery,
  testimonials,
  faqs,
  org,
} from "@/data/site";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shantibrahma Gurukulam — Home" },
      {
        name: "description",
        content:
          "Vidya Dadati Vinayam — a residential Varkari gurukul carrying Haripath, Dnyaneshwari and modern academics forward together.",
      },
      { property: "og:title", content: "Shantibrahma Gurukulam — Home" },
      { property: "og:image", content: homeSlides[0].src },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        const dur = 1600;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

function HomePage() {
  useReveal();

  return (
    <>
      <HeroSlideshow slides={homeSlides}>
        <span className="inline-block text-[11px] tracking-[0.32em] uppercase text-gold-light border-b border-gold-light pb-1 mb-4">
          Est. {org.established} · Varkari Parampara
        </span>
        <h1 className="sanskrit text-5xl sm:text-6xl lg:text-7xl text-paper leading-[1.05] drop-shadow-lg">
          {org.taglineDev}
        </h1>
        <p className="mt-3 text-2xl sm:text-3xl font-display text-gold-light italic">
          {org.tagline}
        </p>
        <p className="mt-3 max-w-lg text-sm sm:text-base text-paper/85">
          Knowledge bestows humility. A residential gurukul where Haripath, Dnyaneshwari and
          modern school education shape every child together.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/admissions"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-saffron to-saffron-deep text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-transform"
          >
            Admissions →
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-light text-gold-light font-semibold hover:bg-gold-light/10 transition-colors"
          >
            Donate
          </Link>
        </div>
      </HeroSlideshow>

      {/* Wari divider */}
      <div className="mx-auto max-w-4xl flex items-center gap-4 px-5 py-8">
        <span className="flex-1 wari-dashed h-[2px]" />
        <span className="text-gold text-xl">☘</span>
        <span className="flex-1 wari-dashed h-[2px]" />
      </div>

      {/* Founder */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16">
        <Reveal className="grid md:grid-cols-[300px_1fr] gap-10 md:gap-14 items-center bg-paper border border-border rounded-2xl p-8 sm:p-12 shadow-[0_20px_60px_-30px_rgba(43,27,18,0.3)]">
          <div className="relative mx-auto md:mx-0 w-full max-w-[280px]">
            <img
              src={founder.photo}
              alt={founder.name}
              className="w-full aspect-[3/4] object-cover rounded-lg shadow-[0_0_0_6px_var(--paper),0_0_0_7px_var(--gold),0_18px_40px_-10px_rgba(43,27,18,0.35)]"
            />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-maroon text-paper text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-md">
              Founder
            </span>
          </div>
          <div>
            <span className="text-[11px] tracking-[0.28em] uppercase text-gold border-b border-gold pb-1">
              Our Guide
            </span>
            <h3 className="mt-3 text-3xl sm:text-4xl text-maroon font-semibold">{founder.name}</h3>
            <p className="mt-2 text-sm text-ink-soft">{founder.role}</p>
            <p className="mt-5 text-ink-soft leading-relaxed">{founder.bio}</p>
            <blockquote className="mt-6 pl-5 border-l-2 border-gold sanskrit text-lg text-ink">
              “{founder.quote}”
            </blockquote>
          </div>
        </Reveal>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <SectionHead
          eyebrow="Moments"
          title="Life at the gurukulam"
          subtitle="Haripath, classes and ceremonies — a glimpse of daily life."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {gallery.map((g, i) => (
            <Reveal
              key={g.url}
              delay={i * 60}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-bg-alt"
            >
              <img
                src={g.url}
                alt={g.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent text-paper text-xs sm:text-sm translate-y-2 group-hover:translate-y-0 transition-transform">
                {g.caption}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-brand text-paper py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--gold) 0%, transparent 55%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
          {stats.map((s) => (
            <Reveal key={s.label}>
              <div className="font-display text-4xl sm:text-5xl text-gold-light">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-xs sm:text-sm tracking-wider text-paper/70 uppercase">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <SectionHead eyebrow="What we offer" title="Pillars of the gurukulam" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 80}
              className="bg-paper border border-border border-t-2 border-t-gold rounded-xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <span className="text-3xl block mb-3">{f.icon}</span>
              <h4 className="text-lg text-maroon font-semibold mb-2">{f.title}</h4>
              <p className="text-sm text-ink-soft">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <SectionHead eyebrow="Voices" title="What parents & alumni say" />
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 100}
              className="relative bg-paper border border-border rounded-xl p-7 pt-10"
            >
              <span className="absolute top-2 left-4 font-display text-6xl text-gold-light leading-none">
                “
              </span>
              <p className="italic text-ink-soft">{t.quote}</p>
              <div className="mt-5 text-sm font-semibold text-maroon">— {t.name}</div>
              <div className="text-xs text-ink-soft">{t.role}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <Reveal className="rounded-2xl p-10 sm:p-14 bg-gradient-to-br from-maroon via-saffron-deep to-saffron text-white flex flex-wrap gap-6 items-center justify-between shadow-2xl">
          <div>
            <h3 className="font-display text-3xl sm:text-4xl mb-2">Admissions are open</h3>
            <p className="text-white/85 max-w-md">
              Give your child the gift of discipline, devotion and a strong academic foundation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admissions"
              className="px-6 py-3 rounded-full bg-white text-maroon font-semibold hover:-translate-y-0.5 transition-transform"
            >
              Apply now
            </Link>
            <Link
              to="/donate"
              className="px-6 py-3 rounded-full border border-white/70 text-white font-semibold hover:bg-white/10"
            >
              Support us
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 sm:px-8 pb-24">
        <SectionHead eyebrow="Answers" title="Frequently asked" />
        <div className="divide-y divide-border border-t border-b border-border">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left py-5 gap-4"
      >
        <span className="font-medium text-ink">{q}</span>
        <span
          className={`text-saffron-deep text-2xl transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden text-ink-soft text-sm">{a}</div>
      </div>
    </div>
  );
}
