"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film, ArrowRight, ArrowLeft, Chrome,
  Mic2, Camera, Clapperboard, Briefcase, Building2, Youtube, Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const roles = [
  { id: "talent", icon: Mic2, title: "Actor / Talent", desc: "Actor, model, voice artist, dancer, comedian", border: "border-amber-500/20 hover:border-amber-500/50", active: "border-amber-500 bg-amber-500/10" },
  { id: "crew", icon: Camera, title: "Crew / Technician", desc: "DOP, editor, sound, VFX, makeup, art dept", border: "border-blue-500/20 hover:border-blue-500/50", active: "border-blue-500 bg-blue-500/10" },
  { id: "producer", icon: Clapperboard, title: "Director / Writer", desc: "Film director, ad director, screenwriter", border: "border-purple-500/20 hover:border-purple-500/50", active: "border-purple-500 bg-purple-500/10" },
  { id: "producer", icon: Building2, title: "Production House", desc: "Film, OTT, ad production company", border: "border-rose-500/20 hover:border-rose-500/50", active: "border-rose-500 bg-rose-500/10" },
  { id: "agency", icon: Briefcase, title: "Talent Agency", desc: "Casting or talent management agency", border: "border-teal-500/20 hover:border-teal-500/50", active: "border-teal-500 bg-teal-500/10" },
  { id: "brand", icon: Youtube, title: "Content Creator / Brand", desc: "YouTuber, influencer, digital content", border: "border-green-500/20 hover:border-green-500/50", active: "border-green-500 bg-green-500/10" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await register(form.name, form.email, form.password, selectedRole);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
            <Film className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold gold-text">CineConnect</span>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s < step ? "gold-gradient text-black" : s === step ? "border-2 border-primary text-primary" : "border border-white/20 text-muted-foreground"}`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-16 h-px transition-colors ${s < step ? "bg-primary" : "bg-white/15"}`} />}
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl border border-white/10 bg-[oklch(0.10_0_0)]">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Who are you?</h1>
              <p className="text-sm text-muted-foreground mb-8">Choose your primary role. You can add more later.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {roles.map((role, i) => (
                  <button
                    key={`${role.id}-${i}`}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${selectedRole === role.id && roles.findIndex(r => r.id === selectedRole) === i ? role.active : `border-white/10 bg-white/3 ${role.border}`}`}
                  >
                    <div className="flex items-start gap-3">
                      <role.icon className="w-5 h-5 mt-0.5 text-foreground shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{role.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{role.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-6">
                <ArrowLeft className="w-4 h-4" /> Change role
              </button>

              <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Joining as <span className="text-primary font-medium">{roles.find((r) => r.id === selectedRole)?.title}</span>
              </p>

              <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium mb-6">
                <Chrome className="w-4 h-4" /> Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input type="text" placeholder="Priya Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <div className="flex gap-2">
                    <span className="px-3 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground">+91</span>
                    <input type="tel" placeholder="98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <input type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" required minLength={8} />
                </div>
                <p className="text-xs text-muted-foreground">
                  By creating an account you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Creating account..." : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
