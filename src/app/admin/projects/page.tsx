"use client";
import { useEffect, useState, useCallback } from "react";

interface Project {
  _id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  budget: number;
  location: string;
  applicantCount: number;
  createdAt: string;
  producer?: { name: string; email: string; avatar?: string };
}

interface Audition {
  _id: string;
  roleAppliedFor: string;
  status: string;
  createdAt: string;
  project?: { title: string; type: string };
  applicant?: { name: string; email: string; role: string };
  selfTapeUrl?: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500/20 text-emerald-400",
  casting: "bg-blue-500/20 text-blue-400",
  "in-production": "bg-purple-500/20 text-purple-400",
  completed: "bg-white/10 text-white/50",
  cancelled: "bg-red-500/20 text-red-400",
};

const AUD_COLORS: Record<string, string> = {
  applied: "bg-blue-500/20 text-blue-400",
  shortlisted: "bg-amber-500/20 text-amber-400",
  selected: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
  callback: "bg-purple-500/20 text-purple-400",
};

export default function AdminProjects() {
  const [tab, setTab] = useState<"projects" | "auditions">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditions, setAuditions] = useState<Audition[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    if (tab === "projects") {
      const params = new URLSearchParams({ page: String(page), search, status: statusFilter });
      const r = await fetch(`/api/admin/projects?${params}`);
      const d = await r.json();
      setProjects(d.projects || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } else {
      const params = new URLSearchParams({ page: String(page), status: statusFilter });
      const r = await fetch(`/api/admin/auditions?${params}`);
      const d = await r.json();
      setAuditions(d.auditions || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    }
    setLoading(false);
  }, [tab, page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const setProjectStatus = async (projectId: string, status: string) => {
    await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, status }),
    });
    load();
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/admin/projects?projectId=${projectId}`, { method: "DELETE" });
    load();
  };

  const deleteAudition = async (auditionId: string) => {
    if (!confirm("Remove this audition?")) return;
    await fetch(`/api/admin/auditions?auditionId=${auditionId}`, { method: "DELETE" });
    load();
  };

  const PROJECT_STATUSES = ["", "open", "casting", "in-production", "completed", "cancelled"];
  const AUD_STATUSES = ["", "applied", "shortlisted", "selected", "rejected", "callback"];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Projects & Casting</h1>
        <p className="text-white/40 text-sm mt-0.5">{total} {tab}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["projects", "auditions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); setStatusFilter(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-amber-500/20 text-amber-400" : "text-white/50 hover:text-white hover:bg-white/5"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {tab === "projects" && (
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none w-56"
          />
        )}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          {(tab === "projects" ? PROJECT_STATUSES : AUD_STATUSES).map((s) => (
            <option key={s} value={s} className="bg-[#1a1a1a]">{s === "" ? "All Status" : s}</option>
          ))}
        </select>
      </div>

      {/* Projects table */}
      {tab === "projects" && (
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Producer</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Budget</th>
                <th className="text-left px-4 py-3">Applicants</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30 text-sm">Loading...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-white/30 text-sm">No projects found</td></tr>
              ) : projects.map((p) => (
                <tr key={p._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-white">{p.title}</div>
                    <div className="text-[11px] text-white/40">{p.type} · {p.location}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{p.producer?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => setProjectStatus(p._id, e.target.value)}
                      className={`text-[11px] px-2 py-0.5 rounded-full border-0 cursor-pointer ${STATUS_COLORS[p.status] || "bg-white/10 text-white/50"}`}
                    >
                      {PROJECT_STATUSES.slice(1).map((s) => (
                        <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">₹{p.budget?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{p.applicantCount || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteProject(p._id)} className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Auditions table */}
      {tab === "auditions" && (
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Applicant</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Self Tape</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30 text-sm">Loading...</td></tr>
              ) : auditions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-white/30 text-sm">No auditions found</td></tr>
              ) : auditions.map((a) => (
                <tr key={a._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-white">{a.applicant?.name || "—"}</div>
                    <div className="text-[11px] text-white/40">{a.applicant?.role}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{a.project?.title || "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{a.roleAppliedFor}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${AUD_COLORS[a.status] || "bg-white/10 text-white/40"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.selfTapeUrl ? (
                      <a href={a.selfTapeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">View</a>
                    ) : <span className="text-xs text-white/20">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/40">
                    {new Date(a.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteAudition(a._id)} className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded transition-colors">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">Page {page} of {pages}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10">Previous</button>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10">Next</button>
        </div>
      </div>
    </div>
  );
}
