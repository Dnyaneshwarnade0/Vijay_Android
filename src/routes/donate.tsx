import { createFileRoute } from "@tanstack/react-router";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import { causes, banking, org } from "@/data/site";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Shantibrahma Gurukulam" },
      {
        name: "description",
        content:
          "Support Shantibrahma Gurukulam — sponsor a meal, books or a full year of a student's education. Banking and UPI details inside.",
      },
      { property: "og:title", content: "Donate — Shantibrahma Gurukulam" },
      { property: "og:url", content: "/donate" },
    ],
    links: [{ rel: "canonical", href: "/donate" }],
  }),
  component: DonatePage,
});

function DonatePage() {
  useReveal();

  return (
    <>
      <section className="bg-gradient-to-br from-indigo-brand via-maroon to-saffron-deep text-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="inline-block text-[11px] tracking-[0.32em] uppercase text-gold-light border-b border-gold-light pb-1 mb-4">
            Seva
          </span>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight max-w-3xl">
            Every rupee becomes a plate of food, a book, a night of shelter.
          </h1>
          <p className="mt-4 max-w-xl text-white/85">
            The gurukul is sustained entirely by devotees and well-wishers. Your contribution
            keeps this parampara alive for the next generation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <SectionHead eyebrow="Ways to help" title="Choose a cause" />
        <div className="grid md:grid-cols-3 gap-5">
          {causes.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 100}
              className="bg-paper border border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <div className="h-1.5 bg-gradient-to-r from-saffron to-gold" />
              <div className="p-6">
                <span className="text-3xl block mb-2">{c.icon}</span>
                <h4 className="font-semibold text-maroon text-lg">{c.title}</h4>
                <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
                <div className="mt-4 font-display text-2xl text-saffron-deep">{c.amount}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
        <SectionHead eyebrow="Banking details" title="How to contribute" />
        <div className="grid md:grid-cols-2 gap-5">
          <Reveal className="bg-paper border border-border rounded-2xl p-7">
            <div className="text-[11px] tracking-[0.28em] uppercase text-gold mb-2">
              Bank Transfer
            </div>
            <dl className="space-y-3 text-sm">
              <Field label="Account Name" value={banking.accountName} />
              <Field label="Bank" value={banking.bank} />
              <Field label="Branch" value={banking.branch} />
              <Field label="Account Number" value={banking.accountNumber} />
              <Field label="IFSC" value={banking.ifsc} />
              <Field label="Account Type" value={banking.accountType} />
            </dl>
          </Reveal>

          <Reveal delay={100} className="bg-paper border border-border rounded-2xl p-7 flex flex-col">
            <div className="text-[11px] tracking-[0.28em] uppercase text-gold mb-2">UPI</div>
            <div className="font-display text-2xl text-maroon break-all">{banking.upi}</div>
            <p className="mt-3 text-sm text-ink-soft">
              Scan the QR from any UPI app — GPay, PhonePe, Paytm — or use the UPI ID directly.
            </p>
            <div className="mt-6 flex-1 rounded-xl bg-bg-alt border border-dashed border-gold grid place-items-center text-ink-soft text-sm min-h-[180px]">
              QR code — [TODO: add image]
            </div>
            <p className="mt-4 text-xs italic text-ink-soft">
              After paying, please WhatsApp the screenshot to {org.whatsapp} for your receipt.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-6 rounded-xl bg-gold-light/40 border border-gold p-5 text-sm text-ink">
          <strong className="text-maroon">Tax exemption:</strong> {org.registration}. Please
          contact the office to confirm the current 80G status before claiming exemption.
        </Reveal>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-ink font-medium break-all">{value}</dd>
    </div>
  );
}
