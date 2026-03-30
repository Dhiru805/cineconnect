"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film, ArrowRight, ArrowLeft, Check,
  MapPin, Languages, Upload, Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const steps = ["Basic Info", "Skills & Niche", "Portfolio", "Preferences"];

const indianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Chandigarh", "Kochi", "Indore", "Bhopal", "Patna",
];

const languages = [
  "Hindi", "English", "Tamil", "Telugu", "Malayalam",
  "Kannada", "Bengali", "Marathi", "Gujarati", "Punjabi", "Odia", "Urdu",
];

const talentSkills = [
  "Lead Actor", "Supporting Actor", "Child Artist", "Voice Artist",
  "Model", "Dancer", "Comedian", "Stage Actor", "TV Actor",
  "Brand Ambassador", "Item Number", "Stunt Performer",
];

const nicheOptions = [
  "Bollywood Films", "South Indian Films", "OTT Series",
  "TV Serials", "Ad Films", "Web Series", "YouTube",
  "Short Films", "Music Videos", "Corporate Films",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    bio: "",
    location: "",
    languages: [] as string[],
    skills: [] as string[],
    niches: [] as string[],
    showreel: "",
    rateMin: "",
    rateMax: "",
    availability: "available",
  });
  const { refreshUser } = useAuth();
  const router = useRouter();

  const toggleItem = (key: "languages" | "skills" | "niches", val: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter((v) => v !== val)
        : [...prev[key], val],
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        bio: data.bio,
        location: data.location,
        languages: data.languages,
        skills: data.skills,
        niche: data.niches.join(", "),
        showreel: data.showreel,
        availability: data.availability,
      };
      if (data.rateMin) payload.rateMin = Number(data.rateMin);
      if (data.rateMax) payload.rateMax = Number(data.rateMax);

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save profile");
        setSaving(false);
        return;
      }
      await refreshUser();
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/4 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-xl">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
            <Film className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold gold-text">CineConnect</span>
        </Link>

        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-4 left-0 right-0 h-px bg-white/10 z-0" />
          {steps.map((label, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "gold-gradient text-black" : i === step ? "border-2 border-primary text-primary bg-background" : "border border-white/20 text-muted-foreground bg-background"}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl border border-white/10 bg-[oklch(0.10_0_0)]">
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Tell us about yourself</h2>
              <p className="text-sm text-muted-foreground mb-6">This appears on your public profile.</p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors bg-white/3">
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Photo</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Profile Photo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG/PNG, max 5MB.</p>
                    <button className="text-xs text-primary hover:underline mt-1">Upload Photo</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                  <textarea
                    placeholder="Tell productions about your experience and specialties..."
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    rows={4}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{data.bio.length}/300</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />Base Location
                  </label>
                  <select
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[oklch(0.10_0_0)] text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  >
                    <option value="">Select city</option>
                    {indianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Languages className="w-3.5 h-3.5 inline mr-1" />Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleItem("languages", lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${data.languages.includes(lang) ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Skills & Niche</h2>
              <p className="text-sm text-muted-foreground mb-6">Help productions find you for the right projects.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {talentSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleItem("skills", skill)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${data.skills.includes(skill) ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Project Types / Niche</label>
                  <div className="flex flex-wrap gap-2">
                    {nicheOptions.map((niche) => (
                      <button
                        key={niche}
                        type="button"
                        onClick={() => toggleItem("niches", niche)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${data.niches.includes(niche) ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Portfolio</h2>
              <p className="text-sm text-muted-foreground mb-6">Showcase your best work.</p>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">Photos, videos — JPG, PNG, MP4 up to 100MB</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square rounded-xl border border-white/10 bg-white/3 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white/10" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">YouTube / Vimeo Showreel</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={data.showreel}
                    onChange={(e) => setData({ ...data, showreel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Preferences</h2>
              <p className="text-sm text-muted-foreground mb-6">Set your availability and rate range.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "available", label: "Available", color: "text-green-400 border-green-500/30 bg-green-500/10" },
                      { id: "busy", label: "Busy", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
                      { id: "unavailable", label: "On Break", color: "text-red-400 border-red-500/30 bg-red-500/10" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setData({ ...data, availability: opt.id })}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${data.availability === opt.id ? opt.color : "border-white/10 text-muted-foreground hover:border-white/20"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Day Rate Range (INR)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={data.rateMin}
                      onChange={(e) => setData({ ...data, rateMin: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={data.rateMax}
                      onChange={(e) => setData({ ...data, rateMax: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <p className="text-sm font-medium text-primary mb-1">You&apos;re all set!</p>
                  <p className="text-xs text-muted-foreground">Your profile will be live and discoverable immediately.</p>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : <>Go to Dashboard <ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Skip for now</Link>
        </p>
      </div>
    </div>
  );
}
