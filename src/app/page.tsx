import Link from "next/link";
import {
  Film,
  Users,
  Clapperboard,
  Star,
  ArrowRight,
  CheckCircle2,
  Search,
  Briefcase,
  MessageSquare,
  Shield,
  TrendingUp,
  Play,
  Mic2,
  Camera,
  Video,
  Music2,
  Palette,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { value: "50,000+", label: "Verified Profiles" },
  { value: "8,200+", label: "Projects Posted" },
  { value: "1,40,000+", label: "Successful Hires" },
  { value: "4.9★", label: "Platform Rating" },
];

const roles = [
  {
    icon: Mic2,
    title: "Actors & Talent",
    desc: "Actors, models, voice artists, child artists",
    count: "18,400+",
    color: "from-amber-500/20 to-orange-600/5",
    border: "border-amber-500/20",
  },
  {
    icon: Camera,
    title: "Crew & Technicians",
    desc: "DOP, editors, sound, VFX, makeup, art dept.",
    count: "12,600+",
    color: "from-blue-500/20 to-indigo-600/5",
    border: "border-blue-500/20",
  },
  {
    icon: Film,
    title: "Production Houses",
    desc: "Film, OTT, ad production companies",
    count: "2,100+",
    color: "from-purple-500/20 to-violet-600/5",
    border: "border-purple-500/20",
  },
  {
    icon: Briefcase,
    title: "Agencies",
    desc: "Talent management & casting agencies",
    count: "840+",
    color: "from-rose-500/20 to-red-600/5",
    border: "border-rose-500/20",
  },
  {
    icon: Music2,
    title: "Brands",
    desc: "Brands looking for talent for campaigns",
    count: "1,200+",
    color: "from-teal-500/20 to-cyan-600/5",
    border: "border-teal-500/20",
  },
  {
    icon: Palette,
    title: "Content Creators",
    desc: "YouTubers, influencers, digital creators",
    count: "9,800+",
    color: "from-green-500/20 to-emerald-600/5",
    border: "border-green-500/20",
  },
];

const features = [
  {
    icon: Search,
    title: "Smart Talent Discovery",
    desc: "Filter by role, gender, age, location, language, budget, and availability. Find exactly who you need.",
  },
  {
    icon: Video,
    title: "Audition System",
    desc: "Post auditions, receive self-tapes, shortlist candidates, and schedule callbacks — all in one place.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    desc: "Direct and group chats, file sharing, and project rooms. Never lose track of a conversation.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    desc: "KYC verification, video introductions, and portfolio authenticity checks build trust on every hire.",
  },
  {
    icon: Clapperboard,
    title: "Project Management",
    desc: "Scene manager, shooting schedule, crew assignments, and auto-generated call sheets.",
  },
  {
    icon: TrendingUp,
    title: "Profile Analytics",
    desc: "Track profile views, audition rates, earnings, and audience reach with real-time dashboards.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    desc: "Sign up as Talent, Crew, Production House, Agency, or Brand. Build your showcase in minutes.",
  },
  {
    step: "02",
    title: "Get Discovered",
    desc: "Your public profile gets indexed on Google. Casting directors and producers find you directly.",
  },
  {
    step: "03",
    title: "Apply or Post",
    desc: "Apply to matching projects with one click, or post your own project and receive applications.",
  },
  {
    step: "04",
    title: "Hire & Collaborate",
    desc: "Confirm bookings, sign digital contracts, chat in project rooms, and manage productions.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Actor, Mumbai",
    text: "Got 3 ad campaigns within my first month. The discovery system actually works — producers found me without me even applying.",
    avatar: "P",
    rating: 5,
  },
  {
    name: "Vikram Nair",
    role: "Director of Photography",
    text: "I've hired 12 crew members through CineConnect for my last two projects. The quality is unmatched and the process is seamless.",
    avatar: "V",
    rating: 5,
  },
  {
    name: "Rekha Studios",
    role: "Production House, Hyderabad",
    text: "The audition panel saved us weeks of back-and-forth. We shortlisted 40 actors in a day. Incredible platform.",
    avatar: "R",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect to get started",
    features: [
      "Public profile",
      "Apply to 5 projects/month",
      "Basic search access",
      "Direct messaging",
      "Portfolio (5 items)",
    ],
    cta: "Start Free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    desc: "For serious professionals",
    features: [
      "Everything in Free",
      "Unlimited applications",
      "Profile boost in search",
      "Advanced analytics",
      "Unlimited portfolio",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/register?plan=pro",
    highlight: true,
  },
  {
    name: "Studio",
    price: "₹5,000",
    period: "per month",
    desc: "For production houses",
    features: [
      "Everything in Pro",
      "Production management tools",
      "Call sheet generator",
      "Team collaboration",
      "Agency roster tools",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlight: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
          {/* Film strip decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 film-strip opacity-30" />
          <div className="absolute bottom-0 left-0 right-0 h-1 film-strip opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            India&apos;s #1 Film & Production Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Where{" "}
            <span className="gold-text">Talent</span>{" "}
            Meets{" "}
            <span className="gold-text">Opportunity</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect actors, crew, directors, and production houses. Post
            projects, run auditions, hire the best — all in one professional
            platform built for Indian cinema.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold text-base hover:opacity-90 transition-opacity gold-glow"
            >
              Join Free — Get Discovered
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discover"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold text-base hover:bg-white/10 transition-colors"
            >
              <Play className="w-4 h-4" />
              Browse Talent
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gold-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Everyone in the Industry
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you&apos;re in front of the camera or behind it, CineConnect
              has a space for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Link
                key={role.title}
                href={`/discover?role=${role.title.toLowerCase().replace(/ /g, "-")}`}
                className={`group p-6 rounded-2xl border ${role.border} bg-gradient-to-br ${role.color} hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <role.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {role.count}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {role.title}
                </h3>
                <p className="text-sm text-muted-foreground">{role.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gold-text">Hire & Get Hired</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete end-to-end platform from auditions to call sheets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 hover:bg-white/3 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get started in minutes. No complex setup. Just results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-white/15 to-transparent z-0" />
                )}
                <div className="relative z-10 p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <div className="text-4xl font-black gold-text mb-4 opacity-40">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by the Industry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free. Upgrade when you&apos;re ready to grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
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
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black gold-text">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
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

      {/* CTA Banner */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-12 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Break Into the Industry?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join 50,000+ professionals already building their careers on
                CineConnect. Free forever to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity gold-glow"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/discover"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold hover:bg-white/10 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Browse Talent
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
