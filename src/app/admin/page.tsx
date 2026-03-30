"use client";
import { useEffect, useState } from "react";

interface Stats {
  users: {
    total: number;
    byRole: { talent: number; crew: number; producer: number; agency: number; brand: number };
    activeToday: number;
    activeWeek: number;
    activeMonth: number;
    banned: number;
    flagged: number;
    pendingKyc: number;
  };
  projects: { total: number; open: number };
  auditions: { total: number };
  contracts: { total: number };
  payments: {
    total: number;
    paid: number;
    totalRevenue: number;
    monthlyRevenue: number;
    dailyRevenue: { _id: string; amount: number }[];
  };
  growth: {
    users: { date: string; count: number }[];
  };
}

function StatCard({ label, value, sub, color = "gold" }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    gold: "text-amber-400",
    green: "text-emerald-400",
    blue: "text-blue-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };
  return (
    <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5">
      <div className="text-xs text-white/40 uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-3xl font-bold ${colors[color] || "text-amber-400"}`}>{value}</div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </div>
  );
}

function MiniBar({ data, color = "#f59e0b" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div
            className="w-full rounded-sm min-h-[2px] transition-all"
            style={{ height: `${Math.max(4, (d.value / max) * 56)}px`, background: color, opacity: 0.7 + 0.3 * (d.value / max) }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-white/40 animate-pulse text-sm">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats || stats.users === undefined) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <div className="text-red-400 font-semibold mb-2">Admin Access Required</div>
          <div className="text-white/50 text-sm">Your account does not have admin privileges.</div>
          <div className="mt-4 text-xs text-white/30">
            To grant admin access, use the bootstrap API with your JWT secret.
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const fmtMoney = (n: number) => `₹${n >= 100000 ? `${(n / 100000).toFixed(2)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n}`;

  const userGrowthData = (stats.growth?.users || []).map((d) => ({
    label: d.date,
    value: d.count,
  }));

  const dailyRevenueData = (stats.payments?.dailyRevenue || []).slice(-14).map((d) => ({
    label: d._id,
    value: d.amount,
  }));

  const roleData = [
    { label: "Talent", value: stats.users.byRole.talent, color: "bg-amber-400" },
    { label: "Crew", value: stats.users.byRole.crew, color: "bg-blue-400" },
    { label: "Producer", value: stats.users.byRole.producer, color: "bg-purple-400" },
    { label: "Agency", value: stats.users.byRole.agency, color: "bg-emerald-400" },
    { label: "Brand", value: stats.users.byRole.brand, color: "bg-pink-400" },
  ];
  const totalRoleUsers = roleData.reduce((sum, r) => sum + r.value, 0) || 1;

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Control Center</h1>
        <p className="text-white/40 text-sm mt-1">Platform overview · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={fmt(stats.users.total)} sub={`${stats.users.activeToday} active today`} color="gold" />
        <StatCard label="Total Projects" value={fmt(stats.projects.total)} sub={`${stats.projects.open} open`} color="blue" />
        <StatCard label="Total Revenue" value={fmtMoney(stats.payments.totalRevenue)} sub={`${fmtMoney(stats.payments.monthlyRevenue)} this month`} color="green" />
        <StatCard label="Auditions" value={fmt(stats.auditions.total)} sub={`${stats.contracts.total} contracts`} color="purple" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending KYC" value={stats.users.pendingKyc} color="gold" />
        <StatCard label="Banned Users" value={stats.users.banned} color="red" />
        <StatCard label="Flagged Users" value={stats.users.flagged} color="red" />
        <StatCard label="Paid Payments" value={`${stats.payments.paid}/${stats.payments.total}`} sub="transactions" color="green" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* User Growth */}
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5 col-span-1">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">User Growth (7 days)</div>
          {userGrowthData.length > 0 ? (
            <>
              <MiniBar data={userGrowthData} color="#f59e0b" />
              <div className="flex justify-between mt-2">
                {userGrowthData.map((d, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] text-white/30">
                    {new Date(d.label).toLocaleDateString("en", { weekday: "narrow" })}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-white/20 text-xs text-center py-6">No data yet</div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5 col-span-1">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">Revenue (last 14 days)</div>
          {dailyRevenueData.length > 0 ? (
            <>
              <MiniBar data={dailyRevenueData} color="#34d399" />
              <div className="mt-2 text-xs text-white/30 text-center">
                Peak: {fmtMoney(Math.max(...dailyRevenueData.map((d) => d.value)))}
              </div>
            </>
          ) : (
            <div className="text-white/20 text-xs text-center py-6">No revenue yet</div>
          )}
        </div>

        {/* User by Role */}
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5 col-span-1">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">Users by Role</div>
          <div className="space-y-2.5">
            {roleData.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">{r.label}</span>
                  <span className="text-white/80">{r.value}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.color}`}
                    style={{ width: `${(r.value / totalRoleUsers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">Active Users</div>
          <div className="space-y-3">
            {[
              { label: "Today", val: stats.users.activeToday },
              { label: "This Week", val: stats.users.activeWeek },
              { label: "This Month", val: stats.users.activeMonth },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-white/60">{item.label}</span>
                <span className="text-sm font-semibold text-amber-400">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">Conversion Funnel</div>
          <div className="space-y-3">
            {[
              { label: "Registered Users", val: stats.users.total, color: "bg-amber-400" },
              { label: "Applied to Auditions", val: stats.auditions.total, color: "bg-blue-400" },
              { label: "Hired (Contracts)", val: stats.contracts.total, color: "bg-emerald-400" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-white/60 flex-1">{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-5">
          <div className="text-xs text-white/40 uppercase tracking-widest mb-4">Quick Actions</div>
          <div className="space-y-2">
            {[
              { href: "/admin/users?status=flagged", label: "Review Flagged Users", badge: stats.users.flagged, color: "text-red-400" },
              { href: "/admin/kyc", label: "Pending KYC", badge: stats.users.pendingKyc, color: "text-amber-400" },
              { href: "/admin/disputes", label: "Open Disputes", badge: null, color: "text-blue-400" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 hover:bg-white/6 transition-colors group"
              >
                <span className={`text-xs font-medium ${item.color}`}>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="text-xs bg-white/10 text-white/60 rounded-full px-2 py-0.5">{item.badge}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bootstrap helper */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="text-xs text-amber-400 font-semibold mb-1">Admin Bootstrap</div>
        <div className="text-xs text-white/40">
          To grant admin access to a user: POST <code className="bg-white/5 px-1 rounded">/api/admin/bootstrap</code> with header{" "}
          <code className="bg-white/5 px-1 rounded">X-Admin-Bootstrap: &lt;JWT_SECRET&gt;</code> while logged in as that user.
        </div>
      </div>
    </div>
  );
}
