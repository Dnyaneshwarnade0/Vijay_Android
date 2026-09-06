CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  style text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'Beginner',
  price numeric(10,2) NOT NULL DEFAULT 0,
  qr_image_url text,
  license_key text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin manages courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "approved users view published courses" ON public.courses
  FOR SELECT TO authenticated
  USING (is_published AND public.is_approved(auth.uid()));

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_modules TO authenticated;
GRANT ALL ON public.course_modules TO service_role;

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin manages course modules" ON public.course_modules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "approved users view modules of published courses" ON public.course_modules
  FOR SELECT TO authenticated
  USING (
    public.is_approved(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id AND c.is_published
    )
  );

CREATE TRIGGER course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);