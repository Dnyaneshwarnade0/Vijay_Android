
## Goal
Rebuild the Varkari Shikshan Sanstha (Shantibrahma Gurukulam) site as a **modern, English-first** presentation site inside the current TanStack Start project. Traditional Indian aesthetic (saffron, maroon, gold, paper) fused with modern layout, motion, and typography. Focus is design + presentation only — no backend, no forms wiring.

## Language & Tagline
- All content in **English** by default (no Marathi/Devanagari in copy).
- Sanskrit tagline **"विद्या ददाति विनयम्" / "Vidya Dadati Vinayam"** used as the signature line — appears in the hero (bottom-left) and again in the footer as brand mark. English translation ("Knowledge bestows humility") shown alongside.
- Nav CTAs: **Admissions** and **Donate**.

## Pages (TanStack routes)
1. `/` Home — hero slideshow, founder intro, features, stats, gallery, testimonials, CTA banner, FAQ.
2. `/about` — story, inspiration (Kurekar Baba), mission, vision, values, milestones timeline.
3. `/curriculum` — daily schedule, subjects, Haripath / Dnyaneshwari / instruments / school syllabus.
4. `/admissions` — eligibility, 5-step process, required documents, fee structure, contact.
5. `/donate` — causes, suggested amounts, banking details, 80G note, UPI.
6. `/contact` — address, phone, email, map placeholder, socials.

Root nav is shared; every route gets its own `head()` with unique title + description + og tags.

## Hero (mobile-fixed)
- Full-bleed **image slideshow** (auto-advance every 5s, fade transition, dot indicators, prev/next arrows on desktop, swipe on mobile).
- **Mobile**: image uses `object-cover` with `object-position: center` and a fixed aspect ratio (`aspect-[4/5]` mobile, `aspect-[21/9]` desktop) so it crops properly instead of shrinking to desktop letterbox.
- Overlay gradient darkens the bottom third.
- **Tagline block anchored bottom-left** (not centered): eyebrow "Est. Varkari Parampara" → H1 "Vidya Dadati Vinayam" (display serif) → English subtitle → **two pill CTAs (Admissions primary saffron, Donate outline gold)**.

## Image Presentation (across site)
- **Hero slideshow** on Home, About, Curriculum with the existing Shantibrahma image URLs (founder, Kurekar Baba, Mauli Maharaj felicitation, Sitaram Baba, Adarsh Vidyarthi).
- **Gallery grid** on Home with hover zoom + caption slide-up.
- **Reveal-on-scroll** for every image and card (fade + translate-y via IntersectionObserver).
- **Ken Burns slow zoom** on hero slides while active.
- **Marquee / auto-scrolling strip** of secondary images on About.
- Founder portrait with gold ring + saffron ribbon tag.

## Missing Information To Add (placeholder-safe, user will edit)
- **Founder**: Ankush Maharaj Kadam — short bio, philosophy quote, role, years of service.
- **Inspiration**: Kurekar Baba — brief note.
- **Registered address** placeholder (e.g. "Shantibrahma Gurukulam, [Village], Tal. [—], Dist. [—], Maharashtra — PIN"), phone, email, website.
- **Banking details** block on Donate page: Account name, Bank, Branch, A/C No, IFSC, UPI ID, QR placeholder. All marked as `TODO – replace with real details`.
- **Registration / 80G / 12A** placeholder line.
- **Milestones**: Founded year, students taught, alumni, maharajas in parivar.
- **Trustees / Committee** short list (placeholder names).

Every placeholder is clearly commented in JSX so the user can find and edit.

## Design System
Add to `src/styles.css` under `@theme` and `:root`:
- Palette (oklch): `--bg #F7F1E3`, `--paper #FCF8EE`, `--ink #2B1B12`, `--saffron #D9691D`, `--saffron-deep #B84E10`, `--maroon #7A2E2E`, `--indigo #263159`, `--gold #B8860B`, `--gold-light #E8C468`.
- Fonts loaded via `<link>` in `__root.tsx` head: **Fraunces** (display serif, traditional feel) + **Inter** (body, modern) + **Cormorant Garamond** for the Sanskrit tagline treatment. No Devanagari fonts needed since site is English; Sanskrit line rendered as a stylized display string.
- Radius scale, elegant shadow token, subtle paper-grain radial-dot background.
- Semantic Tailwind tokens: `bg-paper`, `text-ink`, `text-maroon`, `bg-saffron`, etc.

## Motion
- IntersectionObserver `useReveal` hook → fade+rise on scroll.
- Hero slide crossfade + Ken Burns.
- Count-up animation for stats.
- Card hover lift + image scale.
- FAQ accordion smooth open.
- Nav sticky with blur backdrop.

## Component Structure
```
src/
  components/
    Header.tsx           (sticky nav, mobile hamburger)
    Footer.tsx           (address, quick links, tagline, socials)
    HeroSlideshow.tsx    (reusable, props: slides[], eyebrow, title, subtitle, ctas)
    SectionHead.tsx
    FounderCard.tsx
    FeatureGrid.tsx
    StatsStrip.tsx
    GalleryGrid.tsx
    Testimonials.tsx
    CTABanner.tsx
    FAQ.tsx
    Timeline.tsx         (about milestones)
    RevealOnScroll.tsx   (wrapper)
    BankingDetails.tsx
  hooks/
    use-reveal.ts
    use-count-up.ts
  data/
    site.ts              (single source of truth: org info, address, banking, slides, gallery, faqs)
  routes/
    index.tsx, about.tsx, curriculum.tsx, admissions.tsx, donate.tsx, contact.tsx
```

## Technical Notes
- Replace the placeholder `src/routes/index.tsx`.
- Update `__root.tsx` head with proper title/description/OG and font `<link>` tags.
- Header + Footer rendered in `__root.tsx` around `<Outlet />`.
- All images referenced by URL from the original site (no upload needed). `<img loading="lazy">` except hero first slide.
- Mobile-first Tailwind, `sm: md: lg:` breakpoints, grid + `min-w-0` + `shrink-0` patterns for header.
- No new npm deps required.

## Out of Scope
- Backend, forms submission, payments integration, auth, database.
- Marathi translations (site is English by request; only Sanskrit tagline remains).
- Real photos beyond what the source HTML already links to.
