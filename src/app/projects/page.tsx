"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  ArrowRight,
  Clapperboard,
  Film,
  Monitor,
  Megaphone,
  Youtube,
  SlidersHorizontal,
  Clock,
  Bookmark,
  ChevronDown,
} from "lucide-react";

const categoryFilters = [
  { id: "all", label: "All Projects", icon: null },
  { id: "film", label: "Film", icon: Film },
  { id: "ott", label: "OTT / Web", icon: Monitor },
  { id: "ad", label: "Ad Films", icon: Megaphone },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "corporate", label: "Corporate", icon: Clapperboard },
];

interface Project {
  _id?: string;
  id?: string;
  title: string;
  type: string;
  description: string;
  location: string;
  budget: number;
  status?: string;
  languages?: string[];
  tags?: string[];
  applicantCount?: number;
  rolesNeeded?: { roleTitle: string }[];
  createdAt?: string;
  company?: string;
  category?: string;
  urgent?: boolean;
  verified?: boolean;
  deadline?: string;
  duration?: string;
  applicants?: number;
  roles?: string[];
  posted?: string;
}

const mockProjects: Project[] = [
  { id: "1", title: "Lead Actor — Hindi Feature Film", company: "Malabar Films", type: "film", category: "Bollywood Feature", location: "Mumbai", budget: 200000, deadline: "Apr 15, 2026", posted: "2 days ago", applicants: 34, roles: ["Lead Actor (Male, 28–38)", "Supporting Actor (Female)"], description: "Looking for a strong lead actor for a psychological thriller set in Mumbai. Character is a detective with a dark past.", tags: ["Hindi", "Mumbai", "Paid", "Thriller"], urgent: true, verified: true },
  { id: "2", title: "DOP + Camera Crew — OTT Series", company: "StreamStudio", type: "ott", category: "OTT Web Series", location: "Bengaluru", budget: 80000, deadline: "Apr 30, 2026", posted: "1 day ago", applicants: 18, roles: ["Director of Photography", "Camera Operator"], description: "Hiring experienced DOP for a 8-episode crime thriller streaming on major OTT platform.", tags: ["OTT", "Bengaluru", "Paid", "Crime"], urgent: false, verified: true },
  { id: "3", title: "Model/Actor — Auto Brand TVC", company: "Apex Advertising", type: "ad", category: "TVC / Ad Film", location: "Mumbai", budget: 50000, deadline: "Apr 10, 2026", posted: "5 hours ago", applicants: 67, roles: ["Male Model (25–35)", "Female Model (22–30)"], description: "National TVC for a major automobile brand. Looking for confident, photogenic talent.", tags: ["Ad Film", "Mumbai", "TVC", "National"], urgent: true, verified: true },
];

const locations = ["All Locations", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Remote"];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [location, setLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ status: "open" });
    if (activeCategory !== "all") params.set("type", activeCategory);
    if (location !== "All Locations") params.set("location", location);
    fetch(`/api/projects?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setDbProjects(d.projects || []))
      .catch(() => setDbProjects([]))
      .finally(() => setLoadingProjects(false));
  }, [activeCategory, location]);

  const allProjects = dbProjects.length > 0
    ? dbProjects.map((p) => ({ ...p, id: p._id || p.id }))
    : mockProjects;

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  const filtered = allProjects.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.type === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Projects & Castings</h1>
                <p className="text-sm text-muted-foreground">Find your next role or hire the perfect team.</p>
              </div>
              <Link href="/post-project" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity">
                Post Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search projects, roles, skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"}`}>
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Location</label>
                  <div className="relative">
                    <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40 appearance-none">
                      {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Budget Range</label>
                  <div className="relative">
                    <select className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40 appearance-none">
                      <option>Any Budget</option><option>Under ₹50K</option><option>₹50K – ₹2L</option><option>₹2L – ₹10L</option><option>₹10L+</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Posted</label>
                  <div className="relative">
                    <select className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/40 appearance-none">
                      <option>Any Time</option><option>Last 24 hours</option><option>Last 7 days</option><option>Last 30 days</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto pb-0">
              {categoryFilters.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeCategory === cat.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-muted-foreground mb-6">
            <span className="text-foreground font-medium">{loadingProjects ? "..." : filtered.length}</span> projects found
          </p>

          <div className="space-y-4">
            {filtered.map((project) => {
              const projectId = project._id || project.id || "";
              const budgetDisplay = project.budget ? `₹${Number(project.budget).toLocaleString("en-IN")}` : null;
              const rolesDisplay = project.roles || (project.rolesNeeded || []).map((r) => r.roleTitle);
              return (
                <div key={projectId} className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-white/15 transition-all duration-200 overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {project.urgent && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">Urgent</span>}
                          {project.verified && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Verified</span>}
                          <span className="text-xs text-muted-foreground capitalize">{project.category || project.type}</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-base leading-snug">{project.title}</h3>
                        {project.company && <p className="text-sm text-muted-foreground mt-0.5">{project.company}</p>}
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 mt-2 line-clamp-2">{project.description}</p>
                        {rolesDisplay.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {rolesDisplay.slice(0, 3).map((role) => (
                              <span key={role} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-muted-foreground border border-white/8">{role}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {project.location && <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</div>}
                          {budgetDisplay && <div className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{budgetDisplay}</div>}
                          {project.deadline && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Deadline: {project.deadline}</div>}
                          {project.duration && <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{project.duration}</div>}
                          {(project.applicants || project.applicantCount) ? <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.applicants || project.applicantCount} applicants</div> : null}
                          {project.posted && <div className="opacity-60">{project.posted}</div>}
                          {project.createdAt && <div className="opacity-60">{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => toggleBookmark(projectId)} className={`w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${bookmarked.includes(projectId) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                          <Bookmark className={`w-4 h-4 ${bookmarked.includes(projectId) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/8 px-5 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.tags || project.languages || []).map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground opacity-60">#{tag}</span>
                      ))}
                    </div>
                    <Link href={`/projects/${projectId}`} className="flex items-center gap-1.5 px-5 py-2 rounded-lg gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && !loadingProjects && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-foreground font-medium mb-2">No projects found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
              <Link href="/post-project" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90">
                Post the First Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
