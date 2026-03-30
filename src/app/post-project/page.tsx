"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";

const steps = ["Project Info", "Roles Needed", "Requirements", "Review & Post"];

const projectTypes = [
  { id: "film", label: "Feature Film" },
  { id: "ott", label: "OTT / Web Series" },
  { id: "ad", label: "Ad Film / TVC" },
  { id: "youtube", label: "YouTube / Digital" },
  { id: "short", label: "Short Film" },
  { id: "corporate", label: "Corporate Film" },
  { id: "music", label: "Music Video" },
  { id: "documentary", label: "Documentary" },
];

const indianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Kochi", "Remote",
];

const languages = ["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Gujarati", "Punjabi"];

const roleOptions = [
  "Lead Actor", "Supporting Actor", "Character Actor", "Child Artist",
  "Director of Photography", "Film Editor", "Sound Designer", "Music Composer",
  "VFX Artist", "Art Director", "Costume Designer", "Makeup Artist",
  "Screenwriter", "Casting Director", "Production Designer", "Stunt Performer",
];

export default function PostProjectPage() {
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    location: "",
    languages: [] as string[],
    budgetMin: "",
    budgetMax: "",
    duration: "",
    deadline: "",
    requirements: "",
    experience: "",
    isAudition: false,
  });
  const { user } = useAuth();
  const router = useRouter();

  const toggleLang = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const addRole = (role: string) => {
    if (!roles.includes(role)) setRoles([...roles, role]);
  };

  const removeRole = (role: string) => {
    setRoles(roles.filter((r) => r !== role));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Post a Project</h1>
          <p className="text-sm text-muted-foreground mt-1">Reach 50,000+ verified professionals. Free to post.</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "gold-gradient text-black" : i === step ? "border-2 border-primary text-primary" : "border border-white/20 text-muted-foreground"}`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[oklch(0.10_0_0)]">
          {/* Step 0 — Project Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Basic Project Information</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Project Title *</label>
                <input type="text" placeholder="e.g. Lead Actor — Hindi Feature Film" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Project Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {projectTypes.map((t) => (
                    <button key={t.id} onClick={() => setForm({ ...form, type: t.id })} className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${form.type === t.id ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
                <textarea placeholder="Describe the project, storyline, mood, and what you're looking for..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />Location *
                  </label>
                  <div className="relative">
                    <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full pl-3 pr-8 py-3 rounded-xl border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40 appearance-none">
                      <option value="">Select location</option>
                      {indianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Shoot Duration</label>
                  <input type="text" placeholder="e.g. 30 shoot days" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => toggleLang(lang)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${form.languages.includes(lang) ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25"}`}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Roles */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Roles You&apos;re Hiring For</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Roles</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {roleOptions.map((role) => (
                    <button key={role} onClick={() => addRole(role)} disabled={roles.includes(role)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${roles.includes(role) ? "border-primary/30 bg-primary/10 text-primary/50 cursor-not-allowed" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}>
                      <Plus className="w-3 h-3 inline mr-1" />{role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Add Custom Role</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. Kathak Dancer" value={customRole} onChange={(e) => setCustomRole(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                  <button onClick={() => { if (customRole.trim()) { addRole(customRole.trim()); setCustomRole(""); } }} className="px-4 py-3 rounded-xl gold-gradient text-black font-semibold text-sm">Add</button>
                </div>
              </div>

              {roles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Added Roles ({roles.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <div key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
                        {role}
                        <button onClick={() => removeRole(role)} className="hover:text-primary/60"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/3">
                <input type="checkbox" id="audition" checked={form.isAudition} onChange={(e) => setForm({ ...form, isAudition: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                <div>
                  <label htmlFor="audition" className="text-sm font-medium text-foreground cursor-pointer">Run an Audition</label>
                  <p className="text-xs text-muted-foreground mt-0.5">Collect self-tapes and shortlist candidates through the audition system.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Requirements */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Budget & Requirements</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Budget Range (INR)</label>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Min ₹" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                  <span className="text-muted-foreground">—</span>
                  <input type="number" placeholder="Max ₹" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Application Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Experience Required</label>
                <select value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40">
                  <option value="">Any Experience Level</option>
                  <option value="fresher">Fresher / No experience needed</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                  <option value="senior">Senior / Lead Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Additional Requirements</label>
                <textarea placeholder="Age range, look, physical requirements, specific skills, travel availability, NDA, etc." value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm resize-none" />
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Review Your Posting</h2>

              <div className="space-y-4">
                {[
                  { label: "Title", value: form.title || "Not set" },
                  { label: "Type", value: projectTypes.find((t) => t.id === form.type)?.label || "Not set" },
                  { label: "Location", value: form.location || "Not set" },
                  { label: "Duration", value: form.duration || "Not set" },
                  { label: "Budget", value: form.budgetMin && form.budgetMax ? `₹${form.budgetMin} – ₹${form.budgetMax}` : "Not set" },
                  { label: "Deadline", value: form.deadline || "Not set" },
                  { label: "Roles", value: roles.length ? roles.join(", ") : "Not set" },
                  { label: "Languages", value: form.languages.length ? form.languages.join(", ") : "Not set" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-white/8 last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm text-foreground font-medium text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>

              {form.description && (
                <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{form.description}</p>
                </div>
              )}

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-sm font-medium text-primary mb-1">Ready to publish?</p>
                <p className="text-xs text-muted-foreground">Your project will be visible to all professionals on CineConnect immediately after posting.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
          <div className="flex items-center justify-between mt-4">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

              {step < steps.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={async () => {
                    if (!user) { router.push("/login"); return; }
                    setSubmitting(true);
                    setError("");
                    try {
                      const res = await fetch("/api/projects", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          title: form.title,
                          type: form.type,
                          description: form.description,
                          location: form.location,
                          languages: form.languages,
                          budget: Number(form.budgetMax) || Number(form.budgetMin) || 0,
                          rolesNeeded: roles.map((r) => ({ roleTitle: r, count: 1 })),
                          tags: [form.type, form.location, ...form.languages].filter(Boolean),
                          deadline: form.deadline || undefined,
                          requirements: form.requirements || undefined,
                          isAudition: form.isAudition,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) { setError(data.error || "Failed to post project"); setSubmitting(false); return; }
                      router.push("/projects");
                    } catch {
                      setError("Network error. Please try again.");
                      setSubmitting(false);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : <><span>Publish Project</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
