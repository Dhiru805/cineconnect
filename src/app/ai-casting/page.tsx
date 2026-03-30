"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bot, Sparkles, Search, Users, Mic2, Camera, Film, CheckCircle2,
  ArrowRight, Star, Zap, Filter, ChevronRight, Play, Upload,
  MessageSquare, BarChart3, Clock, Target,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Role Matching",
    desc: "Describe the role in plain language. Our AI scans 50,000+ profiles and surfaces the top candidates with match scores.",
  },
  {
    icon: Mic2,
    title: "Automated Shortlisting",
    desc: "AI reviews self-tape submissions, scores performance, consistency, and screen presence — saving you 80% of review time.",
  },
  {
    icon: MessageSquare,
    title: "Casting Brief Generator",
    desc: "Type a rough idea. AI generates a professional casting brief with role description, look requirements, and ideal profile.",
  },
  {
    icon: BarChart3,
    title: "Bias-Free Analysis",
    desc: "Standardized scoring criteria ensure every candidate is evaluated on the same objective metrics.",
  },
  {
    icon: Target,
    title: "Look & Fit Detection",
    desc: "AI analyzes portfolio images and video to match physical characteristics to your role requirements.",
  },
  {
    icon: Zap,
    title: "Instant Availability Check",
    desc: "Cross-references talent schedules in real time. Only shows you candidates actually available for your shoot dates.",
  },
];

const useCases = [
  {
    role: "Lead Actor — Drama Series",
    brief: "Male, 28–35, fluent Hindi & Tamil, intense screen presence",
    matches: 47,
    topMatch: "Arjun Kapoor",
    score: 94,
  },
  {
    role: "Brand Ambassador — Tech Ad",
    brief: "Female, 22–30, urban look, confident, English fluency",
    matches: 128,
    topMatch: "Ananya Singh",
    score: 97,
  },
  {
    role: "DOP — Independent Feature",
    brief: "Experienced DOP, natural light specialist, Malayalam film background",
    matches: 22,
    topMatch: "Rahul Menon",
    score: 91,
  },
];

const steps = [
  {
    n: "01",
    title: "Describe Your Role",
    desc: "Type a brief or paste your script breakdown. No special format needed — plain language works.",
  },
  {
    n: "02",
    title: "AI Generates Candidates",
    desc: "Within seconds, AI returns ranked matches with match score, profile highlights, and availability.",
  },
  {
    n: "03",
    title: "Review & Shortlist",
    desc: "Browse AI-curated profiles, watch showreels, and shortlist with one click.",
  },
  {
    n: "04",
    title: "Invite & Audition",
    desc: "Send automated audition invites. AI can pre-screen self-tapes before you review.",
  },
];

const testimonials = [
  {
    name: "Deepak Shetty",
    role: "Casting Director, Mumbai",
    text: "What used to take my team 3 days to shortlist now takes 2 hours. The match scores are incredibly accurate.",
    rating: 5,
    avatar: "D",
  },
  {
    name: "Prerna Malhotra",
    role: "Ad Film Producer",
    text: "Found the perfect brand ambassador in under 30 minutes. The AI understood the 'vibe' I was looking for.",
    rating: 5,
    avatar: "P",
  },
  {
    name: "Karthik Rajan",
    role: "OTT Series Director",
    text: "The self-tape screening alone saved us weeks of work. We went from 200 auditions to a shortlist of 12 in a day.",
    rating: 5,
    avatar: "K",
  },
];

export default function AICastingPage() {
  const [brief, setBrief] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brief.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm font-medium mb-8">
            <Bot className="w-3.5 h-3.5" />
            AI-Powered Casting
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Cast Smarter with{" "}
            <span className="gold-text">AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your role in plain language. Our AI matches, ranks, and shortlists
            the best talent from 50,000+ verified profiles — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold text-base hover:opacity-90 transition-opacity gold-glow"
            >
              <Sparkles className="w-4 h-4" />
              Try AI Casting Free
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold text-base hover:bg-white/10 transition-colors"
            >
              <Play className="w-4 h-4" />
              See It in Action
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "50K+", l: "Searchable Profiles" },
              { v: "94%", l: "Match Accuracy" },
              { v: "80%", l: "Time Saved" },
              { v: "2 hrs", l: "Avg. Shortlist Time" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gold-text mb-1">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Try It <span className="gold-text">Right Now</span>
            </h2>
            <p className="text-muted-foreground">Describe a role and see AI matching in action</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-white/10 bg-[oklch(0.10_0_0)]">
              <label className="block text-sm font-medium text-foreground mb-3">
                Describe the role you&apos;re casting for
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder={`E.g. "Female actor, 24–32, South Indian look, fluent in Tamil and English, strong emotional range, for lead role in drama web series"`}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[oklch(0.07_0_0)] text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary/50 resize-none"
              />
              <div className="flex flex-wrap gap-2 mt-3 mb-6">
                {["Lead Actor", "Supporting Role", "Brand Ambassador", "Crew / DOP", "Voice Artist"].map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setBrief(`Looking for a ${tag.toLowerCase()} — `)}
                    className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!brief.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Find Matching Talent
              </button>
            </form>
          ) : (
            <div className="p-8 rounded-3xl border border-primary/20 bg-[oklch(0.10_0_0)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Analysis Complete</p>
                  <p className="text-xs text-muted-foreground">Scanning 50,000+ profiles...</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/8 bg-[oklch(0.07_0_0)] mb-6">
                <p className="text-xs text-muted-foreground mb-1">Your brief</p>
                <p className="text-sm text-foreground">{brief}</p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { name: "Priya Sharma", role: "Actor", loc: "Mumbai", score: 97 },
                  { name: "Ananya Nair", role: "Actor & Model", loc: "Chennai", score: 94 },
                  { name: "Divya Menon", role: "Actor", loc: "Bangalore", score: 91 },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-[oklch(0.12_0_0)]">
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold shrink-0">
                      {r.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.role} · {r.loc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black gold-text">{r.score}%</div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  View All 47 Matches
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => { setBrief(""); setSubmitted(false); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors"
                >
                  Try Another Role
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything AI Can Do for <span className="gold-text">Your Casting</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-white/15 to-transparent z-0" />
                )}
                <div className="relative z-10 p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <div className="text-4xl font-black gold-text mb-4 opacity-40">{s.n}</div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Case Examples */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Real Casting Scenarios
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See how casting directors are using AI to find the right talent.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((u) => (
              <div key={u.role} className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                <div className="text-xs text-primary font-medium mb-2 uppercase tracking-wide">Role</div>
                <h3 className="font-bold text-foreground mb-2">{u.role}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{u.brief}&rdquo;</p>
                <div className="border-t border-white/8 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Top Match</p>
                    <p className="text-sm font-semibold text-foreground">{u.topMatch}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black gold-text">{u.score}%</div>
                    <div className="text-xs text-muted-foreground">{u.matches} candidates</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Casting Directors Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-12 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start Casting with AI Today
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Free to try. No credit card required. Find your first match in under 60 seconds.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity gold-glow"
              >
                <Sparkles className="w-4 h-4" />
                Try AI Casting Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
