import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import { admissionSteps, requiredDocs, org } from "@/data/site";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions — Shantibrahma Gurukulam" },
      {
        name: "description",
        content:
          "Admission process, eligibility, required documents and fee structure for Shantibrahma Gurukulam.",
      },
      { property: "og:title", content: "Admissions — Shantibrahma Gurukulam" },
      { property: "og:url", content: "/admissions" },
    ],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: AdmissionsPage,
});

function AdmissionsPage() {
  useReveal();

  return (
    <>
      <section className="bg-gradient-to-br from-maroon via-saffron-deep to-saffron text-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="inline-block text-[11px] tracking-[0.32em] uppercase text-gold-light border-b border-gold-light pb-1 mb-4">
            Join the gurukul
          </span>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight max-w-3xl">
            Admissions for the coming year are open.
          </h1>
          <p className="mt-4 max-w-xl text-white/85">
            A simple five-step process — visit us, meet the acharyas, and give your child the gift
            of parampara and modern education, together.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <SectionHead eyebrow="The Path" title="Admission process" />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {admissionSteps.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 80}
              className="bg-paper border border-border rounded-xl p-6 text-center"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-saffron text-white grid place-items-center font-display mb-3">
                {i + 1}
              </div>
              <h5 className="font-semibold text-maroon">{s.title}</h5>
              <p className="mt-2 text-xs text-ink-soft">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-20 grid md:grid-cols-2 gap-10">
        <Reveal>
          <SectionHead eyebrow="Eligibility" title="Who can apply" />
          <ul className="space-y-3 text-ink-soft">
            {[
              "Boys aged approximately 6 to 16 years",
              "Willingness to live in a residential gurukul environment",
              "Basic reading and writing (per age group)",
              "Consent and involvement of parents / guardians",
            ].map((e) => (
              <li key={e} className="flex gap-3">
                <span className="text-saffron-deep font-bold">✓</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100}>
          <SectionHead eyebrow="Documents" title="What to bring" />
          <ul className="divide-y divide-border border-y border-border">
            {requiredDocs.map((d) => (
              <li key={d} className="py-3 pl-6 relative text-ink-soft">
                <span className="absolute left-0 top-3 text-saffron-deep font-bold">✓</span>
                {d}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-5 sm:px-8 pb-20">
        <SectionHead eyebrow="Fees" title="Fee structure" />
        <div className="bg-paper border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-alt text-maroon">
              <tr>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Annual Fee (₹)</th>
                <th className="text-left px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="text-ink-soft">
              <tr className="border-t border-border">
                <td className="px-5 py-3">Residential — Full year</td>
                <td className="px-5 py-3">[TODO]</td>
                <td className="px-5 py-3">Includes lodging, boarding & training</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-5 py-3">Day scholar</td>
                <td className="px-5 py-3">[TODO]</td>
                <td className="px-5 py-3">Training only, no boarding</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-5 py-3">Uniform & books</td>
                <td className="px-5 py-3">[TODO]</td>
                <td className="px-5 py-3">One-time, per year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs italic text-ink-soft">
          Please contact the office for the current year's fee structure and available scholarships.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 sm:px-8 pb-24">
        <Reveal className="rounded-2xl bg-paper border border-border p-8 sm:p-10 text-center">
          <h3 className="font-display text-2xl sm:text-3xl text-maroon">
            Ready to visit or enquire?
          </h3>
          <p className="mt-2 text-ink-soft">
            Call us on <span className="text-maroon font-medium">{org.phone}</span> or email{" "}
            <a href={`mailto:${org.email}`} className="text-saffron-deep font-medium">
              {org.email}
            </a>
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-full bg-gradient-to-br from-saffron to-saffron-deep text-white font-semibold hover:-translate-y-0.5 transition-transform"
            >
              Contact office
            </Link>
            <Link
              to="/donate"
              className="px-6 py-3 rounded-full border border-gold text-maroon font-semibold hover:bg-gold-light/40 transition-colors"
            >
              Support the gurukul
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
