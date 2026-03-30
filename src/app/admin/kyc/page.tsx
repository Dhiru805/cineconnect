"use client";
import { useEffect, useState, useCallback } from "react";

interface KycUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  kycStatus: string;
  kycDocumentUrl?: string;
  kycSelfieUrl?: string;
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  kycNotes?: string;
  isVerified: boolean;
  plan: string;
  location?: string;
}

const KYC_TABS = ["pending", "approved", "rejected", "none"] as const;
type KycTab = (typeof KYC_TABS)[number];

const TAB_COLORS: Record<KycTab, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
  none: "bg-white/10 text-white/40",
};

export default function AdminKyc() {
  const [tab, setTab] = useState<KycTab>("pending");
  const [users, setUsers] = useState<KycUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KycUser | null>(null);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), status: tab });
    const r = await fetch(`/api/admin/kyc?${params}`);
    const d = await r.json();
    setUsers(d.users || []);
    setTotal(d.total || 0);
    setPages(d.pages || 1);
    setLoading(false);
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (action: string) => {
    if (!selected) return;
    setActing(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected._id, action, reason }),
    });
    await load();
    setSelected(null);
    setReason("");
    setActing(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">KYC & Verification</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {total} users · {tab} status
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {KYC_TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? TAB_COLORS[t]
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Role / Plan</th>
              <th className="text-left px-4 py-3">KYC Status</th>
              <th className="text-left px-4 py-3">Documents</th>
              <th className="text-left px-4 py-3">Submitted</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/30 text-sm">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/30 text-sm">
                  No users with {tab} KYC
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          u.name[0]
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white flex items-center gap-1">
                          {u.name}
                          {u.isVerified && (
                            <span className="text-emerald-400 text-[10px]">✓</span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/40">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white/60 capitalize">{u.role}</div>
                    <div className="text-[11px] text-white/30">{u.plan}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        TAB_COLORS[u.kycStatus as KycTab] || "bg-white/10 text-white/40"
                      }`}
                    >
                      {u.kycStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {u.kycDocumentUrl ? (
                        <a
                          href={u.kycDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-400 hover:underline"
                        >
                          ID Doc
                        </a>
                      ) : (
                        <span className="text-[11px] text-white/20">No doc</span>
                      )}
                      {u.kycSelfieUrl && (
                        <a
                          href={u.kycSelfieUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-purple-400 hover:underline"
                        >
                          Selfie
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/40">
                    {u.kycSubmittedAt
                      ? new Date(u.kycSubmittedAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(u)}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 bg-amber-400/10 rounded"
                    >
                      Review
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

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[oklch(0.14_0_0)] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/8 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{selected.name}</div>
                <div className="text-xs text-white/40">{selected.email}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/40 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Document Preview */}
              <div className="grid grid-cols-2 gap-3">
                {selected.kycDocumentUrl ? (
                  <div>
                    <div className="text-xs text-white/40 mb-1">Identity Document</div>
                    <a href={selected.kycDocumentUrl} target="_blank" rel="noreferrer">
                      <div className="bg-white/5 border border-white/10 rounded-lg h-28 flex items-center justify-center text-blue-400 text-xs hover:bg-white/8 transition-colors cursor-pointer">
                        View Document
                      </div>
                    </a>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-white/40 mb-1">Identity Document</div>
                    <div className="bg-white/3 border border-dashed border-white/10 rounded-lg h-28 flex items-center justify-center text-white/20 text-xs">
                      Not submitted
                    </div>
                  </div>
                )}
                {selected.kycSelfieUrl ? (
                  <div>
                    <div className="text-xs text-white/40 mb-1">Selfie / Face Verification</div>
                    <a href={selected.kycSelfieUrl} target="_blank" rel="noreferrer">
                      <div className="bg-white/5 border border-white/10 rounded-lg h-28 flex items-center justify-center text-purple-400 text-xs hover:bg-white/8 transition-colors cursor-pointer">
                        View Selfie
                      </div>
                    </a>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-white/40 mb-1">Selfie / Face Verification</div>
                    <div className="bg-white/3 border border-dashed border-white/10 rounded-lg h-28 flex items-center justify-center text-white/20 text-xs">
                      Not submitted
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Role", value: selected.role },
                  { label: "Plan", value: selected.plan },
                  { label: "KYC Status", value: selected.kycStatus },
                  { label: "Verified", value: selected.isVerified ? "Yes" : "No" },
                  {
                    label: "Submitted",
                    value: selected.kycSubmittedAt
                      ? new Date(selected.kycSubmittedAt).toLocaleDateString("en-IN")
                      : "—",
                  },
                  {
                    label: "Reviewed",
                    value: selected.kycReviewedAt
                      ? new Date(selected.kycReviewedAt).toLocaleDateString("en-IN")
                      : "—",
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-white/3 rounded-lg p-2.5">
                    <div className="text-white/40 text-[10px] mb-0.5">{item.label}</div>
                    <div className="text-white capitalize">{item.value}</div>
                  </div>
                ))}
              </div>

              {selected.kycNotes && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <div className="text-xs text-amber-400 font-medium mb-1">Previous Notes</div>
                  <div className="text-xs text-white/60">{selected.kycNotes}</div>
                </div>
              )}

              {/* Notes input */}
              <div>
                <label className="text-xs text-white/40 block mb-1">
                  Notes / Reason (sent to user)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rejection, instructions, etc..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => doAction("approveKyc")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  Approve KYC
                </button>
                <button
                  onClick={() => doAction("rejectKyc")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  Reject KYC
                </button>
                <button
                  onClick={() => doAction("requestKycResubmission")}
                  disabled={acting}
                  className="py-2.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                >
                  Request Resubmit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
