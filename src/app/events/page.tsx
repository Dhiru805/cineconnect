import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar, MapPin, Ticket, Film, Award, Users, ArrowRight,
  Star, Clock, ChevronRight, Globe, Mic2, Camera, Play,
  Filter, TrendingUp,
} from "lucide-react";

const upcomingEvents = [
  {
    title: "Mumbai Film Festival 2026",
    type: "Film Festival",
    date: "Apr 12–20, 2026",
    location: "NCPA, Mumbai",
    category: "festival",
    desc: "India's premier international film festival showcasing global and Indian cinema with competitions, masterclasses, and networking events.",
    attending: 4200,
    badge: "Featured",
    badgeColor: "bg-amber-500 text-black",
  },
  {
    title: "OTT Creator Summit",
    type: "Industry Summit",
    date: "May 3–4, 2026",
    location: "The Leela, Bangalore",
    category: "summit",
    desc: "Two-day summit for OTT creators, producers, and platform decision-makers. Sessions on content strategy, monetization, and co-productions.",
    attending: 1800,
    badge: "New",
    badgeColor: "bg-blue-500 text-white",
  },
  {
    title: "Casting Directors Roundtable",
    type: "Workshop",
    date: "Apr 25, 2026",
    location: "Film City, Mumbai",
    category: "workshop",
    desc: "An intimate session with 8 leading casting directors. Bring your portfolio, participate in cold reads, and get direct feedback.",
    attending: 120,
    badge: "Limited Seats",
    badgeColor: "bg-rose-500 text-white",
  },
  {
    title: "South India Cinematography Awards",
    type: "Awards Night",
    date: "Jun 7, 2026",
    location: "HICC, Hyderabad",
    category: "awards",
    desc: "Annual celebration of excellence in cinematography across Tamil, Telugu, Malayalam, and Kannada cinema.",
    attending: 2100,
    badge: null,
    badgeColor: "",
  },
  {
    title: "Indie Filmmaker Bootcamp",
    type: "Bootcamp",
    date: "May 10–12, 2026",
    location: "Pune Film Institute",
    category: "bootcamp",
    desc: "3-day intensive for aspiring indie directors. Shoot a short film, pitch to producers, and screen at a real showcase.",
    attending: 60,
    badge: "Seats Left: 14",
    badgeColor: "bg-orange-500 text-black",
  },
  {
    title: "Production Design Masterclass",
    type: "Masterclass",
    date: "Apr 18, 2026",
    location: "Online (Live)",
    category: "masterclass",
    desc: "3-hour live session with award-winning production designer Rajiv Nair. Set design, budgeting, and period reconstruction.",
    attending: 380,
    badge: null,
    badgeColor: "",
  },
];

const categories = [
  { label: "All Events", value: "all", icon: Calendar, count: 42 },
  { label: "Festivals", value: "festival", icon: Film, count: 8 },
  { label: "Workshops", value: "workshop", icon: Mic2, count: 14 },
  { label: "Masterclasses", value: "masterclass", icon: Camera, count: 11 },
  { label: "Awards", value: "awards", icon: Award, count: 5 },
  { label: "Bootcamps", value: "bootcamp", icon: TrendingUp, count: 4 },
];

const pastHighlights = [
  { name: "MAMI 2025", attendees: "6,200", films: 140, awards: 12 },
  { name: "IIFA Rocks 2025", attendees: "12,000", films: 0, awards: 35 },
  { name: "IFFI Goa 2025", attendees: "8,400", films: 220, awards: 28 },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[600px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-rose-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <Calendar className="w-3.5 h-3.5" />
            Events &amp; Festivals
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            The Film Industry&apos;s{" "}
            <span className="gold-text">Event Calendar</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover festivals, masterclasses, award nights, workshops, and bootcamps across India.
            Connect with industry insiders at the events that matter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold text-base hover:opacity-90 transition-opacity gold-glow"
            >
              <Ticket className="w-4 h-4" />
              Register &amp; Get Notified
            </Link>
            <a
              href="#events"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold text-base hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Browse Events
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { v: "42", l: "Upcoming Events" },
              { v: "18", l: "Cities" },
              { v: "12,000+", l: "Attendees/Year" },
              { v: "200+", l: "Industry Partners" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gold-text mb-1">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((c) => (
              <button
                key={c.value}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-primary/30 transition-all"
              >
                <c.icon className="w-3.5 h-3.5" />
                {c.label}
                <span className="ml-1 text-xs opacity-60">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Event Listings */}
      <section id="events" className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">April – June 2026</p>
            </div>
            <Link href="/events/all" className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="group rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 transition-all overflow-hidden"
              >
                {/* Visual header */}
                <div className="h-32 bg-gradient-to-br from-[oklch(0.12_0_0)] to-[oklch(0.08_0_0)] flex items-center justify-center relative border-b border-white/5">
                  <Film className="w-10 h-10 text-white/10" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {event.badge && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${event.badgeColor}`}>
                        {event.badge}
                      </span>
                    )}
                  </div>
                  <span className="absolute top-3 right-3 text-xs text-muted-foreground bg-black/60 px-2 py-0.5 rounded-md">
                    {event.type}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{event.desc}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      {event.attending.toLocaleString()} registered
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="block w-full py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-foreground text-center hover:bg-white/10 hover:border-primary/30 transition-colors"
                  >
                    Register / RSVP
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Highlights */}
      <section className="py-24 border-t border-white/8 bg-[oklch(0.07_0_0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">2025 Highlights</h2>
            <p className="text-muted-foreground">Major events CineConnect members attended last year</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastHighlights.map((ph) => (
              <div key={ph.name} className="p-6 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] text-center">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-4">{ph.name}</h3>
                <div className="flex justify-center gap-6">
                  <div>
                    <div className="text-2xl font-black gold-text">{ph.attendees}</div>
                    <div className="text-xs text-muted-foreground">Attendees</div>
                  </div>
                  {ph.films > 0 && (
                    <div>
                      <div className="text-2xl font-black gold-text">{ph.films}</div>
                      <div className="text-xs text-muted-foreground">Films</div>
                    </div>
                  )}
                  <div>
                    <div className="text-2xl font-black gold-text">{ph.awards}</div>
                    <div className="text-xs text-muted-foreground">Awards</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submit Event */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-12 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Hosting an Event?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                List your festival, workshop, or masterclass on CineConnect and reach 50,000+ film professionals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity gold-glow"
                >
                  Submit Your Event
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold hover:bg-white/10 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Partner With Us
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
