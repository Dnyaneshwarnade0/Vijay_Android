import { createFileRoute } from "@tanstack/react-router";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import { aboutSlides, milestones, founder, org } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shantibrahma Gurukulam" },
      {
        name: "description",
        content:
          "The story, mission and inspiration behind Shantibrahma Gurukulam — Varkari Shikshan Sanstha.",
      },
      { property: "og:title", content: "About — Shantibrahma Gurukulam" },
      { property: "og:image", content: aboutSlides[0].src },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  useReveal();

  return (
    <>
      <HeroSlideshow slides={aboutSlides} height="sub">
        <span className="inline-block text-[11px] tracking-[0.32em] uppercase text-gold-light border-b border-gold-light pb-1 mb-3">
          Our Story
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-paper leading-tight">
          A gurukul built on parampara,
          <br />
          shaped for the modern child.
        </h1>
      </HeroSlideshow>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 space-y-20">
        {/* Mission / Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <Reveal className="bg-paper border border-border rounded-2xl p-8">
            <span className="text-[11px] tracking-[0.28em] uppercase text-saffron-deep">
              Our Mission
            </span>
            <h3 className="mt-3 font-display text-2xl text-maroon">
              To raise students who carry both scripture and syllabus with equal grace.
            </h3>
            <p className="mt-4 text-ink-soft">
              We nurture children through discipline, devotion and rigorous study, so that they
              step into the world grounded in the Varkari way and confident in modern life.
            </p>
          </Reveal>
          <Reveal delay={100} className="bg-paper border border-border rounded-2xl p-8">
            <span className="text-[11px] tracking-[0.28em] uppercase text-saffron-deep">
              Our Vision
            </span>
            <h3 className="mt-3 font-display text-2xl text-maroon">
              A living parampara for every generation.
            </h3>
            <p className="mt-4 text-ink-soft">
              To keep the wisdom of Haripath and Dnyaneshwari alive as everyday practice — never
              museum pieces — carried forward by well-educated, humble young adults.
            </p>
          </Reveal>
        </div>

        {/* Founder story */}
        <Reveal className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
          <img
            src={founder.photo}
            alt={founder.name}
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl border border-border shadow-[0_20px_50px_-20px_rgba(43,27,18,0.35)]"
          />
          <div>
            <span className="text-[11px] tracking-[0.28em] uppercase text-gold">
              Founder
            </span>
            <h3 className="mt-2 font-display text-4xl text-maroon">{founder.name}</h3>
            <p className="mt-2 text-sm text-ink-soft">{founder.role}</p>
            <p className="mt-4 text-ink-soft leading-relaxed">{founder.bio}</p>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Under his guidance, the gurukul has grown from a small circle of students into a
              full residential institution that now trains hundreds each year — while retaining
              the intimacy of a family.
            </p>
            <blockquote className="mt-6 pl-5 border-l-2 border-gold sanskrit text-xl text-ink">
              “{founder.quote}”
            </blockquote>
          </div>
        </Reveal>

        {/* Inspiration */}
        <Reveal className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div className="md:order-1 order-2">
            <span className="text-[11px] tracking-[0.28em] uppercase text-indigo-brand">
              Inspiration
            </span>
            <h3 className="mt-2 font-display text-3xl sm:text-4xl text-maroon">
              The blessing of Kurekar Baba
            </h3>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Kurekar Baba's presence and guidance shaped the very foundation of this institution.
              His shuddha Varkari parampara continues to guide every decision we make, from the
              rhythm of the daily routine to the reverence with which students are taught.
            </p>
          </div>
          <img
            src={aboutSlides[2].src}
            alt="Kurekar Baba"
            loading="lazy"
            className="md:order-2 order-1 w-full aspect-[4/3] object-cover rounded-2xl border border-border shadow-xl"
          />
        </Reveal>

        {/* Milestones */}
        <div>
          <SectionHead eyebrow="Journey" title="Milestones" />
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gold/40 -translate-x-1/2 hidden sm:block" />
            <ol className="space-y-8">
              {milestones.map((m, i) => (
                <Reveal
                  key={m.year}
                  as="li"
                  delay={i * 80}
                  className={`grid sm:grid-cols-2 gap-6 items-center relative ${
                    i % 2 ? "sm:[&>*:first-child]:col-start-2" : ""
                  }`}
                >
                  <div className={`bg-paper border border-border rounded-xl p-6 ${i % 2 ? "sm:text-left" : "sm:text-right"}`}>
                    <div className="font-display text-3xl text-saffron-deep">{m.year}</div>
                    <div className="mt-1 text-lg font-semibold text-maroon">{m.title}</div>
                    <p className="mt-2 text-sm text-ink-soft">{m.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* Values */}
        <div>
          <SectionHead eyebrow="Values" title="What we hold dear" />
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { t: "Shraddha", d: "Faith rooted in daily practice, not just belief." },
              { t: "Sadhana", d: "Consistent, disciplined effort as the path to mastery." },
              { t: "Seva", d: "Learning as service — to guru, community and self." },
            ].map((v, i) => (
              <Reveal
                key={v.t}
                delay={i * 80}
                className="bg-paper border border-border rounded-xl p-6 text-center"
              >
                <div className="font-display text-2xl text-maroon">{v.t}</div>
                <p className="mt-2 text-sm text-ink-soft">{v.d}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <p className="text-center sanskrit text-3xl text-maroon">
          {org.taglineDev}
        </p>
      </section>
    </>
  );
}
