"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  User, Lock, Bell, Shield, Palette, LogOut, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, MapPin, Languages, Camera,
  IndianRupee, Link as LinkIcon,
} from "lucide-react";

const indianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Kochi", "Jaipur", "Remote",
];
const languages = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu"];

type Tab = "profile" | "security" | "notifications" | "privacy";

export default function SettingsPage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile form
  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    languages: [] as string[],
    skills: [] as string[],
    niche: "",
    rateMin: "",
    rateMax: "",
    availability: "available",
    showreel: "",
  });

  // Security form
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    applications: true,
    messages: true,
    contracts: true,
    shortlisted: true,
    marketing: false,
    email: true,
    push: false,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfile({
        bio: user.bio || "",
        location: user.location || "",
        languages: user.languages || [],
        skills: user.skills || [],
        niche: user.niche || "",
        rateMin: user.rateMin?.toString() || "",
        rateMax: user.rateMax?.toString() || "",
        availability: user.availability || "available",
        showreel: user.showreel || "",
      });
    }
  }, [user]);

  const toggleItem = (key: "languages" | "skills", val: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val],
    }));
  };

  const showFeedback = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(""); }
    else { setSuccess(msg); setError(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        bio: profile.bio,
        location: profile.location,
        languages: profile.languages,
        skills: profile.skills,
        niche: profile.niche,
        availability: profile.availability,
        showreel: profile.showreel,
      };
      if (profile.rateMin) payload.rateMin = Number(profile.rateMin);
      if (profile.rateMax) payload.rateMax = Number(profile.rateMax);

      const r = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) { const d = await r.json(); showFeedback(d.error || "Failed to save", true); return; }
      await refreshUser();
      showFeedback("Profile updated successfully!");
    } catch {
      showFeedback("Network error", true);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!security.currentPassword || !security.newPassword) { showFeedback("All password fields are required", true); return; }
    if (security.newPassword !== security.confirmPassword) { showFeedback("New passwords do not match", true); return; }
    if (security.newPassword.length < 8) { showFeedback("New password must be at least 8 characters", true); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: security.currentPassword, newPassword: security.newPassword }),
      });
      const d = await r.json();
      if (!r.ok) { showFeedback(d.error || "Failed to change password", true); return; }
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showFeedback("Password changed successfully!");
    } catch {
      showFeedback("Network error", true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "security" as Tab, label: "Security", icon: Lock },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "privacy" as Tab, label: "Privacy", icon: Shield },
  ];

  const talentSkills = [
    "Lead Actor", "Supporting Actor", "Child Artist", "Voice Artist",
    "Model", "Dancer", "Comedian", "Stage Actor", "TV Actor",
    "Brand Ambassador", "Stunt Performer", "Director of Photography",
    "Film Editor", "Sound Designer", "VFX Artist", "Screenwriter",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile, security, and preferences.</p>
        </div>

        {/* Feedback */}
        {success && (
          <div className="mb-5 flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-6 flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-52 shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors whitespace-nowrap mt-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Avatar */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Camera className="w-4 h-4 text-primary" />Profile Photo</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-xl shrink-0">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{user.role} · {user.email}</p>
                      <button className="text-xs text-primary hover:underline mt-1.5">Upload new photo (coming soon)</button>
                    </div>
                  </div>
                </div>

                {/* Basic info */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" />Basic Info</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell productions about your experience..."
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{profile.bio.length}/300</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5"><MapPin className="w-3 h-3 inline mr-1" />Location</label>
                      <select
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/50"
                      >
                        <option value="">Select city</option>
                        {indianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Languages className="w-3 h-3 inline mr-1" />Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((l) => (
                          <button key={l} type="button" onClick={() => toggleItem("languages", l)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${profile.languages.includes(l) ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-4">Skills & Specialization</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {talentSkills.map((s) => (
                          <button key={s} type="button" onClick={() => toggleItem("skills", s)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${profile.skills.includes(s) ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Niche / Speciality</label>
                      <input
                        type="text"
                        value={profile.niche}
                        onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                        placeholder="e.g. Bollywood Films, OTT Series, Ad Films..."
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Rate & Availability */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-primary" />Rate & Availability</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Day Rate (INR)</label>
                      <div className="flex items-center gap-3">
                        <input type="number" placeholder="Min ₹" value={profile.rateMin} onChange={(e) => setProfile({ ...profile, rateMin: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                        <span className="text-muted-foreground">—</span>
                        <input type="number" placeholder="Max ₹" value={profile.rateMax} onChange={(e) => setProfile({ ...profile, rateMax: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Availability Status</label>
                      <div className="flex gap-2">
                        {[
                          { id: "available", label: "Available", color: "text-green-400 border-green-500/30 bg-green-500/10" },
                          { id: "busy", label: "Busy", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
                          { id: "unavailable", label: "On Break", color: "text-red-400 border-red-500/30 bg-red-500/10" },
                        ].map((opt) => (
                          <button key={opt.id} type="button" onClick={() => setProfile({ ...profile, availability: opt.id })}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${profile.availability === opt.id ? opt.color : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Showreel */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" />Showreel Link</h2>
                  <input
                    type="url"
                    value={profile.showreel}
                    onChange={(e) => setProfile({ ...profile, showreel: e.target.value })}
                    placeholder="YouTube / Vimeo link to your showreel"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
                  />
                </div>

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Change Password</h2>
                  <p className="text-xs text-muted-foreground mb-4">Use a strong password you don&apos;t use elsewhere.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Current Password</label>
                      <div className="relative">
                        <input type={showCurrent ? "text" : "password"} value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} placeholder="••••••••" className="w-full px-4 py-3 pr-10 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Password</label>
                      <div className="relative">
                        <input type={showNew ? "text" : "password"} value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} placeholder="Min 8 characters" className="w-full px-4 py-3 pr-10 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
                      <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} placeholder="Repeat new password" className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm" />
                    </div>
                  </div>
                  <button onClick={changePassword} disabled={saving} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />Active Sessions</h2>
                  <div className="p-3 rounded-xl bg-white/3 border border-white/8 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Current Session</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Browser · Active now</p>
                    </div>
                    <span className="text-xs text-green-400 font-medium">Active</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-red-500/10 bg-red-500/5">
                  <h2 className="text-sm font-semibold text-foreground mb-1">Danger Zone</h2>
                  <p className="text-xs text-muted-foreground mb-3">Once deleted, your account cannot be recovered.</p>
                  <button className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: "applications", label: "Application Updates", desc: "When your application status changes" },
                    { key: "shortlisted", label: "Shortlisted / Selected", desc: "When a producer shortlists or selects you" },
                    { key: "messages", label: "New Messages", desc: "When you receive a direct message" },
                    { key: "contracts", label: "Contracts", desc: "Contract sent, signed, or payment updates" },
                    { key: "marketing", label: "Platform Updates", desc: "New features, tips, and announcements" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifPrefs((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                        className={`w-10 h-6 rounded-full transition-colors relative ${notifPrefs[item.key as keyof typeof notifPrefs] ? "gold-gradient" : "bg-white/10"}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifPrefs[item.key as keyof typeof notifPrefs] ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Delivery Channels</p>
                    {[
                      { key: "email", label: "Email Notifications", desc: `Sent to ${user.email}` },
                      { key: "push", label: "Push Notifications", desc: "Browser / mobile push (coming soon)" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifPrefs((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                          className={`w-10 h-6 rounded-full transition-colors relative ${notifPrefs[item.key as keyof typeof notifPrefs] ? "gold-gradient" : "bg-white/10"}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifPrefs[item.key as keyof typeof notifPrefs] ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => showFeedback("Notification preferences saved!")} className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Profile Visibility</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Show profile in discovery", desc: "Appear in search results for producers" },
                      { label: "Show my rate range", desc: "Display your day rate on your public profile" },
                      { label: "Allow direct messages", desc: "Let anyone on the platform message you" },
                      { label: "Show my contact info", desc: "Display email/phone to verified users" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button className="w-10 h-6 rounded-full gold-gradient relative">
                          <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <h2 className="text-sm font-semibold text-foreground mb-2">Account Info</h2>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>User ID</span><span className="font-mono text-foreground/60">{user._id}</span></div>
                    <div className="flex justify-between"><span>Role</span><span className="capitalize text-foreground">{user.role}</span></div>
                    <div className="flex justify-between"><span>Plan</span><span className="capitalize text-foreground">{user.plan || "Free"}</span></div>
                    <div className="flex justify-between"><span>Verified</span><span className={user.isVerified ? "text-green-400" : "text-muted-foreground"}>{user.isVerified ? "Yes" : "Pending"}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
