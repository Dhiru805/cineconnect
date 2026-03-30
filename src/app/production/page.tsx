"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Clapperboard, Plus, Loader2, AlertCircle, CheckCircle2, X,
  ChevronRight, Calendar, Users, Film, BarChart3, ArrowRight,
  Pencil, Trash2, Check, Clock, Play, MapPin, UserPlus, FileText,
} from "lucide-react";

interface IScene {
  sceneNumber: string;
  description: string;
  location?: string;
  cast?: string[];
  status: "pending" | "filming" | "done";
  scheduledDate?: string;
  notes?: string;
}

interface ICrew {
  name: string;
  role: string;
  department: string;
}

interface IMilestone {
  title: string;
  dueDate?: string;
  completed: boolean;
}

interface IProduction {
  _id: string;
  title: string;
  status: "pre-production" | "production" | "post-production" | "completed";
  scenes: IScene[];
  crewAssignments: ICrew[];
  milestones: IMilestone[];
  notes?: string;
  project: { _id: string; title: string; type: string; status: string };
  createdAt: string;
}

interface IProject {
  _id: string;
  title: string;
  type: string;
  status: string;
}

type Tab = "board" | "scenes" | "crew" | "schedule" | "callsheet";

const sceneStatusColors = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  filming: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  done: "text-green-400 bg-green-500/10 border-green-500/20",
};

const prodStatusColors: Record<string, string> = {
  "pre-production": "text-yellow-400 bg-yellow-500/10",
  production: "text-blue-400 bg-blue-500/10",
  "post-production": "text-purple-400 bg-purple-500/10",
  completed: "text-green-400 bg-green-500/10",
};

export default function ProductionPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const preselectedProject = searchParams.get("project");

  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(preselectedProject || "");
  const [production, setProduction] = useState<IProduction | null>(null);
  const [loadingProd, setLoadingProd] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Scene form
  const [showSceneForm, setShowSceneForm] = useState(false);
  const [sceneForm, setSceneForm] = useState<IScene>({ sceneNumber: "", description: "", location: "", cast: [], status: "pending" });

  // Crew form
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [crewForm, setCrewForm] = useState<ICrew>({ name: "", role: "", department: "" });

  // Milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  // Create production form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState("");

  const showFeedback = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess(""); }
    else { setSuccess(msg); setError(""); }
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  };

  useEffect(() => {
    if (!user) return;
    fetch("/api/projects?producerId=me&limit=50", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.projects) setProjects(d.projects); })
      .catch(() => {});
  }, [user]);

  const loadProduction = useCallback(async (pid: string) => {
    if (!pid) { setProduction(null); return; }
    setLoadingProd(true);
    try {
      const r = await fetch(`/api/production?projectId=${pid}`, { credentials: "include" });
      if (!r.ok) { setProduction(null); return; }
      const { productions } = await r.json();
      setProduction(productions?.[0] || null);
    } catch {
      setProduction(null);
    } finally {
      setLoadingProd(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) loadProduction(selectedProjectId);
  }, [selectedProjectId, loadProduction]);

  const createProduction = async () => {
    if (!createTitle.trim() || !selectedProjectId) return;
    setSaving(true);
    try {
      const r = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ project: selectedProjectId, title: createTitle }),
      });
      const data = await r.json();
      if (!r.ok) { showFeedback(data.error || "Failed", true); return; }
      setProduction(data.production);
      setShowCreateForm(false);
      setCreateTitle("");
      showFeedback("Production board created!");
    } catch {
      showFeedback("Network error", true);
    } finally {
      setSaving(false);
    }
  };

  const doAction = async (action: string, data: Record<string, unknown>) => {
    if (!production) return;
    setSaving(true);
    try {
      const r = await fetch("/api/production", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productionId: production._id, action, data }),
      });
      const res = await r.json();
      if (!r.ok) { showFeedback(res.error || "Failed", true); return; }
      setProduction(res.production);
      showFeedback("Updated!");
    } catch {
      showFeedback("Network error", true);
    } finally {
      setSaving(false);
    }
  };

  const addScene = async () => {
    if (!sceneForm.sceneNumber || !sceneForm.description) { showFeedback("Scene number and description required", true); return; }
    await doAction("add_scene", sceneForm as unknown as Record<string, unknown>);
    setShowSceneForm(false);
    setSceneForm({ sceneNumber: "", description: "", location: "", cast: [], status: "pending" });
  };

  const addCrew = async () => {
    if (!crewForm.name || !crewForm.role) { showFeedback("Name and role required", true); return; }
    await doAction("add_crew", crewForm as unknown as Record<string, unknown>);
    setShowCrewForm(false);
    setCrewForm({ name: "", role: "", department: "" });
  };

  const addMilestone = async () => {
    if (!milestoneTitle.trim()) return;
    await doAction("add_scene", {} as Record<string, unknown>); // placeholder — handled below
    if (!production) return;
    setSaving(true);
    try {
      const newMilestones = [...production.milestones, { title: milestoneTitle, completed: false }];
      const r = await fetch("/api/production", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productionId: production._id, action: "generic", data: { milestones: newMilestones } }),
      });
      // Fallback: re-POST with updated milestones
      const r2 = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project: selectedProjectId,
          title: production.title,
          scenes: production.scenes,
          crewAssignments: production.crewAssignments,
          milestones: newMilestones,
          notes: production.notes,
          status: production.status,
        }),
      });
      const data2 = await r2.json();
      if (r2.ok) setProduction(data2.production);
      else if (r.ok) { const data = await r.json(); setProduction(data.production); }
      setShowMilestoneForm(false);
      setMilestoneTitle("");
      showFeedback("Milestone added!");
    } catch {
      showFeedback("Error adding milestone", true);
    } finally {
      setSaving(false);
    }
  };

  const toggleMilestone = async (title: string) => {
    await doAction("toggle_milestone", { title });
  };

  const updateSceneStatus = async (sceneNumber: string, status: IScene["status"]) => {
    await doAction("update_scene", { sceneNumber, status });
  };

  const printCallSheet = () => {
    if (!production) return;
    const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const scenes = production.scenes.filter((s) => s.status !== "done").slice(0, 5);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Call Sheet – ${production.project.title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; max-width: 800px; margin: 0 auto; color: #111; }
        h1 { font-size: 22px; margin: 0; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 14px; font-weight: bold; border-bottom: 2px solid #111; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; border-bottom: 1px solid #ddd; padding: 6px 8px; font-weight: bold; }
        td { padding: 6px 8px; border-bottom: 1px solid #eee; }
        .crew-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 16px; font-size: 13px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>${production.project.title}</h1>
      <p class="sub">Call Sheet · Generated ${today} · Production: ${production.title}</p>

      <div class="section"><h2>Scenes Today</h2>
        ${scenes.length === 0 ? "<p style='color:#999;font-size:13px'>All scenes completed!</p>" : `
        <table><tr><th>Scene</th><th>Description</th><th>Location</th><th>Cast</th></tr>
        ${scenes.map((s) => `<tr><td>${s.sceneNumber}</td><td>${s.description}</td><td>${s.location || "TBD"}</td><td>${(s.cast || []).join(", ") || "—"}</td></tr>`).join("")}
        </table>`}
      </div>

      <div class="section"><h2>Crew</h2>
        <div class="crew-grid">
          ${production.crewAssignments.map((c) => `<div><strong>${c.name}</strong><br/><span style='color:#666'>${c.role} · ${c.department}</span></div>`).join("")}
        </div>
      </div>

      <div class="section"><h2>Notes</h2>
        <p style='font-size:13px'>${production.notes || "No notes for today."}</p>
      </div>
      <script>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "board", label: "Overview", icon: BarChart3 },
    { id: "scenes", label: `Scenes${production ? ` (${production.scenes.length})` : ""}`, icon: Film },
    { id: "crew", label: `Crew${production ? ` (${production.crewAssignments.length})` : ""}`, icon: Users },
    { id: "schedule", label: "Milestones", icon: Calendar },
    { id: "callsheet", label: "Call Sheet", icon: FileText },
  ];

  const scenesDone = production?.scenes.filter((s) => s.status === "done").length || 0;
  const scenesTotal = production?.scenes.length || 0;
  const milestoneDone = production?.milestones.filter((m) => m.completed).length || 0;
  const milestoneTotal = production?.milestones.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Clapperboard className="w-6 h-6 text-primary" />
                  Production Management
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage scenes, crew, schedule, and call sheets.</p>
              </div>
              {production && (
                <button
                  onClick={printCallSheet}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="w-4 h-4" /> Export Call Sheet
                </button>
              )}
            </div>

            {/* Project picker */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
              {projects.length === 0 && (
                <Link href="/post-project" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Post a project first <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Tabs */}
            {production && (
              <div className="flex gap-1 mt-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Feedback */}
          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* No project selected */}
          {!selectedProjectId && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mb-4">
                <Clapperboard className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Select a Project</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">Choose a project from the dropdown above to manage its production board.</p>
              {projects.length === 0 && (
                <Link href="/post-project" className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Post a Project
                </Link>
              )}
            </div>
          )}

          {/* Loading */}
          {selectedProjectId && loadingProd && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* No production — create */}
          {selectedProjectId && !loadingProd && !production && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Film className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No Production Board Yet</h2>
              <p className="text-sm text-muted-foreground mb-6">Create a production board to manage scenes, crew, and schedule for this project.</p>
              {!showCreateForm ? (
                <button
                  onClick={() => { setShowCreateForm(true); setCreateTitle(projects.find((p) => p._id === selectedProjectId)?.title + " Production" || ""); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Create Production Board
                </button>
              ) : (
                <div className="w-full max-w-md space-y-3">
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Production board title..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowCreateForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                    <button onClick={createProduction} disabled={saving} className="flex-1 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Production Board */}
          {production && !loadingProd && (
            <>
              {/* Overview Tab */}
              {activeTab === "board" && (
                <div className="space-y-6">
                  {/* Status header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{production.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{production.project.title} · {production.project.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={production.status}
                        onChange={(e) => doAction("update_status", { status: e.target.value })}
                        className={`px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold focus:outline-none ${prodStatusColors[production.status] || ""}`}
                      >
                        {["pre-production", "production", "post-production", "completed"].map((s) => (
                          <option key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Total Scenes", value: scenesTotal, icon: Film, color: "text-primary" },
                      { label: "Scenes Done", value: scenesDone, icon: Check, color: "text-green-400" },
                      { label: "Crew Members", value: production.crewAssignments.length, icon: Users, color: "text-blue-400" },
                      { label: "Milestones", value: `${milestoneDone}/${milestoneTotal}`, icon: Calendar, color: "text-purple-400" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="p-4 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                        <kpi.icon className={`w-5 h-5 ${kpi.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                        <div className="text-xs text-muted-foreground">{kpi.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scene progress bar */}
                  {scenesTotal > 0 && (
                    <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Scene Progress</h3>
                        <span className="text-xs text-muted-foreground">{scenesDone}/{scenesTotal} scenes complete</span>
                      </div>
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${(scenesDone / scenesTotal) * 100}%` }} />
                      </div>
                      <div className="flex gap-4 mt-3 text-xs">
                        {[
                          { label: "Pending", count: production.scenes.filter((s) => s.status === "pending").length, color: "text-yellow-400" },
                          { label: "Filming", count: production.scenes.filter((s) => s.status === "filming").length, color: "text-blue-400" },
                          { label: "Done", count: scenesDone, color: "text-green-400" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-1.5">
                            <span className={`font-semibold ${item.color}`}>{item.count}</span>
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick scene list */}
                  {production.scenes.length > 0 && (
                    <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                        <h3 className="text-sm font-semibold text-foreground">Scenes</h3>
                        <button onClick={() => setActiveTab("scenes")} className="text-xs text-primary hover:underline flex items-center gap-1">
                          View all <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="divide-y divide-white/8">
                        {production.scenes.slice(0, 4).map((s) => (
                          <div key={s.sceneNumber} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-muted-foreground w-8">{s.sceneNumber}</span>
                              <div>
                                <p className="text-sm font-medium text-foreground">{s.description}</p>
                                {s.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</p>}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${sceneStatusColors[s.status]}`}>{s.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scenes Tab */}
              {activeTab === "scenes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Scene Manager</h2>
                    <button
                      onClick={() => setShowSceneForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" /> Add Scene
                    </button>
                  </div>

                  {/* Kanban columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(["pending", "filming", "done"] as IScene["status"][]).map((col) => {
                      const colScenes = production.scenes.filter((s) => s.status === col);
                      const labels = { pending: "Pending", filming: "Filming", done: "Done" };
                      const headerColors = { pending: "text-yellow-400", filming: "text-blue-400", done: "text-green-400" };
                      return (
                        <div key={col} className="space-y-2">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-bold uppercase tracking-wider ${headerColors[col]}`}>{labels[col]}</span>
                            <span className="text-xs text-muted-foreground">({colScenes.length})</span>
                          </div>
                          {colScenes.map((s) => (
                            <div key={s.sceneNumber} className="rounded-xl border border-white/8 bg-[oklch(0.10_0_0)] p-4 hover:border-white/15 transition-all">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-mono text-primary font-bold">Scene {s.sceneNumber}</span>
                                <div className="flex gap-1">
                                  {col !== "filming" && (
                                    <button onClick={() => updateSceneStatus(s.sceneNumber, "filming")} className="w-6 h-6 flex items-center justify-center rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Mark Filming">
                                      <Play className="w-3 h-3" />
                                    </button>
                                  )}
                                  {col !== "done" && (
                                    <button onClick={() => updateSceneStatus(s.sceneNumber, "done")} className="w-6 h-6 flex items-center justify-center rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Mark Done">
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                  {col !== "pending" && (
                                    <button onClick={() => updateSceneStatus(s.sceneNumber, "pending")} className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors" title="Reset">
                                      <Clock className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-foreground mb-1">{s.description}</p>
                              {s.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {s.location}
                                </p>
                              )}
                              {s.cast && s.cast.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">Cast: {s.cast.join(", ")}</p>
                              )}
                              {s.notes && <p className="text-xs text-muted-foreground/60 mt-1 italic">{s.notes}</p>}
                            </div>
                          ))}
                          {colScenes.length === 0 && (
                            <div className="rounded-xl border border-dashed border-white/8 p-6 text-center">
                              <p className="text-xs text-muted-foreground opacity-40">No scenes</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Scene Form */}
                  {showSceneForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[oklch(0.12_0_0)] p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-bold text-foreground">Add Scene</h3>
                          <button onClick={() => setShowSceneForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">Scene #</label>
                              <input type="text" value={sceneForm.sceneNumber} onChange={(e) => setSceneForm({ ...sceneForm, sceneNumber: e.target.value })} placeholder="e.g. 1A" className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                              <input type="text" value={sceneForm.location} onChange={(e) => setSceneForm({ ...sceneForm, location: e.target.value })} placeholder="INT. Office" className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                            <textarea value={sceneForm.description} onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })} rows={2} placeholder="Brief scene description..." className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Cast (comma separated)</label>
                            <input type="text" value={sceneForm.cast?.join(", ")} onChange={(e) => setSceneForm({ ...sceneForm, cast: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Ravi, Priya, Arjun..." className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes (optional)</label>
                            <input type="text" value={sceneForm.notes} onChange={(e) => setSceneForm({ ...sceneForm, notes: e.target.value })} placeholder="Any special notes..." className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowSceneForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={addScene} disabled={saving} className="flex-1 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add Scene"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Crew Tab */}
              {activeTab === "crew" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Crew Assignments</h2>
                    <button
                      onClick={() => setShowCrewForm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <UserPlus className="w-4 h-4" /> Add Crew
                    </button>
                  </div>

                  {/* Group by department */}
                  {production.crewAssignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No crew assigned yet.</p>
                    </div>
                  ) : (
                    (() => {
                      const departments: Record<string, ICrew[]> = {};
                      production.crewAssignments.forEach((c) => {
                        const dept = c.department || "Other";
                        if (!departments[dept]) departments[dept] = [];
                        departments[dept].push(c);
                      });
                      return (
                        <div className="space-y-4">
                          {Object.entries(departments).map(([dept, crew]) => (
                            <div key={dept} className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                              <div className="px-5 py-3 border-b border-white/8 bg-white/3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{dept}</h3>
                              </div>
                              <div className="divide-y divide-white/8">
                                {crew.map((c, i) => (
                                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black text-xs font-bold shrink-0">
                                        {c.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">{c.role}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => doAction("remove_crew", { name: c.name })}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}

                  {/* Add Crew Form */}
                  {showCrewForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[oklch(0.12_0_0)] p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-bold text-foreground">Add Crew Member</h3>
                          <button onClick={() => setShowCrewForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                            <input type="text" value={crewForm.name} onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })} placeholder="Full name" className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Role</label>
                            <input type="text" value={crewForm.role} onChange={(e) => setCrewForm({ ...crewForm, role: e.target.value })} placeholder="e.g. DOP, Sound Engineer..." className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Department</label>
                            <select value={crewForm.department} onChange={(e) => setCrewForm({ ...crewForm, department: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[oklch(0.10_0_0)] text-foreground text-sm focus:outline-none focus:border-primary/50">
                              <option value="">Select department</option>
                              {["Camera", "Sound", "Lighting", "Art Direction", "Costume", "Makeup", "VFX", "Editing", "Production", "Direction"].map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowCrewForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={addCrew} disabled={saving} className="flex-1 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Milestones Tab */}
              {activeTab === "schedule" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Project Milestones</h2>
                    <button onClick={() => setShowMilestoneForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                      <Plus className="w-4 h-4" /> Add Milestone
                    </button>
                  </div>

                  {production.milestones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Calendar className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No milestones set.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {production.milestones.map((m, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${m.completed ? "border-green-500/20 bg-green-500/5" : "border-white/8 bg-[oklch(0.10_0_0)] hover:border-white/15"}`}>
                          <button onClick={() => toggleMilestone(m.title)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${m.completed ? "border-green-500 bg-green-500/20" : "border-white/20 hover:border-primary/50"}`}>
                            {m.completed && <Check className="w-3.5 h-3.5 text-green-400" />}
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${m.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{m.title}</p>
                            {m.dueDate && <p className="text-xs text-muted-foreground mt-0.5">{new Date(m.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}
                          </div>
                          {m.completed && <span className="text-xs text-green-400 font-medium shrink-0">Done</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Milestone Form */}
                  {showMilestoneForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[oklch(0.12_0_0)] p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-bold text-foreground">Add Milestone</h3>
                          <button onClick={() => setShowMilestoneForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Milestone Title</label>
                            <input type="text" value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} placeholder="e.g. Principal Photography Complete" className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm focus:outline-none focus:border-primary/50" />
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setShowMilestoneForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={addMilestone} disabled={saving} className="flex-1 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Call Sheet Tab */}
              {activeTab === "callsheet" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Daily Call Sheet</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">Auto-generated from your scenes and crew data.</p>
                    </div>
                    <button onClick={printCallSheet} className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                      <FileText className="w-4 h-4" /> Print / Export PDF
                    </button>
                  </div>

                  {/* Call sheet preview */}
                  <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/8 bg-white/3 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{production.project.title}</h3>
                        <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${prodStatusColors[production.status]}`}>
                        {production.status.replace(/-/g, " ")}
                      </span>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Today's scenes */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Scenes Scheduled</h4>
                        {production.scenes.filter((s) => s.status !== "done").length === 0 ? (
                          <p className="text-sm text-green-400 font-medium">All scenes completed!</p>
                        ) : (
                          <div className="space-y-2">
                            {production.scenes.filter((s) => s.status !== "done").slice(0, 6).map((s) => (
                              <div key={s.sceneNumber} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/8">
                                <span className="text-xs font-mono font-bold text-primary w-12 shrink-0">SC {s.sceneNumber}</span>
                                <div className="flex-1">
                                  <p className="text-sm text-foreground">{s.description}</p>
                                  {s.location && <p className="text-xs text-muted-foreground">{s.location}</p>}
                                </div>
                                {s.cast && s.cast.length > 0 && (
                                  <div className="flex gap-1">
                                    {s.cast.slice(0, 3).map((c) => (
                                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-muted-foreground">{c}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Crew */}
                      {production.crewAssignments.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Crew Call</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {production.crewAssignments.map((c, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8">
                                <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center text-black text-xs font-bold shrink-0">
                                  {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                                  <p className="text-xs text-muted-foreground">{c.role} · {c.department}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Production Notes</h4>
                        <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                          {production.notes ? (
                            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{production.notes}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Pencil className="w-4 h-4 text-muted-foreground/40" />
                              <p className="text-sm text-muted-foreground/40 italic">No notes yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
