import { Reveal } from "./Reveal";

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "";
  return (
    <Reveal className={`max-w-2xl mb-10 ${alignCls}`}>
      {eyebrow && (
        <span className="inline-block text-[11px] tracking-[0.28em] uppercase text-saffron-deep border-b border-saffron-deep pb-1 mb-3 font-medium">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-maroon leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-ink-soft text-base sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
