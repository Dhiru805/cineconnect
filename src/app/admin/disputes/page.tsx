"use client";
import { useEffect, useState, useCallback } from "react";

interface Dispute {
  _id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  raisedBy?: { name: string; email: string; avatar?: string };
  against?: { name: string; email: string };
  assignedTo?: { name: string; email: string };
  resolution?: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-500/20 text-red-400",
  in_review: "bg-amber-500/20 text-amber-400",
  resolved: "bg-emerald-500/20 text-emerald-400",
  escalated: "bg-purple-500/20 text-purple-400",
  closed: "bg-white/10 text-white/40",
};

const CAT_COLORS: Record<string, string> = {
  payment: "bg-emerald-500/10 text-emerald-400",
  hiring: "bg-blue-500/10 text-blue-400",
  behavior: "bg-orange-500/10 text-orange-400",
  fraud: "bg-red-500/10 text-red-400",
  content: "bg-purple-500/10 text-purple-400",
  other: "bg-white/10 text-white/40",
};

const STATUSES = ["", "open", "in_review", "resolved", "escalated", "closed"];
const CATEGORIES = ["", "payment", "hiring", "behavior", "fraud", "content", "other"];

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      status: statusFilter,
      category: catFilter,
    });
    const r = await fetch(`/api/admin/disputes?${params}`);
    const d = await r.json();
    setDisputes(d.disputes || []);
    setTotal(d.total || 0);
    setPages(d.pages || 1);
    setLoading(false);
  }, [page, statusFilter, catFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (action: string) => {
    if (!selected) return;
    setActing(true);
    await fetch("/api/admin/disputes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId: selected._id, action, resolution }),
    });
    await load();
    setSelected(null);
    setResolution("");
    setActing(false);
  };

  const openCount = disputes.filter((d) => d.status === "open").length;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dispute Resolution</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} total disputes</p>
        </div>
        {openCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-right">
            <div className="text-[11px] text-red-400/70 uppercase tracking-wider">Open</div>
            <div className="text-xl font-bold text-red-400">{openCount}</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#1a1a1a]">
              {s === "" ? "All Status" : s.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-[#1a1a1a]">
              {c === "" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Subject</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Raised By</th>
              <th className="text-left px-4 py-3">Against</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-white/30 text-sm">
                  Loading...
                </td>
              </tr>
            ) : disputes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-white/30 text-sm">
                  No disputes found
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr key={d._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="text-xs font-medium text-white truncate">{d.subject}</div>
                    <div className="text-[11px] text-white/40 truncate mt-0.5">
                      {d.description.slice(0, 60)}...
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        CAT_COLORS[d.category] || "bg-white/10 text-white/40"
                      }`}
                    >
                      {d.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white">{d.raisedBy?.name || "—"}</div>
                    <div className="text-[11px] text-white/40">{d.raisedBy?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{d.against?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[d.status] || "bg-white/10 text-white/40"
                      }`}
                    >
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/40">
                    {new Date(d.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelected(d);
                        setResolution(d.resolution || "");
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 bg-amber-400/10 rounded"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">
          Page {page} of {pages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>

      {/* Dispute Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[oklch(0.14_0_0)] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/8 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">{selected.subject}</div>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      CAT_COLORS[selected.category] || "bg-white/10 text-white/40"
                    }`}
                  >
                    {selected.category}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[selected.status] || "bg-white/10 text-white/40"
                    }`}
                  >
                    {selected.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/40 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/3 rounded-lg p-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                    Raised By
                  </div>
                  <div className="text-xs text-white font-medium">
                    {selected.raisedBy?.name || "—"}
                  </div>
                  <div className="text-[11px] text-white/40">{selected.raisedBy?.email}</div>
                </div>
                <div className="bg-white/3 rounded-lg p-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                    Against
                  </div>
                  <div className="text-xs text-white font-medium">
                    {selected.against?.name || "—"}
                  </div>
                  <div className="text-[11px] text-white/40">{selected.against?.email || "—"}</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/3 rounded-lg p-3">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                  Description
                </div>
                <div className="text-xs text-white/70 leading-relaxed">
                  {selected.description}
                </div>
              </div>

              {/* Assigned */}
              {selected.assignedTo && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">
                    Assigned To
                  </div>
                  <div className="text-xs text-white">{selected.assignedTo.name}</div>
                </div>
              )}

              {/* Resolution input */}
              <div>
                <label className="text-xs text-white/40 block mb-1">
                  Resolution / Admin Notes
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => doAction("review")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                >
                  Mark In Review
                </button>
                <button
                  onClick={() => doAction("resolve")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  Resolve
                </button>
                <button
                  onClick={() => doAction("escalate")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                  Escalate
                </button>
                <button
                  onClick={() => doAction("close")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-white/10 text-white/60 text-xs font-medium hover:bg-white/15 transition-colors disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
