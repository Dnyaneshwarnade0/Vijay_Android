import { Link } from "@tanstack/react-router";
import { org } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-indigo-brand text-paper/85">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 pb-8 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-gold-light font-display text-xl mb-3">{org.shortName}</div>
          <p className="sanskrit text-2xl text-gold-light mb-1">{org.taglineDev}</p>
          <p className="text-sm tracking-wide text-paper/70 italic">
            {org.tagline} — “{org.taglineEn}”
          </p>
          <p className="mt-5 text-sm max-w-md text-paper/70">
            A living Varkari gurukul weaving Haripath, Dnyaneshwari and modern academics into
            one disciplined life for every child under our care.
          </p>
        </div>

        <div>
          <h4 className="font-display text-gold-light text-lg mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold-light">About</Link></li>
            <li><Link to="/curriculum" className="hover:text-gold-light">Curriculum</Link></li>
            <li><Link to="/admissions" className="hover:text-gold-light">Admissions</Link></li>
            <li><Link to="/donate" className="hover:text-gold-light">Donate</Link></li>
            <li><Link to="/contact" className="hover:text-gold-light">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-gold-light text-lg mb-3">Reach us</h4>
          <address className="not-italic text-sm text-paper/80 leading-relaxed">
            {org.address.line1}
            <br />
            {org.address.line2}
            <br />
            {org.address.line3}
            <br />
            <br />
            {org.phone}
            <br />
            <a href={`mailto:${org.email}`} className="hover:text-gold-light">
              {org.email}
            </a>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 text-xs text-paper/50 flex flex-wrap gap-2 justify-between">
          <span>© {new Date().getFullYear()} {org.fullName}</span>
          <span>{org.registration}</span>
        </div>
      </div>
    </footer>
  );
}
