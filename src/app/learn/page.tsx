import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  GraduationCap, Play, BookOpen, Video, Mic2, Camera, Film,
  ArrowRight, Star, Clock, Users, CheckCircle2, ChevronRight,
  Palette, Music2, Award, TrendingUp,
} from "lucide-react";

const categories = [
  { icon: Mic2, label: "Acting", count: 48, color: "from-amber-500/20 to-orange-600/5", border: "border-amber-500/20" },
  { icon: Camera, label: "Cinematography", count: 32, color: "from-blue-500/20 to-indigo-600/5", border: "border-blue-500/20" },
  { icon: Film, label: "Directing", count: 27, color: "from-purple-500/20 to-violet-600/5", border: "border-purple-500/20" },
  { icon: Video, label: "Editing & Post", count: 41, color: "from-rose-500/20 to-red-600/5", border: "border-rose-500/20" },
  { icon: Music2, label: "Sound Design", count: 19, color: "from-teal-500/20 to-cyan-600/5", border: "border-teal-500/20" },
  { icon: Palette, label: "Production Design", count: 15, color: "from-green-500/20 to-emerald-600/5", border: "border-green-500/20" },
];

const featuredCourses = [
  {
    title: "The Method Acting Masterclass",
    instructor: "Naseer Usman",
    instructorRole: "Veteran Theatre & Film Actor",
    level: "Intermediate",
    duration: "6h 40m",
    lessons: 24,
    rating: 4.9,
    reviews: 1240,
    category: "Acting",
    desc: "Deep dive into Stanislavski, Meisner, and modern psychological approaches to character building.",
    badge: "Bestseller",
  },
  {
    title: "DOP Essentials: Lighting for Drama",
    instructor: "Ravi Chandran",
    instructorRole: "Award-winning Cinematographer",
    level: "Advanced",
    duration: "8h 15m",
    lessons: 31,
    rating: 4.8,
    reviews: 890,
    category: "Cinematography",
    desc: "Master natural light, motivated artificial light, and create a distinct visual language for dramatic storytelling.",
    badge: "New",
  },
  {
    title: "Indie Film Producing from Zero",
    instructor: "Shruti Bhatia",
    instructorRole: "Producer, 3 National Award Films",
    level: "Beginner",
    duration: "5h 20m",
    lessons: 18,
    rating: 4.7,
    reviews: 673,
    category: "Producing",
    desc: "From script to screen on a budget. Learn funding, pre-production, scheduling, and distribution basics.",
    badge: null,
  },
  {
    title: "Auditioning for OTT Platforms",
    instructor: "Divya Kapoor",
    instructorRole: "Casting Director, 12 OTT Projects",
    level: "Beginner",
    duration: "3h 10m",
    lessons: 12,
    rating: 4.9,
    reviews: 2100,
    category: "Acting",
    desc: "What OTT casting directors look for, how to prepare a self-tape, and how to stand out in a crowded field.",
    badge: "Trending",
  },
  {
    title: "Non-linear Editing with DaVinci Resolve",
    instructor: "Ajay Suresh",
    instructorRole: "Editor — 15+ Feature Films",
    level: "Intermediate",
    duration: "7h 45m",
    lessons: 28,
    rating: 4.8,
    reviews: 540,
    category: "Editing & Post",
    desc: "Professional editing workflows, color grading, and audio mixing inside DaVinci Resolve 19.",
    badge: null,
  },
  {
    title: "Set Photography & BTS Filmmaking",
    instructor: "Meera Pillai",
    instructorRole: "Unit Stills Photographer",
    level: "Beginner",
    duration: "2h 50m",
    lessons: 10,
    rating: 4.6,
    reviews: 310,
    category: "Photography",
    desc: "Capture compelling behind-the-scenes content, work on set professionally, and build a portfolio.",
    badge: null,
  },
];

const benefits = [
  "Learn from working film industry professionals",
  "Industry-recognized certificates on completion",
  "Lifetime access to all purchased courses",
  "Download videos for offline viewing",
  "Q&A access to instructors",
  "Exclusive community of 12,000+ learners",
];

const instructors = [
  { name: "Naseer Usman", role: "Actor & Acting Coach", students: "8,400+", courses: 3, avatar: "N" },
  { name: "Ravi Chandran", role: "Cinematographer", students: "5,200+", courses: 2, avatar: "R" },
  { name: "Shruti Bhatia", role: "Film Producer", students: "3,100+", courses: 4, avatar: "S" },
  { name: "Divya Kapoor", role: "Casting Director", students: "11,000+", courses: 2, avatar: "D" },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-green-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <GraduationCap className="w-3.5 h-3.5" />
            CineConnect Learning Hub
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Learn from India&apos;s{" "}
            <span className="gold-text">Top Filmmakers</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            200+ professional courses in acting, cinematography, direction, editing, and more.
            Built for aspiring and working film professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold text-base hover:opacity-90 transition-opacity gold-glow"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#courses"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold text-base hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "200+", l: "Courses" },
              { v: "42", l: "Expert Instructors" },
              { v: "12,000+", l: "Enrolled Students" },
              { v: "4.8★", l: "Avg. Rating" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gold-text mb-1">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore by Craft</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={`/learn?category=${c.label.toLowerCase()}`}
                className={`group p-5 rounded-2xl border ${c.border} bg-gradient-to-br ${c.color} hover:bg-white/5 transition-all hover:-translate-y-0.5 text-center`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <c.icon className="w-5 h-5 text-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.count} courses</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Featured Courses</h2>
              <p className="text-muted-foreground">Handpicked by our editorial team</p>
            </div>
            <Link href="/learn/all" className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <div
                key={course.title}
                className="group rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 transition-all overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-[oklch(0.07_0_0)] flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-black ml-0.5" />
                  </div>
                  {course.badge && (
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      course.badge === "Bestseller" ? "bg-amber-500 text-black" :
                      course.badge === "New" ? "bg-blue-500 text-white" :
                      "bg-rose-500 text-white"
                    }`}>
                      {course.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 text-xs text-muted-foreground bg-black/60 px-2 py-0.5 rounded-md">
                    {course.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-primary mb-1">{course.instructor}</p>
                  <p className="text-xs text-muted-foreground mb-3">{course.desc}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" />{course.lessons} lessons</span>
                    <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">{course.level}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-sm font-semibold text-foreground">{course.rating}</span>
                      <span className="text-xs text-muted-foreground">({course.reviews.toLocaleString()})</span>
                    </div>
                    <Link
                      href="/register"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Enroll Free <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Learn on <span className="gold-text">CineConnect</span>?
              </h2>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, label: "Certified Courses", val: "200+" },
                { icon: Users, label: "Active Learners", val: "12K+" },
                { icon: TrendingUp, label: "Career Placements", val: "840+" },
                { icon: Star, label: "Avg. Rating", val: "4.8★" },
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] text-center">
                  <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-black" />
                  </div>
                  <div className="text-2xl font-black gold-text mb-1">{item.val}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Instructors */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet the Instructors</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Working professionals sharing real industry knowledge.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((inst) => (
              <div key={inst.name} className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] text-center hover:border-primary/20 transition-all">
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-black font-black text-2xl mx-auto mb-4">
                  {inst.avatar}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{inst.name}</h3>
                <p className="text-xs text-primary mb-3">{inst.role}</p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span>{inst.students} students</span>
                  <span>{inst.courses} courses</span>
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Your Filmmaking Journey</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join 12,000+ students learning from India&apos;s best. First course free.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity gold-glow"
              >
                <GraduationCap className="w-4 h-4" />
                Enroll Now — Free
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
