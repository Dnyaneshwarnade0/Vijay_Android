import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = "admin" | "artist" | "kathakar" | "student";
export type AccountStatus = "pending" | "approved" | "rejected" | "revoked";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  category: string | null;
  status: AccountStatus;
  license_activated_at: string | null;
  license_key: string | null;
  avatar_url: string | null;
  created_at: string;
}

const DEVICE_ID_KEY = "swar_vijay_device_id";

export function getDeviceId() {
  if (typeof window === "undefined") return "";
  let deviceId = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export async function activateDeviceSession() {
  const deviceId = getDeviceId();
  const { error } = await supabase.functions.invoke("single-device-session", { body: { deviceId } });
  if (error) throw error;
}

export const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  artist: "Artist / कलाकार",
  kathakar: "Kathakar / कथाकार",
  student: "Student / विद्यार्थी",
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sub: any;
    try {
      const res = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setLoading(false);
      });
      sub = res?.data;
      supabase.auth.getSession().then(({ data }) => {
        setSession(data?.session ?? null);
        setLoading(false);
      }).catch((e) => {
        console.warn("getSession warn:", e);
        setLoading(false);
      });
    } catch (e) {
      console.warn("useSession warn:", e);
      setLoading(false);
    }
    return () => {
      try {
        sub?.subscription?.unsubscribe();
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;

    const deviceId = getDeviceId();
    let signedOut = false;
    const checkActiveDevice = async () => {
      if (signedOut) return;
      const { data, error } = await supabase
        .from("active_device_sessions")
        .select("device_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!error && data && data.device_id !== deviceId) {
        signedOut = true;
        await supabase.auth.signOut({ scope: "local" });
        toast.error("Aap is device se logout ho gaye hain, kyunki account doosre device par login hua hai.");
      }
    };

    void checkActiveDevice();
    const channel = supabase
      .channel(`single-device-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_device_sessions", filter: `user_id=eq.${session.user.id}` },
        () => void checkActiveDevice(),
      )
      .subscribe();
    const interval = window.setInterval(() => void checkActiveDevice(), 5000);

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  return { session, loading };
}

export async function fetchMe(userId: string) {
  const [{ data: profile, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (pErr) throw pErr;
  if (rErr) throw rErr;
  return {
    profile: (profile as Profile | null) ?? null,
    role: (roles?.[0]?.role ?? null) as AppRole | null,
  };
}

export function useMe(userId: string | undefined) {
  return useQuery({
    queryKey: ["me", userId],
    enabled: !!userId,
    queryFn: () => fetchMe(userId as string),
  });
}
