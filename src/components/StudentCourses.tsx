import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Disc, Drum, Piano } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/AppShell";
import { COURSE_CATEGORIES, type Course, type CourseModule } from "@/components/CourseManager";

const icons: Record<string, React.ElementType> = {
  Keyboard: Piano,
  Tabla: Drum,
  Octapad: Disc,
};

async function loadPublished(category: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("category", category)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Course[];
}

/** Student — 3 courses (Keyboard, Tabla, Octapad) aur unke sub-courses. */
export function StudentCourses() {
  const [category, setCategory] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  if (course) return <CourseDetail course={course} onBack={() => setCourse(null)} />;

  if (category) {
    return <CourseList category={category} onBack={() => setCategory(null)} onOpen={setCourse} />;
  }

  return (
    <SectionCard title="Courses" subtitle="Apna course chunein">
      <div className="grid gap-3">
        {COURSE_CATEGORIES.map((c) => {
          const Icon = icons[c] ?? Piano;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition hover:border-gold"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surf3 text-maroon">
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-display text-lg font-bold text-maroon">{c}</span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CourseList({
  category,
  onBack,
  onOpen,
}: {
  category: string;
  onBack: () => void;
  onOpen: (c: Course) => void;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["published-courses", category],
    queryFn: () => loadPublished(category),
  });

  return (
    <SectionCard title={category} subtitle="Available courses">
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {isLoading && <p className="text-sm text-ink3">Loading…</p>}
      {!isLoading && data.length === 0 && (
        <p className="text-sm text-ink3">Is category me abhi koi course nahi hai.</p>
      )}
      <div className="space-y-3">
        {data.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpen(c)}
            className="w-full rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-gold"
          >
            <p className="font-display text-base font-bold text-maroon">{c.title}</p>
            <p className="mt-0.5 text-xs text-ink2">
              {c.style || "—"} · {c.level}
            </p>
            <p className="mt-2 text-sm font-bold text-maroon">₹{Number(c.price).toLocaleString("en-IN")}</p>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const { data: modules = [] } = useQuery<CourseModule[]>({
    queryKey: ["course-modules-public", course.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", course.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CourseModule[];
    },
  });

  async function checkKey() {
    const { toast } = await import("sonner");
    if (!key.trim()) {
      toast.error("License key enter karein.");
      return;
    }
    try {
      const { data: refreshed } = await supabase.auth.refreshSession();
      const accessToken = refreshed.session?.access_token;
      if (!accessToken) throw new Error("Kripya sign in karke dobara try karein.");
      const { data, error } = await supabase.functions.invoke("license-redeem", {
        body: { key: key.trim(), courseId: course.id },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setUnlocked(true);
      toast.success("Course aur uske sub-courses unlock ho gaye. Yeh key ab use ho chuki hai.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "License key verify nahi hui.");
    }
  }

  return (
    <SectionCard title={course.title} subtitle={`${course.category} · ${course.level}`}>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {course.description && <p className="text-sm leading-relaxed text-ink2">{course.description}</p>}
      <p className="mt-3 text-lg font-bold text-maroon">₹{Number(course.price).toLocaleString("en-IN")}</p>

      <div className="mt-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink2">Sub-courses</p>
        {modules.length === 0 && <p className="text-sm text-ink3">Sub-courses jald hi add honge.</p>}
        {modules.map((m, i) => (
          <div key={m.id} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-bold text-maroon">
              {i + 1}. {m.title}
            </p>
            {m.description && <p className="mt-1 text-xs text-ink2">{m.description}</p>}
          </div>
        ))}
      </div>

      {unlocked ? (
        <p className="mt-6 rounded-2xl border border-gold bg-surf3 p-4 text-center text-sm font-bold text-maroon">
          Course unlocked — admin se class ka time confirm karein.
        </p>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-center">
          <p className="text-sm font-bold text-maroon">Payment karke license key daalein</p>
          {course.qr_image_url ? (
            <img
              src={course.qr_image_url}
              alt={`${course.title} payment QR code`}
              className="mx-auto mt-3 h-48 w-48 rounded-2xl border border-border object-contain"
            />
          ) : (
            <div className="mx-auto mt-3 flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-border text-xs text-ink3">
              QR jald hi
            </div>
          )}
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="License key"
            className="mt-4 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-center text-sm tracking-widest text-ink outline-none focus:border-gold"
          />
          <button
            onClick={checkKey}
            className="bg-hero mt-3 w-full rounded-2xl py-3.5 text-base font-bold text-warm"
          >
            Unlock course
          </button>
          <p className="mt-2 text-[11px] text-ink3">Payment verify hone ke baad admin license key deta hai.</p>
        </div>
      )}
    </SectionCard>
  );
}
