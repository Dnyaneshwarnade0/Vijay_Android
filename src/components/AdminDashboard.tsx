import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/AppShell";
import type { AppRole, Profile } from "@/lib/session";

interface Row extends Profile { role: AppRole | null; }

async function loadUsers(): Promise<Row[]> {
  const [{ data: profiles, error }, { data: roles, error: roleError }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (error) throw error;
  if (roleError) throw roleError;
  const rolesByUser = new Map((roles ?? []).map((row) => [row.user_id, row.role as AppRole]));
  return (profiles ?? []).map((profile) => ({ ...(profile as unknown as Profile), role: rolesByUser.get(profile.id) ?? null }));
}

export function AdminDashboard({ meId }: { meId: string }) {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: loadUsers });

  const remove = useMutation({
    mutationFn: async (userId: string) => {
      const { data: refreshed } = await supabase.auth.refreshSession();
      const accessToken = refreshed.session?.access_token;
      if (!accessToken) throw new Error("Kripya dobara login karein.");
      const { data: result, error } = await supabase.functions.invoke("admin-users", {
        body: { action: "delete", userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User aur uski saari related details delete ho gayi."); },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = data.filter((row) => row.id !== meId && row.role !== "admin" && (roleFilter === "all" || row.role === roleFilter));
  return (
    <SectionCard title="Registered users" subtitle="License key ke baad Artist aur Kathakar direct active hote hain.">
      <div className="mb-4 grid grid-cols-4 gap-1.5">
        {([["all", "All users"], ["student", "Student"], ["artist", "Artist"], ["kathakar", "Kathakar"]] as const).map(([value, label]) => (
          <button key={value} onClick={() => setRoleFilter(value)} className={`rounded-xl border px-2 py-2 text-[11px] font-semibold ${roleFilter === value ? "border-maroon bg-maroon text-white" : "border-border bg-white text-ink2"}`}>{label}</button>
        ))}
      </div>
      {isLoading ? <p className="text-sm text-ink3">Loading…</p> : rows.length === 0 ? <p className="rounded-xl border border-dashed border-border bg-surf2 p-6 text-center text-sm text-ink3">Koi account nahi hai.</p> : (
        <ul className="space-y-3">{rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border bg-surf2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><p className="truncate font-semibold text-maroon">{row.full_name || row.email}</p><p className="truncate text-xs text-ink3">{row.email}</p><p className="mt-1 text-xs text-ink2">{row.role ?? "—"}{row.category ? ` · ${row.category}` : ""}{row.phone ? ` · ${row.phone}` : ""}</p></div>
              <button disabled={remove.isPending} onClick={() => { if (window.confirm(`${row.full_name || row.email} ka account aur saari details permanently delete karein?`)) remove.mutate(row.id); }} className="flex items-center justify-center gap-1.5 rounded-xl border border-crimson/50 px-3 py-2.5 text-sm font-semibold text-crimson disabled:opacity-50">{remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete</button>
            </div>
          </li>
        ))}</ul>
      )}
    </SectionCard>
  );
}
