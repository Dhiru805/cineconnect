"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Video,
  CheckCircle2,
  Clock,
  Star,
  Play,
  Upload,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Static audition listings (open calls — always visible)
const staticAuditions = [
  {
    id: "static-1",
    title: "Audition: Lead Actress — Psychological Thriller",
    company: "Malabar Films",
    type: "Self-Tape",
    role: "Female Lead (25–35)",
    location: "Mumbai",
    deadline: "Apr 20, 2026",
    posted: "1 day ago",
    applicants: 78,
    shortlisted: 12,
    description: "Submit a 2-minute self-tape performing the provided monologue. Must convey suppressed fear and quiet strength.",
    requirements: ["Female, 25–35 years", "Strong Hindi diction", "No prior experience needed", "No makeup/styling required"],
    scenes: ["Scene 1: Monologue (2 min)", "Scene 2: Conversation (1 min)"],
    verified: true,
    urgent: true,
    paid: true,
    projectId: null as string | null,
    rolesNeeded: [{ roleTitle: "Female Lead (25–35)" }],
  },
  {
    id: "static-2",
    title: "Open Audition: Tamil Web Series — Multiple Roles",
    company: "Nallan Films",
    type: "In-Person + Self-Tape",
    role: "Male & Female (20–45)",
    location: "Chennai",
    deadline: "May 1, 2026",
    posted: "3 days ago",
    applicants: 134,
    shortlisted: 24,
    description: "Open casting for a 10-episode family drama. Multiple character slots available across age groups.",
    requirements: ["Tamil fluency mandatory", "Natural performance style preferred", "Both newcomers and experienced welcome"],
    scenes: ["Improvisation scene", "Scripted dialogue (Tamil)"],
    verified: true,
    urgent: false,
    paid: true,
    projectId: null as string | null,
    rolesNeeded: [{ roleTitle: "Male/Female Lead (20-45)" }],
  },
  {
    id: "static-3",
    title: "Voice Artist — Hindi Animated Series",
    company: "ToonHub India",
    type: "Audio Audition",
    role: "Voice Artist (All Genders)",
    location: "Remote",
    deadline: "Apr 28, 2026",
    posted: "5 days ago",
    applicants: 201,
    shortlisted: 8,
    description: "Seeking voice artists for a 26-episode kids' animated series. Various characters — hero, villain, sidekick, comedy.",
    requirements: ["Clear Hindi pronunciation", "Ability to do character voices", "Home studio preferred"],
    scenes: ["Read 3 provided scripts (hero, villain, comedy character)"],
    verified: true,
    urgent: false,
    paid: true,
    projectId: null as string | null,
    rolesNeeded: [{ roleTitle: "Voice Artist" }],
  },
  {
    id: "static-4",
    title: "Child Artist Audition — Bollywood Film",
    company: "Dream Factory Productions",
    type: "In-Person",
    role: "Child Artist (8–14 years)",
    location: "Mumbai",
    deadline: "Apr 15, 2026",
    posted: "2 days ago",
    applicants: 56,
    shortlisted: 6,
    description: "Looking for a natural, expressive child actor for a major Bollywood film. No prior film experience required.",
    requirements: ["Age 8–14", "Parent/guardian must attend", "Hindi speaking", "Comfortable on film sets"],
    scenes: ["Spontaneous play scene", "Emotional dialogue"],
    verified: true,
    urgent: true,
    paid: true,
    projectId: null as string | null,
    rolesNeeded: [{ roleTitle: "Child Artist (8-14)" }],
  },
];

interface DBProject {
  _id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  budget: number;
  currency: string;
  status: string;
  rolesNeeded: { roleTitle: string; gender?: string; ageMin?: number; ageMax?: number }[];
  applicantCount: number;
  createdAt: string;
  producer?: { name: string };
}

interface AuditionListing {
  id: string;
  title: string;
  company: string;
  type: string;
  role: string;
  location: string;
  deadline: string;
  posted: string;
  applicants: number;
  shortlisted: number;
  description: string;
  requirements: string[];
  scenes: string[];
  verified: boolean;
  urgent: boolean;
  paid: boolean;
  projectId: string | null;
  rolesNeeded: { roleTitle: string }[];
}

interface Submission {
  _id: string;
  applicant: { name: string; slug: string; location?: string };
  roleAppliedFor: string;
  status: string;
  coverNote?: string;
  createdAt: string;
}

type TabType = "browse" | "panel";

export default function AuditionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("browse");
  const [search, setSearch] = useState("");
  const [applying, setApplying] = useState<AuditionListing | null>(null);
  const [applyStep, setApplyStep] = useState(0);
  const [coverNote, setCoverNote] = useState("");
  const [selfTapeUrl, setSelfTapeUrl] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");

  const [dbProjects, setDbProjects] = useState<DBProject[]>([]);
  const [allListings, setAllListings] = useState<AuditionListing[]>(staticAuditions);

  // My submissions (for panel tab)
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Applied set (to mark already applied)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Load open projects from DB and merge with static listings
  useEffect(() => {
    fetch("/api/projects?status=open")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.projects) return;
        const projects: DBProject[] = data.projects;
        setDbProjects(projects);

        const fromDB: AuditionListing[] = projects.map((p) => ({
          id: `db-${p._id}`,
          title: `Casting: ${p.title}`,
          company: p.producer?.name || "Production House",
          type: "Self-Tape",
          role: p.rolesNeeded?.[0]?.roleTitle || "Multiple Roles",
          location: p.location,
          deadline: "Open",
          posted: new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          applicants: p.applicantCount || 0,
          shortlisted: 0,
          description: p.description,
          requirements: p.rolesNeeded?.map((r) => r.roleTitle + (r.gender ? ` (${r.gender})` : "")) || [],
          scenes: [],
          verified: false,
          urgent: false,
          paid: p.budget > 0,
          projectId: p._id,
          rolesNeeded: p.rolesNeeded || [{ roleTitle: "Role" }],
        }));

        setAllListings([...fromDB, ...staticAuditions]);
      })
      .catch(() => {});
  }, []);

  // Load my submissions
  const loadMySubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      const r = await fetch("/api/auditions");
      if (!r.ok) return;
      const { auditions } = await r.json();
      setMySubmissions(auditions || []);
      // Build applied set from DB project IDs
      const ids = new Set<string>(
        (auditions || [])
          .filter((a: { project?: { _id?: string } }) => a.project?._id)
          .map((a: { project?: { _id?: string } }) => a.project!._id as string)
      );
      setAppliedIds(ids);
    } catch {
      // silent
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    loadMySubmissions();
  }, [loadMySubmissions]);

  const filtered = allListings.filter(
    (a) => !search || a.title.toLowerCase().includes(search.toLowerCase())
  );

  const openApply = (audition: AuditionListing) => {
    setApplying(audition);
    setApplyStep(0);
    setCoverNote("");
    setSelfTapeUrl("");
    setSelectedRole(audition.rolesNeeded?.[0]?.roleTitle || "");
    setApplyError("");
  };

  const submitApplication = async () => {
    if (!applying) return;
    if (!applying.projectId) {
      // Static listing — just show success (no DB project to link)
      setApplyStep(1);
      return;
    }
    if (!selectedRole) {
      setApplyError("Please select a role.");
      return;
    }
    setSubmitting(true);
    setApplyError("");
    try {
      const r = await fetch("/api/auditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: applying.projectId,
          roleAppliedFor: selectedRole,
          coverNote,
          selfTapeUrl,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setApplyError(data.error || "Failed to submit. Please try again.");
        return;
      }
      setApplyStep(1);
      await loadMySubmissions();
    } catch {
      setApplyError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Auditions</h1>
            <p className="text-sm text-muted-foreground mb-6">Open castings and audition calls across India.</p>

            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search auditions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
            {([
              { id: "browse", label: "Browse Auditions" },
              { id: "panel", label: `My Applications${mySubmissions.length > 0 ? ` (${mySubmissions.length})` : ""}` },
            ] as { id: TabType; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === "browse" ? (
            <div className="space-y-5">
              {filtered.map((audition) => {
                const alreadyApplied = audition.projectId ? appliedIds.has(audition.projectId) : false;
                return (
                  <div key={audition.id} className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-white/15 transition-all overflow-hidden">
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                          <Video className="w-6 h-6 text-black" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {audition.urgent && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">Urgent</span>}
                            {audition.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                            {audition.projectId && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Live Project</span>}
                            <span className="text-xs text-muted-foreground">{audition.type}</span>
                          </div>

                          <h3 className="font-semibold text-foreground text-base mb-1 leading-snug">{audition.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{audition.company}</p>

                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{audition.description}</p>

                          <div className="space-y-1.5 mb-4">
                            {audition.requirements.map((req, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                {req}
                              </div>
                            ))}
                          </div>

                          {audition.scenes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {audition.scenes.map((scene, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/8 text-muted-foreground">
                                  {scene}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{audition.location}</div>
                            {audition.deadline !== "Open" && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Deadline: {audition.deadline}</div>}
                            <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{audition.applicants} applications</div>
                            <div className="opacity-60">{audition.posted}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/8 px-5 sm:px-6 py-3 flex items-center justify-end">
                      {alreadyApplied ? (
                        <span className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => openApply(audition)}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-lg gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          Apply / Submit Tape
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* My Applications Tab */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">My Applications</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Track the status of your audition submissions.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/8">{mySubmissions.filter(s => s.status === "shortlisted").length} shortlisted</span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/8">{mySubmissions.filter(s => s.status === "applied").length} pending</span>
                </div>
              </div>

              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : mySubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Video className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">You haven&apos;t applied to any auditions yet.</p>
                  <button onClick={() => setActiveTab("browse")} className="mt-4 px-4 py-2 rounded-lg gold-gradient text-black text-xs font-semibold">Browse Auditions</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mySubmissions.map((sub) => (
                    <div key={sub._id} className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4 flex items-center gap-4 hover:border-white/15 transition-all">
                      <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold shrink-0">
                        {sub.roleAppliedFor.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-foreground">{sub.roleAppliedFor}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.status === "shortlisted" ? "bg-green-500/15 text-green-400" : sub.status === "selected" ? "bg-primary/15 text-primary" : sub.status === "rejected" ? "bg-red-500/15 text-red-400" : "bg-white/5 text-muted-foreground"}`}>
                            {sub.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          {sub.coverNote && <span className="italic truncate max-w-[200px]">{sub.coverNote}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {applying && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[oklch(0.12_0_0)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Submit Your Application</h2>
              <button onClick={() => setApplying(null)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {applyStep === 0 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-0.5">Applying to</p>
                  <p className="text-sm font-medium text-foreground">{applying.title}</p>
                  <p className="text-xs text-muted-foreground">{applying.company}</p>
                </div>

                {applying.rolesNeeded && applying.rolesNeeded.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Role Applying For</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 text-sm"
                    >
                      {applying.rolesNeeded.map((r, i) => (
                        <option key={i} value={r.roleTitle}>{r.roleTitle}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Cover Note</label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Why are you right for this role? Keep it concise and genuine..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Self-Tape / Video Link</label>
                  <input
                    type="url"
                    value={selfTapeUrl}
                    onChange={(e) => setSelfTapeUrl(e.target.value)}
                    placeholder="YouTube / Google Drive / Vimeo link..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                  />
                </div>

                <div className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-foreground mb-0.5">Or upload your self-tape</p>
                  <p className="text-xs text-muted-foreground">MP4 / MOV, max 500MB (coming soon)</p>
                </div>

                {applyError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {applyError}
                  </div>
                )}

                <button
                  onClick={submitApplication}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}

            {applyStep === 1 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Application Submitted!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  The production team will review your tape. You&apos;ll get notified if you&apos;re shortlisted.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setApplying(null)} className="flex-1 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors">
                    Close
                  </button>
                  <button onClick={() => { setApplying(null); setActiveTab("panel"); }} className="flex-1 px-6 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90">
                    View My Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
