import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, BookOpen, Search, Send, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useSession } from "@/lib/session";
import { AppShell, BottomNav } from "@/components/AppShell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Logo";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ArtistDashboard } from "@/components/ArtistDashboard";
import { AvailabilitySearch } from "@/components/AvailabilitySearch";
import { ArtistBot } from "@/components/ArtistBot";
import { TelegramSettings } from "@/components/TelegramSettings";
import { LicenseGate } from "@/components/LicenseGate";
import { CourseManager } from "@/components/CourseManager";
import { StudentCourses } from "@/components/StudentCourses";
import { GeminiAssistant } from "@/components/GeminiAssistant";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Swar Vijay Music Academy" },
      { name: "description", content: "Manage artists, students and courses at Swar Vijay Music Academy." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useMe(session?.user.id);
  const [adminTab, setAdminTab] = useState("users");
  const [kathakarTab, setKathakarTab] = useState("bot");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }, [loading, session, navigate]);

  if (loading || isLoading || !data?.profile || !data.role) {
    return <PhoneFrame><div className="flex flex-1 flex-col items-center justify-center gap-4"><Logo className="h-16 w-16 rounded-2xl" /><p className="text-sm text-ink3">Loading…</p></div></PhoneFrame>;
  }

  const { profile, role } = data;
  const needsLicense = (role === "artist" || role === "kathakar") && !profile.license_activated_at;
  if (needsLicense) {
    return <LicenseGate profile={profile} role={role} onUnlocked={() => queryClient.invalidateQueries({ queryKey: ["me", profile.id] })} />;
  }

  if (role === "admin") {
    return (
      <AppShell profile={profile} role={role} nav={<BottomNav active={adminTab} onChange={setAdminTab} items={[
        { key: "users", label: "Users", icon: Users },
        { key: "search", label: "Find artist", icon: Search },
        { key: "courses", label: "Courses", icon: BookOpen },
        { key: "ai", label: "AI Sahayak", icon: Sparkles },
        { key: "telegram", label: "Telegram", icon: Send },
      ]} />}>
        {adminTab === "users" && <AdminDashboard meId={profile.id} />}
        {adminTab === "search" && <AvailabilitySearch />}
        {adminTab === "courses" && <CourseManager />}
        {adminTab === "ai" && <GeminiAssistant role="admin" />}
        {adminTab === "telegram" && <TelegramSettings />}
      </AppShell>
    );
  }
  if (role === "student") return <AppShell profile={profile} role={role}><StudentCourses /></AppShell>;
  if (role === "artist") return <AppShell profile={profile} role={role}><ArtistDashboard meId={profile.id} /></AppShell>;
  return (
    <AppShell profile={profile} role={role} nav={<BottomNav active={kathakarTab} onChange={setKathakarTab} items={[
      { key: "bot", label: "Bot", icon: Bot },
      { key: "search", label: "Find artist", icon: Search },
      { key: "ai", label: "AI Sahayak", icon: Sparkles },
    ]} />}>
      {kathakarTab === "bot" && <ArtistBot />}
      {kathakarTab === "search" && <AvailabilitySearch />}
      {kathakarTab === "ai" && <GeminiAssistant role="kathakar" />}
    </AppShell>
  );
}
