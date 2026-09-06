import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/AppShell";

export const COURSE_CATEGORIES = ["Keyboard", "Tabla", "Octapad"] as const;
export const COURSE_STYLES = [
  "Classical / शास्त्रीय",
  "Semi-Classical",
  "Bollywood / Film",
  "Folk / लोकसंगीत",
  "Bhajan / Devotional",
  "Western",
];
export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export interface Course {
  id: string;
  category: string;
  title: string;
  description: string;
  style: string;
  level: string;
  price: number;
  qr_image_url: string | null;
  license_key: string | null;
  is_published: boolean;
  sort_order: number;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
}

async function loadCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Course[];
}

async function loadModules(courseId: string): Promise<CourseModule[]> {
  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CourseModule[];
}

const inputCls =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-ink2";

/** Admin — Udemy jaisa course builder: category, sub-courses, description, style, price, QR, license key. */
export function CourseManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Course | "new" | null>(null);
  const { data: courses = [], isLoading } = useQuery({ queryKey: ["courses"], queryFn: loadCourses });

  const togglePublish = useMutation({
    mutationFn: async (c: Course) => {
      const { error } = await supabase
        .from("courses")
        .update({ is_published: !c.is_published })
        .eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (editing) {
    return (
      <CourseForm
        course={editing === "new" ? null : editing}
        onDone={() => {
          setEditing(null);
          qc.invalidateQueries({ queryKey: ["courses"] });
        }}
      />
    );
  }

  return (
    <SectionCard title="Courses" subtitle={`${courses.length} course${courses.length === 1 ? "" : "s"} banaye gaye`}>
      <button
        onClick={() => setEditing("new")}
        className="bg-hero mb-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm"
      >
        <Plus className="h-5 w-5" /> Naya course banayein
      </button>

      {isLoading && <p className="text-sm text-ink3">Loading…</p>}
      {!isLoading && courses.length === 0 && (
        <p className="text-sm text-ink3">Abhi koi course nahi hai.</p>
      )}

      <div className="space-y-3">
        {courses.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink3">{c.category}</p>
                <p className="font-display text-base font-bold text-maroon">{c.title}</p>
                <p className="mt-0.5 text-xs text-ink2">
                  {c.style || "—"} · {c.level} · ₹{Number(c.price).toLocaleString("en-IN")}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  c.is_published ? "bg-gold/20 text-maroon" : "bg-surf3 text-ink3"
                }`}
              >
                {c.is_published ? "LIVE" : "DRAFT"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditing(c)}
                className="flex-1 rounded-xl border border-border py-2 text-xs font-bold text-ink2"
              >
                Edit
              </button>
              <button
                onClick={() => togglePublish.mutate(c)}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink2"
              >
                {c.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {c.is_published ? "Hide" : "Publish"}
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${c.title}" delete karein?`)) remove.mutate(c.id);
                }}
                className="rounded-xl border border-crimson/40 px-3 py-2 text-crimson"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

interface DraftModule {
  id?: string;
  title: string;
  description: string;
}

function CourseForm({ course, onDone }: { course: Course | null; onDone: () => void }) {
  const [category, setCategory] = useState<string>(course?.category ?? COURSE_CATEGORIES[0]);
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [style, setStyle] = useState<string>(course?.style || COURSE_STYLES[0]!);
  const [level, setLevel] = useState<string>(course?.level || COURSE_LEVELS[0]!);
  const [price, setPrice] = useState(course ? String(course.price) : "");
  const [qrUrl, setQrUrl] = useState(course?.qr_image_url ?? "");
  const [licenseKey, setLicenseKey] = useState(course?.license_key ?? "");
  const [published, setPublished] = useState(course?.is_published ?? false);
  const [modules, setModules] = useState<DraftModule[]>([]);
  const [loadedModules, setLoadedModules] = useState(false);

  useQuery({
    queryKey: ["course-modules", course?.id],
    enabled: !!course?.id && !loadedModules,
    queryFn: async () => {
      const rows = await loadModules(course!.id);
      setModules(rows.map((m) => ({ id: m.id, title: m.title, description: m.description })));
      setLoadedModules(true);
      return rows;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Course ka naam likhein");
      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
        style,
        level,
        price: Number(price || 0),
        qr_image_url: qrUrl.trim() || null,
        license_key: licenseKey.trim() || null,
        is_published: published,
      };
      let courseId = course?.id;
      if (courseId) {
        const { error } = await supabase.from("courses").update(payload).eq("id", courseId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("courses").insert(payload).select("id").single();
        if (error) throw error;
        courseId = (data as { id: string }).id;
      }

      // Sub-courses ko dobara likh dete hain (simple aur reliable).
      const { error: delErr } = await supabase.from("course_modules").delete().eq("course_id", courseId!);
      if (delErr) throw delErr;
      const clean = modules.filter((m) => m.title.trim());
      if (clean.length) {
        const { error: insErr } = await supabase.from("course_modules").insert(
          clean.map((m, i) => ({
            course_id: courseId!,
            title: m.title.trim(),
            description: m.description.trim(),
            sort_order: i,
          })),
        );
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      toast.success("Course saved");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SectionCard
      title={course ? "Edit course" : "New course"}
      subtitle="Category, sub-courses, price aur QR — sab yahan"
    >
      <button onClick={onDone} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className={labelCls}>Category</span>
          <div className="grid grid-cols-3 gap-2">
            {COURSE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-2xl border py-3 text-sm font-bold transition ${
                  category === c ? "border-gold bg-surf3 text-maroon" : "border-border bg-surface text-ink2"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>Course name</span>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tabla Basics" />
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>Description</span>
          <textarea
            className={`${inputCls} min-h-24`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Course me kya sikhaya jayega…"
          />
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>Style</span>
          <select className={inputCls} value={style} onChange={(e) => setStyle(e.target.value)}>
            {COURSE_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>Level</span>
          <select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value)}>
            {COURSE_LEVELS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>Price (₹)</span>
          <input
            className={inputCls}
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="599"
          />
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>Payment QR image link</span>
          <input
            className={inputCls}
            value={qrUrl}
            onChange={(e) => setQrUrl(e.target.value)}
            placeholder="https://…/qr.png"
          />
          {qrUrl.trim() && (
            <img
              src={qrUrl}
              alt="Course payment QR preview"
              className="mt-2 h-40 w-40 rounded-2xl border border-border object-contain"
            />
          )}
        </label>

        <label className="block space-y-1.5">
          <span className={labelCls}>License key (approval ke liye)</span>
          <input
            className={inputCls}
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="SV-TABLA-2026"
          />
        </label>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={labelCls}>Sub-courses</span>
            <button
              type="button"
              onClick={() => setModules((m) => [...m, { title: "", description: "" }])}
              className="flex items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-bold text-ink2"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {modules.length === 0 && <p className="text-xs text-ink3">Abhi koi sub-course nahi.</p>}
          <div className="space-y-3">
            {modules.map((m, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={m.title}
                    placeholder={`Sub-course ${i + 1} ka naam`}
                    onChange={(e) =>
                      setModules((prev) => prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setModules((prev) => prev.filter((_, j) => j !== i))}
                    className="rounded-xl border border-crimson/40 px-3 text-crimson"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  className={`${inputCls} mt-2 min-h-16`}
                  value={m.description}
                  placeholder="Is sub-course me kya hoga"
                  onChange={(e) =>
                    setModules((prev) => prev.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <span className="text-sm font-semibold text-ink">Students ko dikhayein (publish)</span>
        </label>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="bg-hero flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-warm disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save course"}
        </button>
      </div>
    </SectionCard>
  );
}
