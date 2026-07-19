import { createFileRoute } from "@tanstack/react-router";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import { curriculumSlides, curriculum } from "@/data/site";

export const Route = createFileRoute("/curriculum")({
  head: () => ({
    meta: [
      { title: "Curriculum — Shantibrahma Gurukulam" },
      {
        name: "description",
        content:
          "Haripath, Dnyaneshwari, Sanskrit, Kirtan and modern academics — the full curriculum of Shantibrahma Gurukulam.",
      },
      { property: "og:title", content: "Curriculum — Shantibrahma Gurukulam" },
      { property: "og:image", content: curriculumSlides[0].src },
      { property: "og:url", content: "/curriculum" },
    ],
    links: [{ rel: "canonical", href: "/curriculum" }],
  }),
  component: CurriculumPage,
});

const schedule = [
  { time: "04:30", body: "Wake up, snana and personal sadhana" },
  { time: "05:30", body: "Collective Haripath recitation" },
  { time: "07:00", body: "Breakfast" },
  { time: "08:00", body: "Academic school classes (state syllabus)" },
  { time: "13:00", body: "Lunch and rest" },
  { time: "14:30", body: "Dnyaneshwari and Sanskrit study" },
  { time: "16:30", body: "Pakhawaj, Taal and instrument practice" },
  { time: "18:00", body: "Sandhya Aarti and Kirtan" },
  { time: "20:00", body: "Dinner and self-study" },
  { time: "21:30", body: "Rest" },
];

function CurriculumPage() {
  useReveal();

  return (
    <>
      <HeroSlideshow slides={curriculumSlides} height="sub">
        <span className="inline-block text-[11px] tracking-[0.32em] uppercase text-gold-light border-b border-gold-light pb-1 mb-3">
          Curriculum
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-paper leading-tight">
          From Haripath to Dnyaneshwari,
          <br />
          rooted in modern learning.
        </h1>
      </HeroSlideshow>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <SectionHead eyebrow="Subjects" title="What students study" />
        <div className="grid md:grid-cols-2 gap-4">
          {curriculum.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 60}
              className="flex gap-5 bg-paper border border-border rounded-xl p-6"
            >
              <div className="font-display text-4xl text-gold shrink-0 w-14">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-semibold text-maroon">{c.title}</h4>
                <p className="mt-1 text-sm text-ink-soft">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 sm:px-8 pb-24">
        <SectionHead eyebrow="A day in the gurukul" title="Daily schedule" />
        <div className="bg-paper border border-border rounded-2xl overflow-hidden">
          {schedule.map((s, i) => (
            <Reveal
              key={s.time}
              delay={i * 40}
              className={`flex gap-6 px-6 py-4 items-center ${
                i !== schedule.length - 1 ? "border-b border-border/70" : ""
              }`}
            >
              <div className="font-display text-xl text-saffron-deep w-20 shrink-0">
                {s.time}
              </div>
              <div className="text-ink-soft">{s.body}</div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
