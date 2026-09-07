import { useRef, useState } from "react";
import { Camera, Fingerprint, KeyRound, Loader2, LogOut, Save, UserCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/lib/session";

export function ProfileSettings({
  profile,
  role,
  onClose,
  onUpdated,
}: {
  profile: Profile;
  role: AppRole;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [category, setCategory] = useState(profile.category ?? "Keyboard");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);

  async function saveProfile() {
    if (name.trim().length < 3) return toast.error("Name mein kam se kam 3 letters hone chahiye.");
    if (phone.trim() && !/^(?:\+?91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ""))) return toast.error("Sahi mobile number enter karein.");
    setSaving(true);
    try {
      const updates: Record<string, string | null> = {
        full_name: name.trim(),
        phone: phone.trim() || null,
      };
      if (role === "artist") {
        updates.bio = bio.trim() || null;
        updates.category = category;
      }
      const { data: refreshed } = await supabase.auth.refreshSession();
      const accessToken = refreshed.session?.access_token;
      if (!accessToken) throw new Error("Kripya dobara login karein.");
      const { data, error } = await supabase.functions.invoke("profile-update", {
        body: updates,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      onUpdated();
      toast.success("Profile save ho gayi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile save nahi hui.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("JPG, PNG ya WEBP photo select karein.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Photo 2 MB se chhoti honi chahiye.");
    setSaving(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${profile.id}/avatar.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
      const { data: refreshed } = await supabase.auth.refreshSession();
      const accessToken = refreshed.session?.access_token;
      if (!accessToken) throw new Error("Kripya dobara login karein.");
      const { data, error } = await supabase.functions.invoke("profile-update", {
        body: { avatar_url: `${publicUrl.publicUrl}?v=${Date.now()}` },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      onUpdated();
      toast.success("Profile photo update ho gayi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload nahi hui.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (currentPassword.length < 6 || newPassword.length < 8) return toast.error("Current password aur 8-character naya password enter karein.");
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password change ho gaya.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password change nahi hua.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function addPasskey() {
    setAddingPasskey(true);
    try {
      const { error } = await supabase.auth.registerPasskey();
      if (error) throw error;
      toast.success("Fingerprint / Face Lock is device par add ho gaya.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Is device par biometric lock add nahi ho paya.");
    } finally {
      setAddingPasskey(false);
    }
  }

  async function signOutOtherDevices() {
    setSigningOutOthers(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      toast.success("Baaki devices se logout ho gaya. Ye device signed in rahega.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Baaki devices se logout nahi hua.");
    } finally {
      setSigningOutOthers(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface px-4 pb-8 pt-5">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-black text-maroon">Profile settings</h1>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"><X className="h-5 w-5" /></button>
        </div>

        <section className="card-sv p-4">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-20 w-20 rounded-2xl object-cover" /> : <UserCircle2 className="h-20 w-20 text-maroon" />}
            <div>
              <p className="font-bold text-maroon">{name || "Your profile"}</p>
              <button onClick={() => inputRef.current?.click()} disabled={saving} className="mt-2 flex items-center gap-1.5 rounded-xl border border-gold/50 px-3 py-2 text-xs font-bold text-maroon"><Camera className="h-4 w-4" /> Photo change karein</button>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
            </div>
          </div>
        </section>

        <section className="card-sv space-y-3 p-4">
          <h2 className="text-lg">Basic details</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-gold" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" inputMode="tel" className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-gold" />
          {role === "artist" && <>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-gold">
              <option>Keyboard</option><option>Tabla</option><option>Octapad</option><option>Banjo</option>
            </select>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio (optional)" className="min-h-20 w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-gold" />
          </>}
          <button onClick={saveProfile} disabled={saving} className="bg-hero flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-warm disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</button>
        </section>

        <section className="card-sv space-y-3 p-4">
          <h2 className="text-lg">Password</h2>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-gold" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (minimum 8)" className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-gold" />
          <button onClick={changePassword} disabled={changingPassword} className="flex w-full items-center justify-center gap-2 rounded-xl border border-maroon/40 py-3 font-bold text-maroon disabled:opacity-60">{changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Password change karein</button>
        </section>

        <section className="card-sv space-y-2 p-4">
          <h2 className="text-lg">Fingerprint / Face Lock</h2>
          <p className="text-xs leading-relaxed text-ink2">Is device ke biometric lock se future sign-in secure hoga. Biometric data app ko kabhi nahi milta.</p>
          <button onClick={addPasskey} disabled={addingPasskey} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/60 py-3 font-bold text-maroon disabled:opacity-60">{addingPasskey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />} Fingerprint / Face Lock add karein</button>
        </section>

        <section className="card-sv space-y-2 p-4">
          <h2 className="text-lg">Device security</h2>
          <p className="text-xs leading-relaxed text-ink2">Agar kisi aur device par account open hai, to use logout kar sakte hain. Is device ka login bana rahega.</p>
          <button onClick={signOutOtherDevices} disabled={signingOutOthers} className="flex w-full items-center justify-center gap-2 rounded-xl border border-maroon/40 py-3 font-bold text-maroon disabled:opacity-60">{signingOutOthers ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Baaki devices se logout</button>
        </section>
      </div>
    </div>
  );
}
