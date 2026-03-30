"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin, IndianRupee, Calendar, Users, ArrowLeft, ArrowRight,
  CheckCircle2, Clock, X, Upload, Loader2, AlertCircle, Bookmark,
  Film, Monitor, Megaphone, Youtube, Clapperboard, Play, User,
  ChevronRight,
} from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  film: Film,
  ott: Monitor,
  ad: Megaphone,
  youtube: Youtube,
  short: Film,
  corporate: Clapperboard,
  music: Play,
  documentary: Film,
};

interface IProject {
  _id: string;
  title: string;
  type: string;
  description: string;
  location: string;
  budget: number;
  currency: string;
  status: string;
  languages?: string[];
  tags?: string[];
  applicantCount?: number;
  rolesNeeded: { roleTitle: string; gender?: string; ageMin?: number; ageMax?: number; skills?: string[] }[];
  createdAt: string;
  producer: { _id: string; name: string; avatar?: string; slug?: string; role: string };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();

  const [project, setProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  // Apply modal state
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyStep, setApplyStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [selfTapeUrl, setSelfTapeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const r = await fetch(`/api/projects/${id}`);
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Project not found"); return; }
      setProject(data.project);
      if (data.project.rolesNeeded?.[0]) setSelectedRole(data.project.rolesNeeded[0].roleTitle);
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Check if already applied
  const checkApplied = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch("/api/auditions", { credentials: "include" });
      if (!r.ok) return;
      const { auditions } = await r.json();
      const applied = (auditions || []).some(
        (a: { project?: { _id?: string } }) => a.project?._id === id
      );
      setAlreadyApplied(applied);
    } catch { /* silent */ }
  }, [user, id]);

  useEffect(() => { loadProject(); }, [loadProject]);
  useEffect(() => { checkApplied(); }, [checkApplied]);

  const openApply = () => {
    if (!user) { window.location.href = "/login"; return; }
    setApplyOpen(true);
    setApplyStep(0);
    setCoverNote("");
    setSelfTapeUrl("");
    setApplyError("");
  };

  const submitApplication = async () => {
    if (!selectedRole) { setApplyError("Please select a role."); return; }
    setSubmitting(true);
    setApplyError("");
    try {
      const r = await fetch("/api/auditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: id, roleAppliedFor: selectedRole, coverNote, selfTapeUrl }),
      });
      const data = await r.json();
      if (!r.ok) { setApplyError(data.error || "Failed to submit"); return; }
      setApplyStep(1);
      setAlreadyApplied(true);
      loadProject();
    } catch {
      setApplyError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Project not found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Link href="/projects" className="px-5 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[project.type] || Film;
  const budgetDisplay = project.budget ? `₹${Number(project.budget).toLocaleString("en-IN")}` : null;
  const isOpen = project.status === "open" || project.status === "casting";
  const isOwner = user && (user._id === project.producer?._id || user._id === (project.producer as unknown as string));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/projects" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Projects
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate max-w-xs">{project.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                <div className="h-28 bg-gradient-to-br from-primary/20 via-amber-600/10 to-transparent relative">
                  <div className="absolute inset-0 film-strip opacity-20" />
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-end justify-between -mt-8 mb-4">
                    <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center border-4 border-[oklch(0.10_0_0)]">
                      <TypeIcon className="w-7 h-7 text-black" />
                    </div>
                    <div className="flex items-center gap-2 mt-10">
                      <button
                        onClick={() => setBookmarked(!bookmarked)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${bookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                      </button>
                      {isOwner && (
                        <Link
                          href={`/production?project=${project._id}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                        >
                          Manage Production
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${isOpen ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-muted-foreground bg-white/5 border-white/10"}`}>
                      {project.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">{project.type}</span>
                  </div>

                  <h1 className="text-xl font-bold text-foreground mb-1">{project.title}</h1>
                  {project.producer && (
                    <Link href={`/profile/${project.producer.slug || project.producer._id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                      <div className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold">
                        {project.producer.name?.charAt(0)}
                      </div>
                      {project.producer.name}
                    </Link>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                    {project.location && <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</div>}
                    {budgetDisplay && <div className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{budgetDisplay}</div>}
                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                    {project.applicantCount ? <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{project.applicantCount} applicants</div> : null}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                </div>
              </div>

              {/* Roles Needed */}
              {project.rolesNeeded?.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Roles Being Cast
                  </h2>
                  <div className="space-y-3">
                    {project.rolesNeeded.map((r, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/8 bg-white/3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">{r.roleTitle}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {r.gender && <span>Gender: {r.gender}</span>}
                            {(r.ageMin || r.ageMax) && <span>Age: {r.ageMin || "any"}–{r.ageMax || "any"}</span>}
                            {r.skills?.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-md border border-white/8 bg-white/3">{s}</span>
                            ))}
                          </div>
                        </div>
                        {isOpen && !alreadyApplied && (
                          <button
                            onClick={() => { setSelectedRole(r.roleTitle); openApply(); }}
                            className="shrink-0 px-3 py-1.5 rounded-lg gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages & Tags */}
              {((project.languages?.length ?? 0) > 0 || (project.tags?.length ?? 0) > 0) && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4">Details</h2>
                  <div className="space-y-3">
                    {(project.languages?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {project.languages!.map((l) => (
                            <span key={l} className="px-2.5 py-1 rounded-lg text-xs border border-white/10 text-muted-foreground bg-white/3">{l}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(project.tags?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags!.map((t) => (
                            <span key={t} className="text-xs text-muted-foreground opacity-70">#{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply CTA */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                {alreadyApplied ? (
                  <div className="flex flex-col items-center text-center py-2">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-sm font-semibold text-foreground">Application Submitted!</p>
                    <p className="text-xs text-muted-foreground mt-1">We&apos;ll notify you when reviewed.</p>
                    <Link href="/auditions" className="mt-4 text-xs text-primary hover:underline flex items-center gap-1">
                      Track Applications <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : isOpen ? (
                  <>
                    <p className="text-sm font-semibold text-foreground mb-1">Casting Open</p>
                    <p className="text-xs text-muted-foreground mb-4">{project.applicantCount || 0} people have applied. Be next.</p>
                    <button
                      onClick={openApply}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity gold-glow"
                    >
                      Apply Now <ArrowRight className="w-4 h-4" />
                    </button>
                    {!user && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        <Link href="/login" className="text-primary hover:underline">Sign in</Link> to apply
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm font-semibold text-foreground mb-1">Casting Closed</p>
                    <p className="text-xs text-muted-foreground">This project is no longer accepting applications.</p>
                  </div>
                )}
              </div>

              {/* Project info */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Project Info</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Type</span>
                    <span className="text-foreground capitalize">{project.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="text-foreground capitalize">{project.status.replace("-", " ")}</span>
                  </div>
                  {budgetDisplay && (
                    <div className="flex justify-between">
                      <span>Budget</span>
                      <span className="text-foreground">{budgetDisplay}</span>
                    </div>
                  )}
                  {project.location && (
                    <div className="flex justify-between">
                      <span>Location</span>
                      <span className="text-foreground">{project.location}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Posted</span>
                    <span className="text-foreground">{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roles</span>
                    <span className="text-foreground">{project.rolesNeeded?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Producer */}
              {project.producer && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Posted By</h3>
                  <Link href={`/profile/${project.producer.slug || project.producer._id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold shrink-0">
                      {project.producer.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{project.producer.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{project.producer.role}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              )}

              {/* Similar projects */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Browse More</h3>
                <Link href="/projects" className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span>All Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/auditions" className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
                  <span>Open Auditions</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[oklch(0.12_0_0)] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Submit Your Application</h2>
              <button onClick={() => setApplyOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {applyStep === 0 ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-0.5">Applying to</p>
                  <p className="text-sm font-medium text-foreground">{project.title}</p>
                </div>

                {project.rolesNeeded?.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Role Applying For</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 text-sm"
                    >
                      {project.rolesNeeded.map((r, i) => (
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
                    placeholder="Why are you right for this role?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Self-Tape / Video Link (optional)</label>
                  <input
                    type="url"
                    value={selfTapeUrl}
                    onChange={(e) => setSelfTapeUrl(e.target.value)}
                    placeholder="YouTube / Drive / Vimeo link..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
                  />
                </div>

                <div className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-foreground mb-0.5">Or upload your self-tape</p>
                  <p className="text-xs text-muted-foreground">MP4 / MOV (coming soon)</p>
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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Application Submitted!</h3>
                <p className="text-sm text-muted-foreground mb-6">The production team will review your application. You&apos;ll be notified if shortlisted.</p>
                <div className="flex gap-3">
                  <button onClick={() => setApplyOpen(false)} className="flex-1 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground">
                    Close
                  </button>
                  <Link href="/auditions" onClick={() => setApplyOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Track Status
                  </Link>
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
