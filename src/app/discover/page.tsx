"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  CheckCircle2,
  MessageSquare,
  Bookmark,
  X,
  ChevronDown,
  Mic2,
  Camera,
  Clapperboard,
  Briefcase,
  Youtube,
  Filter,
} from "lucide-react";

const roleFilters = [
  { id: "all", label: "All", icon: null },
  { id: "talent", label: "Actors", icon: Mic2 },
  { id: "crew", label: "Crew", icon: Camera },
  { id: "producer", label: "Directors", icon: Clapperboard },
  { id: "agency", label: "Agencies", icon: Briefcase },
  { id: "brand", label: "Creators", icon: Youtube },
];

// Seed data shown when DB is empty
const mockTalents = [
  { id: "1", name: "Priya Sharma", role: "Lead Actor", location: "Mumbai", languages: ["Hindi", "English", "Marathi"], skills: ["Lead Actor", "Brand Ambassador", "TV Actor"], rating: 4.9, reviews: 34, verified: true, available: true, rate: "₹15K–₹50K/day", avatar: "P", color: "from-amber-500 to-orange-600", projects: 28, bio: "National award nominated actress with 8 years of experience in Bollywood and OTT." },
  { id: "2", name: "Arjun Mehta", role: "Director of Photography", location: "Mumbai", languages: ["Hindi", "English"], skills: ["Cinematography", "Drone", "Color Grading"], rating: 4.8, reviews: 21, verified: true, available: true, rate: "₹20K–₹60K/day", avatar: "A", color: "from-blue-500 to-indigo-600", projects: 42, bio: "Award-winning DOP. Worked with Netflix India, Amazon Prime. Specializes in cinematic storytelling." },
  { id: "3", name: "Meera Iyer", role: "Screenwriter", location: "Chennai", languages: ["Tamil", "English", "Telugu"], skills: ["Screenwriting", "Dialogue", "Story Development"], rating: 4.7, reviews: 18, verified: true, available: false, rate: "₹8K–₹25K/day", avatar: "M", color: "from-purple-500 to-violet-600", projects: 15, bio: "Tamil-English bilingual writer. 6 produced films, 3 OTT series." },
  { id: "4", name: "Rohit Sinha", role: "Sound Designer", location: "Kolkata", languages: ["Bengali", "Hindi", "English"], skills: ["Sound Design", "Mixing", "Foley"], rating: 4.6, reviews: 29, verified: true, available: true, rate: "₹12K–₹35K/day", avatar: "R", color: "from-teal-500 to-cyan-600", projects: 33, bio: "Post-production sound specialist with 10 years in Bengali and Hindi films." },
  { id: "5", name: "Kavya Nair", role: "Model & Actor", location: "Kochi", languages: ["Malayalam", "Tamil", "English"], skills: ["Model", "Lead Actor", "Brand Ambassador"], rating: 4.9, reviews: 47, verified: true, available: true, rate: "₹10K–₹40K/day", avatar: "K", color: "from-rose-500 to-pink-600", projects: 22, bio: "Kerala-based model-actor. Runway, editorial, and OTT experience." },
];

interface Talent {
  id: string;
  _id?: string;
  name: string;
  role?: string;
  niche?: string;
  location?: string;
  languages?: string[];
  skills?: string[];
  rating?: number;
  reviews?: number;
  verified?: boolean;
  available?: boolean;
  availability?: string;
  rateMin?: number;
  rateMax?: number;
  rate?: string;
  avatar?: string;
  color?: string;
  projects?: number;
  bio?: string;
  slug?: string;
}

const locations = ["All Locations", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Kochi"];
const languages = ["All Languages", "Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi"];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [location, setLocation] = useState("All Locations");
  const [language, setLanguage] = useState("All Languages");
  const [availability, setAvailability] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [dbTalents, setDbTalents] = useState<Talent[]>([]);
  const [loadingTalents, setLoadingTalents] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeRole !== "all") params.set("role", activeRole);
    if (location !== "All Locations") params.set("location", location);
    if (language !== "All Languages") params.set("language", language);
    fetch(`/api/users?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setDbTalents(d.users || []))
      .catch(() => setDbTalents([]))
      .finally(() => setLoadingTalents(false));
  }, [activeRole, location, language]);

  const allTalents: Talent[] = dbTalents.length > 0
    ? dbTalents.map((u) => ({ ...u, id: u._id || u.id }))
    : mockTalents;

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  const filtered = allTalents.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.role || "").toLowerCase().includes(search.toLowerCase()) || (t.skills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchAvail = availability === "all" || (availability === "available" && (t.available || t.availability === "available")) || (availability === "busy" && (!t.available && t.availability !== "available"));
    return matchSearch && matchAvail;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Discover Talent</h1>
            <p className="text-sm text-muted-foreground mb-6">Find actors, crew, directors, and more for your next project.</p>

            {/* Search bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, role, skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Location</label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40 appearance-none"
                    >
                      {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Language</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40 appearance-none"
                    >
                      {languages.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Availability</label>
                  <div className="flex gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "available", label: "Available" },
                      { id: "busy", label: "Busy" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAvailability(opt.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${availability === opt.id ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/20"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
              {roleFilters.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeRole === r.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {r.icon && <r.icon className="w-3.5 h-3.5" />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{loadingTalents ? "..." : filtered.length}</span> profiles found
              </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Sort by:</span>
              <select className="bg-transparent text-muted-foreground focus:outline-none text-sm cursor-pointer">
                <option>Most Relevant</option>
                <option>Highest Rated</option>
                <option>Most Projects</option>
                <option>Recently Active</option>
              </select>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((talent) => {
                const talentId = talent.id || talent._id || "";
                const isAvailable = talent.available || talent.availability === "available";
                const rateDisplay = talent.rate || (talent.rateMin ? `₹${talent.rateMin.toLocaleString("en-IN")}${talent.rateMax ? `–₹${talent.rateMax.toLocaleString("en-IN")}` : "+"}/day` : null);
                return (
                <div key={talentId} className="group rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${talent.color || "from-primary to-amber-600"} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                          {(talent.avatar || talent.name?.charAt(0) || "?").slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-foreground text-sm">{talent.name}</h3>
                            {talent.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{talent.role || talent.niche || "Professional"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-yellow-500"}`} />
                        <button
                          onClick={() => toggleBookmark(talentId)}
                          className={`transition-colors ${bookmarked.includes(talentId) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarked.includes(talentId) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {talent.bio && <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{talent.bio}</p>}

                    <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                      {talent.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{talent.location}</div>}
                      {talent.rating && <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-primary text-primary" />{talent.rating}{talent.reviews ? <span className="opacity-60">({talent.reviews})</span> : null}</div>}
                      {talent.projects ? <div className="opacity-60">{talent.projects} projects</div> : null}
                    </div>

                    {(talent.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(talent.skills || []).slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-muted-foreground border border-white/8">{skill}</span>
                        ))}
                      </div>
                    )}

                    {(talent.languages || []).length > 0 && (
                      <div className="text-xs text-muted-foreground mb-4">{(talent.languages || []).slice(0, 3).join(" · ")}</div>
                    )}

                    {rateDisplay && <div className="text-xs font-medium text-primary">{rateDisplay}</div>}
                  </div>

                  <div className="border-t border-white/8 p-3 flex gap-2">
                    <Link
                      href={`/profile/${talent.slug || talentId}`}
                      className="flex-1 py-2 rounded-lg text-center text-xs font-semibold border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/messages?to=${talentId}`}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </Link>
                  </div>
                </div>
              );
              })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-foreground font-medium mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Load more */}
          {filtered.length > 0 && (
            <div className="text-center mt-10">
              <button className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors">
                Load More Profiles
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
