import { createFileRoute } from "@tanstack/react-router";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import { org } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shantibrahma Gurukulam" },
      {
        name: "description",
        content: `Reach Shantibrahma Gurukulam — address, phone, email and visiting hours.`,
      },
      { property: "og:title", content: "Contact — Shantibrahma Gurukulam" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const cards = [
  { icon: "📍", title: "Address", body: [`${org.address.line1}`, org.address.line2, org.address.line3] },
  { icon: "📞", title: "Phone", body: [org.phone, `WhatsApp: ${org.whatsapp}`] },
  { icon: "✉️", title: "Email", body: [org.email] },
  { icon: "🕐", title: "Visiting hours", body: [org.hours] },
];

function ContactPage() {
  useReveal();

  return (
    <>
      <section className="bg-paper border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="inline-block text-[11px] tracking-[0.32em] uppercase text-saffron-deep border-b border-saffron-deep pb-1 mb-3">
            Say Namaskar
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-maroon max-w-3xl">
            Visit the gurukul, or simply say hello.
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            We welcome parents, well-wishers and devotees. Please call ahead so we can host you
            with the attention you deserve.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 80}
              className="bg-paper border border-border border-t-2 border-t-gold rounded-xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <span className="text-2xl block mb-3">{c.icon}</span>
              <h4 className="text-maroon font-semibold mb-2">{c.title}</h4>
              {c.body.map((b) => (
                <p key={b} className="text-sm text-ink-soft">
                  {b}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <Reveal className="rounded-2xl overflow-hidden border border-border bg-bg-alt aspect-[16/9] grid place-items-center text-ink-soft">
          Map placeholder — [TODO: embed Google Maps for the gurukul]
        </Reveal>
      </section>
    </>
  );
}
