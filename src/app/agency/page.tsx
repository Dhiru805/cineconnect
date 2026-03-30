import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Building2, Users, Briefcase, BarChart3, MessageSquare, Shield,
  ArrowRight, Star, CheckCircle2, Search, Zap, Globe, Clock,
  TrendingUp, FileText, Bell, Lock, ChevronRight, Mic2, Film,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Talent Roster Management",
    desc: "Manage your entire talent roster in one place. Tag by type, availability, rates, and exclusive status.",
  },
  {
    icon: Search,
    title: "Smart Talent Discovery",
    desc: "Search CineConnect's 50,000+ profiles to find and sign new talent. Filter by role, look, language, and more.",
  },
  {
    icon: Briefcase,
    title: "Deals & Contracts",
    desc: "Generate, send, and e-sign contracts digitally. Track deal status, expiry, and renewals automatically.",
  },
  {
    icon: MessageSquare,
    title: "Client Communication Hub",
    desc: "Centralized inbox for producer and casting director inquiries. Never miss a booking request.",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    desc: "Track commissions, booking rates, talent performance, and revenue trends across your entire roster.",
  },
  {
    icon: Bell,
    title: "Booking Alerts",
    desc: "Get instant notifications when producers shortlist or request your talent. Respond faster than competitors.",
  },
  {
    icon: FileText,
    title: "Profile Builder for Talent",
    desc: "Help your talent build standout profiles with media upload, bio editing, and portfolio management.",
  },
  {
    icon: Globe,
    title: "Public Agency Page",
    desc: "A branded agency landing page showcasing your talent, past projects, and contact details.",
  },
  {
    icon: Lock,
    title: "Exclusive Talent Locking",
    desc: "Mark talent as exclusively represented. Prevents direct contact from producers, routing all inquiries to you.",
  },
];

const plans = [
  {
    name: "Starter Agency",
    price: "₹2,000",
    period: "per month",
    desc: "For boutique agencies just getting started",
    features: [
      "Up to 20 talent profiles",
      "Public agency page",
      "Contract management",
      "Basic analytics",
      "Booking notifications",
    ],
    cta: "Start Free Trial",
    href: "/register?plan=agency-starter",
    highlight: false,
  },
  {
    name: "Agency Pro",
    price: "₹7,500",
    period: "per month",
    desc: "For growing agencies managing 100+ talent",
    features: [
      "Unlimited talent profiles",
      "Exclusive talent locking",
      "Advanced revenue analytics",
      "Priority search placement",
      "Bulk contract generation",
      "Dedicated support manager",
    ],
    cta: "Get Agency Pro",
    href: "/register?plan=agency-pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large studios and multi-division agencies",
    features: [
      "Everything in Agency Pro",
      "Custom branding & domain",
      "API access",
      "Multi-team accounts",
      "SLA support",
      "White-label options",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

const agencies = [
  { name: "StarCraft Talent", talent: 84, bookings: "320+", rating: 4.9, avatar: "S" },
  { name: "Frame One Agency", talent: 52, bookings: "180+", rating: 4.8, avatar: "F" },
  { name: "Spotlight Mgmt.", talent: 117, bookings: "510+", rating: 4.9, avatar: "Sp" },
  { name: "Lens & Lens", talent: 29, bookings: "95+", rating: 4.7, avatar: "L" },
];

const testimonials = [
  {
    name: "Kavitha Rao",
    role: "Founder, StarCraft Talent Agency",
    text: "We grew our roster from 12 to 84 talent in 8 months. The contract tools alone saved us 15 hours a week.",
    avatar: "K",
    rating: 5,
  },
  {
    name: "Sanjay Mehta",
    role: "MD, Frame One Agency",
    text: "The booking alert system is a game-changer. We're responding to casting calls 3x faster than before.",
    avatar: "S",
    rating: 5,
  },
  {
    name: "Nisha Krishnan",
    role: "Partner, Spotlight Management",
    text: "Revenue analytics finally gave us visibility into which talent and which clients were actually profitable.",
    avatar: "N",
    rating: 5,
  },
];

export default function AgencyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[600px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Building2 className="w-3.5 h-3.5" />
            Agency Tools
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Run a Smarter{" "}
            <span className="gold-text">Talent Agency</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage your entire roster, handle contracts, track bookings, and grow your agency revenue — 
            all from one professional platform built for Indian talent agencies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register?plan=agency-starter"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold text-base hover:opacity-90 transition-opacity gold-glow"
            >
              <Building2 className="w-4 h-4" />
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold text-base hover:bg-white/10 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Explore Features
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "840+", l: "Agencies on Platform" },
              { v: "32,000+", l: "Talent Under Management" },
              { v: "₹28Cr+", l: "Deals Processed" },
              { v: "4.8★", l: "Agency Rating" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gold-text mb-1">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything Your Agency Needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From talent discovery to deal closure — one platform, zero spreadsheets.
            </p>
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

      {/* Top Agencies */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Top Agencies on CineConnect</h2>
            <p className="text-muted-foreground">Trusted by India&apos;s leading talent agencies</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agencies.map((a) => (
              <div key={a.name} className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 transition-all text-center">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-black font-black text-xl mx-auto mb-4">
                  {a.avatar}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{a.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{a.talent} talent managed</p>
                <div className="flex justify-center gap-4 text-xs">
                  <div>
                    <div className="font-bold text-foreground">{a.bookings}</div>
                    <div className="text-muted-foreground">Bookings</div>
                  </div>
                  <div>
                    <div className="font-bold gold-text">{a.rating}★</div>
                    <div className="text-muted-foreground">Rating</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Agency Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transparent pricing that scales with your agency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-2xl border transition-all ${
                  plan.highlight
                    ? "border-primary/40 bg-primary/5 surface-glow"
                    : "border-white/8 bg-[oklch(0.10_0_0)]"
                }`}
              >
                {plan.highlight && (
                  <div className="inline-block px-3 py-0.5 rounded-full gold-gradient text-black text-xs font-semibold mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black gold-text">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground ml-2">/{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "gold-gradient text-black hover:opacity-90"
                      : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Agencies Say</h2>
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
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-12 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Modernize Your Agency?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                30-day free trial. No credit card required. Full access to all Agency Pro features.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register?plan=agency-starter"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity gold-glow"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold hover:bg-white/10 transition-colors"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
