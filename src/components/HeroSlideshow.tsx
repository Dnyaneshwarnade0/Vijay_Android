import { useEffect, useState, type ReactNode } from "react";

type Slide = { src: string; alt: string };

export function HeroSlideshow({
  slides,
  interval = 5000,
  height = "hero",
  children,
}: {
  slides: Slide[];
  interval?: number;
  height?: "hero" | "sub";
  children?: ReactNode;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  const aspect =
    height === "hero"
      ? "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]"
      : "aspect-[4/5] sm:aspect-[21/8] lg:aspect-[24/7]";

  return (
    <section className="relative overflow-hidden border-b-4 border-gold">
      <div className={`relative w-full ${aspect}`}>
        {slides.map((s, idx) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={s.src}
              alt={s.alt}
              loading={idx === 0 ? "eager" : "lazy"}
              className={`w-full h-full object-cover object-center ${idx === i ? "ken-burns" : ""}`}
              key={`${s.src}-${idx === i ? i : "off"}`}
            />
          </div>
        ))}
        <div className="absolute inset-0 hero-overlay pointer-events-none" />

        {/* Bottom-left content anchor */}
        {children && (
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-10 sm:pb-14 pt-24 text-paper">
              <div className="max-w-2xl">{children}</div>
            </div>
          </div>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute right-5 sm:right-8 bottom-5 z-10 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === i ? "w-8 bg-gold-light" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
