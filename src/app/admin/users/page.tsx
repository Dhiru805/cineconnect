"use client";
import { useEffect, useState, useCallback } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  plan: string;
  isVerified: boolean;
  isBanned: boolean;
  flagged: boolean;
  kycStatus: string;
  isAdmin: boolean;
  createdAt: string;
  location?: string;
  followerCount?: number;
}

const ROLES = ["", "talent", "crew", "producer", "agency", "brand"];
const PLANS = ["", "free", "pro", "elite"];
const KYC_STATUSES = ["", "none", "pending", "approved", "rejected"];
const STATUS_FILTERS = ["", "banned", "flagged", "verified"];

const BADGE_ROLE: Record<string, string> = {
  talent: "bg-amber-500/20 text-amber-400",
  crew: "bg-blue-500/20 text-blue-400",
  producer: "bg-purple-500/20 text-purple-400",
  agency: "bg-emerald-500/20 text-emerald-400",
  brand: "bg-pink-500/20 text-pink-400",
};

const BADGE_KYC: Record<string, string> = {
  none: "bg-white/10 text-white/40",
  pending: "bg-amber-500/20 text-amber-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [kyc, setKyc] = useState("");
  const [plan, setPlan] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), search, role, status, kyc, plan });
    const r = await fetch(`/api/admin/users?${params}`);
    const d = await r.json();
    setUsers(d.users || []);
    setTotal(d.total || 0);
    setPages(d.pages || 1);
    setLoading(false);
  }, [page, search, role, status, kyc, plan]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (action: string, value?: any) => {
    if (!selected) return;
    setActionLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected._id, action, value, reason }),
    });
    await load();
    setSelected(null);
    setReason("");
    setActionLoading(false);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    await load();
    setSelected(null);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 w-64"
        />
        {[
          { val: role, set: setRole, opts: ROLES, label: "Role" },
          { val: status, set: setStatus, opts: STATUS_FILTERS, label: "Status" },
          { val: kyc, set: setKyc, opts: KYC_STATUSES, label: "KYC" },
          { val: plan, set: setPlan, opts: PLANS, label: "Plan" },
        ].map((f) => (
          <select
            key={f.label}
            value={f.val}
            onChange={(e) => { f.set(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            {f.opts.map((o) => (
              <option key={o} value={o} className="bg-[#1a1a1a]">
                {o === "" ? `All ${f.label}` : o.charAt(0).toUpperCase() + o.slice(1)}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-left px-4 py-3">KYC</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30 text-sm">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-white/30 text-sm">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-bold overflow-hidden">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name[0]}
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium flex items-center gap-1">
                        {u.name}
                        {u.isAdmin && <span className="text-amber-400 text-[9px] bg-amber-400/10 px-1 rounded">ADMIN</span>}
                        {u.isVerified && <span className="text-emerald-400">✓</span>}
                      </div>
                      <div className="text-white/40 text-[11px]">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${BADGE_ROLE[u.role] || "bg-white/10 text-white/50"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-white/50">{u.plan}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${BADGE_KYC[u.kycStatus] || "bg-white/10 text-white/40"}`}>
                    {u.kycStatus || "none"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {u.isBanned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Banned</span>}
                    {u.flagged && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">Flagged</span>}
                    {!u.isBanned && !u.flagged && <span className="text-[10px] text-white/30">Active</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] text-white/40">
                  {new Date(u.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(u)}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 bg-amber-400/10 rounded"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">Showing {users.length} of {total}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-white/40">{page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[oklch(0.14_0_0)] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {selected.avatar ? <img src={selected.avatar} alt="" className="w-full h-full object-cover" /> : selected.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{selected.name}</div>
                  <div className="text-xs text-white/40">{selected.email}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Role", value: selected.role },
                  { label: "Plan", value: selected.plan },
                  { label: "KYC", value: selected.kycStatus || "none" },
                  { label: "Verified", value: selected.isVerified ? "Yes" : "No" },
                  { label: "Banned", value: selected.isBanned ? "Yes" : "No" },
                  { label: "Flagged", value: selected.flagged ? "Yes" : "No" },
                  { label: "Admin", value: selected.isAdmin ? "Yes" : "No" },
                  { label: "Joined", value: new Date(selected.createdAt).toLocaleDateString("en-IN") },
                ].map((item) => (
                  <div key={item.label} className="bg-white/3 rounded-lg p-2.5">
                    <div className="text-white/40 text-[10px] mb-0.5">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Reason input */}
              <div>
                <label className="text-xs text-white/40 block mb-1">Reason / Notes (optional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for action..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Account Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {!selected.isBanned ? (
                    <button onClick={() => doAction("ban")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors">
                      Ban User
                    </button>
                  ) : (
                    <button onClick={() => doAction("unban")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">
                      Unban User
                    </button>
                  )}
                  {!selected.flagged ? (
                    <button onClick={() => doAction("flag")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-orange-500/20 text-orange-400 text-xs hover:bg-orange-500/30 transition-colors">
                      Flag User
                    </button>
                  ) : (
                    <button onClick={() => doAction("unflag")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-white/10 text-white/60 text-xs hover:bg-white/15 transition-colors">
                      Unflag
                    </button>
                  )}
                </div>

                <div className="text-xs text-white/40 uppercase tracking-wider mt-3 mb-2">Verification</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => doAction("verify")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">
                    Verify Profile
                  </button>
                  <button onClick={() => doAction("unverify")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-white/10 text-white/60 text-xs hover:bg-white/15 transition-colors">
                    Remove Verification
                  </button>
                  <button onClick={() => doAction("approveKyc")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors">
                    Approve KYC
                  </button>
                  <button onClick={() => doAction("rejectKyc")} disabled={actionLoading} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors">
                    Reject KYC
                  </button>
                </div>

                <div className="text-xs text-white/40 uppercase tracking-wider mt-3 mb-2">Role & Plan</div>
                <div className="grid grid-cols-3 gap-2">
                  {["free", "pro", "elite"].map((p) => (
                    <button key={p} onClick={() => doAction("setPlan", p)} disabled={actionLoading}
                      className={`px-2 py-2 rounded-lg text-xs transition-colors ${selected.plan === p ? "bg-amber-500/30 text-amber-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => doAction("setAdmin", !selected.isAdmin)}
                    disabled={actionLoading}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs transition-colors ${selected.isAdmin ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                  >
                    {selected.isAdmin ? "Revoke Admin" : "Grant Admin"}
                  </button>
                  <button
                    onClick={() => deleteUser(selected._id)}
                    disabled={actionLoading}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors border border-red-500/20"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
