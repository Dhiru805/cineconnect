"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp, Eye, Briefcase, Star, MessageSquare, IndianRupee,
  ArrowUpRight, Users, BarChart3, Loader2, Calendar, ArrowRight,
  CheckCircle2, XCircle, Clock,
} from "lucide-react";

interface AuditionStats {
  total: number;
  shortlisted: number;
  selected: number;
  rejected: number;
  applied: number;
}

interface EarningsStats {
  total: number;
  activeContracts: number;
  completedContracts: number;
  clients: number;
  recentContracts: { _id: string; roleTitle: string; totalAmount: number; status: string; paymentStatus: string; project: { title: string } | null; producer: { name: string } | null }[];
}

interface IAudition {
  _id: string;
  status: string;
  roleAppliedFor: string;
  createdAt: string;
  project: { _id: string; title: string; type: string; location: string } | null;
}

function MiniBarChart({ data, color = "gold" }: {
  data: { label: string; value: number }[];
  color?: "gold" | "blue" | "green" | "purple";
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = {
    gold: "gold-gradient",
    blue: "bg-blue-500/70",
    green: "bg-green-500/70",
    purple: "bg-purple-500/70",
  };
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
          <div
            className={`w-full rounded-sm transition-all group-hover:opacity-100 opacity-75 ${colors[color]}`}
            style={{ height: `${Math.max(4, (d.value / max) * 72)}px` }}
            title={`${d.label}: ${d.value}`}
          />
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: number;
}) {
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            <ArrowUpRight className={`w-3 h-3 ${trend < 0 ? "rotate-90" : ""}`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 opacity-60">{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [auditions, setAuditions] = useState<IAudition[]>([]);
  const [auditionStats, setAuditionStats] = useState<AuditionStats>({ total: 0, shortlisted: 0, selected: 0, rejected: 0, applied: 0 });
  const [earnings, setEarnings] = useState<EarningsStats>({ total: 0, activeContracts: 0, completedContracts: 0, clients: 0, recentContracts: [] });
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "auditions" | "earnings">("overview");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/auditions", { credentials: "include" }).then((r) => r.ok ? r.json() : null),
      fetch("/api/contracts?role=talent", { credentials: "include" }).then((r) => r.ok ? r.json() : null),
    ]).then(([auditionData, contractData]) => {
      if (auditionData) {
        const list: IAudition[] = auditionData.auditions || [];
        setAuditions(list);
        setAuditionStats({
          total: list.length,
          applied: list.filter((a) => a.status === "applied").length,
          shortlisted: list.filter((a) => a.status === "shortlisted").length,
          selected: list.filter((a) => a.status === "selected").length,
          rejected: list.filter((a) => a.status === "rejected").length,
        });
      }
      if (contractData) {
        const contracts = contractData.contracts || [];
        const completed = contracts.filter((c: { status: string }) => c.status === "completed");
        const active = contracts.filter((c: { status: string }) => ["signed", "sent"].includes(c.status));
        const totalEarned = completed.reduce((sum: number, c: { totalAmount: number; paymentStatus: string }) =>
          c.paymentStatus === "released" ? sum + (c.totalAmount || 0) : sum, 0);
        const uniqueClients = new Set(contracts.map((c: { producer: { _id: string } | null }) => c.producer?._id)).size;
        setEarnings({
          total: totalEarned,
          activeContracts: active.length,
          completedContracts: completed.length,
          clients: uniqueClients,
          recentContracts: contracts.slice(0, 5),
        });
      }
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const successRate = auditionStats.total > 0
    ? Math.round((auditionStats.selected / auditionStats.total) * 100)
    : 0;

  const shortlistRate = auditionStats.total > 0
    ? Math.round(((auditionStats.shortlisted + auditionStats.selected) / auditionStats.total) * 100)
    : 0;

  // Simulated profile views (would be real data in production)
  const profileViews = [42, 67, 55, 89, 120, 98, 134, 78, 110, 145, 162, 130, 175, 155];
  const viewLabels = profileViews.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (profileViews.length - 1 - i));
    return d.toLocaleDateString("en-IN", { weekday: "narrow" });
  });
  const totalViews = profileViews.reduce((a, b) => a + b, 0);

  // Application timeline (last 30 days grouped by week)
  const weeklyApps = [0, 0, 0, 0];
  auditions.forEach((a) => {
    const daysAgo = Math.floor((Date.now() - new Date(a.createdAt).getTime()) / 86400000);
    if (daysAgo < 7) weeklyApps[0]++;
    else if (daysAgo < 14) weeklyApps[1]++;
    else if (daysAgo < 21) weeklyApps[2]++;
    else if (daysAgo < 28) weeklyApps[3]++;
  });
  weeklyApps.reverse();

  const profileComplete = [user.bio, user.location, user.skills?.length, user.portfolio?.length, user.showreel].filter(Boolean).length;
  const profilePct = Math.round((profileComplete / 5) * 100);

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "auditions" as const, label: "Auditions" },
    { id: "earnings" as const, label: "Earnings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Analytics
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Your profile performance and career insights.</p>
              </div>
              <Link href="/settings" className="text-xs text-primary hover:underline flex items-center gap-1">
                Edit Profile <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-1 mt-5 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loadingData ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* KPI grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={Eye} label="Profile Views (14d)" value={totalViews} sub="Simulated data" color="text-blue-400" trend={12} />
                    <StatCard icon={Briefcase} label="Total Applications" value={auditionStats.total} color="text-primary" />
                    <StatCard icon={Star} label="Shortlist Rate" value={`${shortlistRate}%`} sub={`${auditionStats.shortlisted + auditionStats.selected} shortlisted`} color="text-amber-400" />
                    <StatCard icon={CheckCircle2} label="Selection Rate" value={`${successRate}%`} sub={`${auditionStats.selected} selected`} color="text-green-400" />
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Profile views chart */}
                    <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Profile Views (14 days)</h3>
                        <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> +12%
                        </span>
                      </div>
                      <MiniBarChart
                        data={profileViews.map((v, i) => ({ label: viewLabels[i], value: v }))}
                        color="gold"
                      />
                      <div className="flex items-center justify-between mt-2">
                        {viewLabels.slice(0, 7).map((l, i) => (
                          <span key={i} className="flex-1 text-center text-xs text-muted-foreground">{l}</span>
                        ))}
                      </div>
                    </div>

                    {/* Applications chart */}
                    <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Applications (Last 4 Weeks)</h3>
                      </div>
                      <MiniBarChart
                        data={weeklyApps.map((v, i) => ({ label: `W${i + 1}`, value: v }))}
                        color="blue"
                      />
                      <div className="flex items-center justify-around mt-2">
                        {["4w ago", "3w ago", "2w ago", "This week"].map((l) => (
                          <span key={l} className="text-xs text-muted-foreground">{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Funnel */}
                  <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                    <h3 className="text-sm font-semibold text-foreground mb-5">Application Funnel</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Applied", count: auditionStats.total, color: "bg-primary", pct: 100 },
                        { label: "Under Review", count: auditionStats.applied, color: "bg-blue-500", pct: auditionStats.total > 0 ? Math.round((auditionStats.applied / auditionStats.total) * 100) : 0 },
                        { label: "Shortlisted", count: auditionStats.shortlisted, color: "bg-amber-500", pct: auditionStats.total > 0 ? Math.round((auditionStats.shortlisted / auditionStats.total) * 100) : 0 },
                        { label: "Selected", count: auditionStats.selected, color: "bg-green-500", pct: auditionStats.total > 0 ? Math.round((auditionStats.selected / auditionStats.total) * 100) : 0 },
                      ].map((stage) => (
                        <div key={stage.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">{stage.label}</span>
                            <span className="text-xs font-semibold text-foreground">{stage.count}</span>
                          </div>
                          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${stage.color} opacity-70 transition-all`} style={{ width: `${stage.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile strength */}
                  <div className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Profile Strength</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="8" />
                          <circle cx="40" cy="40" r="34" fill="none" stroke="oklch(0.78 0.15 85)" strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - profilePct / 100)}`}
                            strokeLinecap="round" className="transition-all duration-700" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold gold-text">{profilePct}%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {profilePct >= 80 ? "Strong Profile!" : profilePct >= 50 ? "Good Progress" : "Needs Attention"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {profilePct < 100 ? "Complete your profile to appear higher in search results and get 3x more views." : "Your profile is fully optimised!"}
                        </p>
                        {profilePct < 100 && (
                          <Link href="/settings" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                            Complete now <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Bio", done: !!user.bio },
                        { label: "Location", done: !!user.location },
                        { label: "Skills", done: !!(user.skills?.length) },
                        { label: "Portfolio", done: !!(user.portfolio?.length) },
                        { label: "Showreel", done: !!user.showreel },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5 text-xs">
                          {item.done
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />}
                          <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Auditions Tab */}
              {activeTab === "auditions" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={Briefcase} label="Total" value={auditionStats.total} color="text-primary" />
                    <StatCard icon={Clock} label="Pending" value={auditionStats.applied} color="text-blue-400" />
                    <StatCard icon={Star} label="Shortlisted" value={auditionStats.shortlisted} color="text-amber-400" />
                    <StatCard icon={CheckCircle2} label="Selected" value={auditionStats.selected} color="text-green-400" />
                  </div>

                  {auditions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Briefcase className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">No applications yet.</p>
                      <Link href="/projects" className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold">
                        Browse Projects <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Application History</h3>
                        <Link href="/auditions" className="text-xs text-primary hover:underline flex items-center gap-1">
                          Full view <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="divide-y divide-white/8">
                        {auditions.map((a) => {
                          const statusConfig: Record<string, { color: string; label: string }> = {
                            applied: { color: "text-blue-400 bg-blue-500/10", label: "Applied" },
                            shortlisted: { color: "text-amber-400 bg-amber-500/10", label: "Shortlisted" },
                            selected: { color: "text-green-400 bg-green-500/10", label: "Selected" },
                            rejected: { color: "text-red-400 bg-red-500/10", label: "Not Selected" },
                          };
                          const sc = statusConfig[a.status] || statusConfig.applied;
                          return (
                            <div key={a._id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{a.project?.title || "Project"}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <span>{a.roleAppliedFor}</span>
                                  <span>·</span>
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                </div>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${sc.color}`}>{sc.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Earnings Tab */}
              {activeTab === "earnings" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={IndianRupee} label="Total Earned" value={earnings.total > 0 ? `₹${earnings.total.toLocaleString("en-IN")}` : "₹0"} sub="Released payments" color="text-green-400" />
                    <StatCard icon={Briefcase} label="Active Contracts" value={earnings.activeContracts} sub="Signed / In progress" color="text-primary" />
                    <StatCard icon={CheckCircle2} label="Completed" value={earnings.completedContracts} sub="Finished projects" color="text-emerald-400" />
                    <StatCard icon={Users} label="Clients" value={earnings.clients} sub="Unique producers" color="text-blue-400" />
                  </div>

                  {earnings.recentContracts.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] flex flex-col items-center text-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
                      <h3 className="text-sm font-semibold text-foreground mb-2">No contracts yet</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mb-5">Once a producer hires you through the hiring system, your earnings will appear here.</p>
                      <Link href="/hiring" className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                        View Hiring <MessageSquare className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                      <div className="px-5 py-4 border-b border-white/8">
                        <h3 className="text-sm font-semibold text-foreground">Recent Contracts</h3>
                      </div>
                      <div className="divide-y divide-white/8">
                        {earnings.recentContracts.map((c) => {
                          const statusColors: Record<string, string> = {
                            draft: "text-white/40 bg-white/5",
                            sent: "text-blue-400 bg-blue-500/10",
                            signed: "text-amber-400 bg-amber-500/10",
                            completed: "text-green-400 bg-green-500/10",
                            cancelled: "text-red-400 bg-red-500/10",
                          };
                          return (
                            <div key={c._id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{c.roleTitle}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <span>{c.project?.title || "Project"}</span>
                                  {c.producer && <><span>·</span><span>by {c.producer.name}</span></>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-bold text-foreground">₹{(c.totalAmount || 0).toLocaleString("en-IN")}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[c.status] || "text-white/40 bg-white/5"}`}>{c.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="px-5 py-3 border-t border-white/8">
                        <Link href="/hiring" className="text-xs text-primary hover:underline flex items-center gap-1">
                          View all contracts <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
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
