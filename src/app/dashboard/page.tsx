"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, User, Search, Briefcase, MessageSquare, Video, Settings,
  Bell, TrendingUp, Eye, Star, ArrowRight, Clock, MapPin, Award,
  ArrowUpRight, ChevronRight, Users, IndianRupee, Clapperboard,
} from "lucide-react";

const statusColors: Record<string, string> = {
  shortlisted: "text-green-400 bg-green-500/10 border-green-500/20",
  under_review: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  applied: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  shortlisted: "Shortlisted",
  under_review: "Under Review",
  applied: "Applied",
  rejected: "Not Selected",
};

interface Application {
  _id: string;
  projectId: { title: string } | null;
  producerName?: string;
  status: string;
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  location: string;
  budget: number;
  type: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("overview");
  const [applications, setApplications] = useState<Application[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    // Load applications
    fetch("/api/auditions?mine=true", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setApplications(d.auditions || []))
      .catch(() => {});
    // Load suggested projects
    fetch(`/api/projects?status=open&limit=3`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSuggestedProjects(d.projects || []))
      .catch(() => {});
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "profile", icon: User, label: "My Profile", href: `/profile/${user.slug || "me"}` },
    { id: "discover", icon: Search, label: "Discover", href: "/discover" },
    { id: "projects", icon: Briefcase, label: "Projects", href: "/projects" },
    { id: "auditions", icon: Video, label: "Auditions", href: "/auditions" },
    { id: "messages", icon: MessageSquare, label: "Messages", href: "/messages" },
    { id: "analytics", icon: TrendingUp, label: "Analytics" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Profile Views", value: "—", icon: Eye, color: "text-blue-400" },
    { label: "Applications", value: String(applications.length), icon: Briefcase, color: "text-green-400" },
    { label: "Shortlisted", value: String(applications.filter((a) => a.status === "shortlisted").length), icon: Star, color: "text-primary" },
    { label: "Messages", value: "—", icon: MessageSquare, color: "text-purple-400" },
  ];

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const profileComplete = [user.bio, user.location, user.skills?.length, user.portfolio?.length, user.showreel].filter(Boolean).length;
  const profilePct = Math.round((profileComplete / 5) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 z-40 w-60 border-r border-white/8 bg-[oklch(0.09_0_0)] flex flex-col lg:translate-x-0 -translate-x-full lg:flex">
          <div className="p-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.availability === "available" ? "bg-green-500" : "bg-yellow-500"}`} />
                  {user.availability || user.role}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex-1 bg-white/8 rounded-full h-1.5 overflow-hidden">
                <div className="h-full gold-gradient rounded-full transition-all" style={{ width: `${profilePct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">{profilePct}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profile completeness</p>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-0.5">
              {navItems.map((item) =>
                item.href ? (
                  <Link key={item.id} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeNav === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                )
              )}
            </div>
          </nav>

          <div className="p-3 border-t border-white/8 space-y-2">
            {user.plan === "free" && (
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-xs font-semibold text-primary mb-1">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground mb-2">Unlimited applications + profile boost</p>
                <button className="w-full py-1.5 rounded-lg gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity">
                  ₹499/month
                </button>
              </div>
            )}
            <button onClick={logout} className="w-full py-2 rounded-lg border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-60 min-w-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user.name?.split(" ")[0]}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening with your profile today.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <Link href="/post-project" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Clapperboard className="w-4 h-4" />
                  Post Project
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Profile nudge */}
                {profilePct < 80 && (
                  <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">Complete your profile to get 3x more views</p>
                      <p className="text-xs text-muted-foreground mb-3">Add your showreel, set your rate, and complete your bio.</p>
                      <Link href="/onboarding" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-xs text-primary hover:bg-primary/10 transition-colors font-medium">
                        Complete Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Applications */}
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h3 className="text-sm font-semibold text-foreground">My Applications</h3>
                    <Link href="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Find projects <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {applications.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No applications yet.</p>
                      <Link href="/projects" className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline">
                        Browse open projects <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/8">
                      {applications.slice(0, 5).map((app) => (
                        <div key={app._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{app.projectId?.title || "Project"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${statusColors[app.status] || statusColors.applied}`}>
                            {statusLabels[app.status] || "Applied"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested projects */}
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h3 className="text-sm font-semibold text-foreground">Open Projects</h3>
                    <Link href="/projects" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {suggestedProjects.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No open projects right now.</div>
                  ) : (
                    <div className="divide-y divide-white/8">
                      {suggestedProjects.map((proj) => (
                        <div key={proj._id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{proj.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="capitalize">{proj.type}</span>
                              {proj.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{proj.location}</div>}
                              {proj.budget && <div className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{proj.budget.toLocaleString("en-IN")}</div>}
                            </div>
                          </div>
                          <Link href={`/projects`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity shrink-0">
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Analytics bar */}
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Profile Views (Last 7 Days)</h3>
                    <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                      Full Analytics <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[42, 67, 55, 89, 120, 98, 134].map((val, i) => (
                      <div key={i} className="flex-1 rounded-sm gold-gradient opacity-70 hover:opacity-100 transition-opacity" style={{ height: `${(val / 134) * 100}%` }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <span key={d} className="flex-1 text-center">{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">
                {/* Profile card */}
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-lg">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role} · {user.location || "Location not set"}</p>
                    </div>
                  </div>
                  {user.bio ? (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{user.bio}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground/50 mb-3 italic">No bio yet</p>
                  )}
                  <Link href="/onboarding" className="block w-full py-2 rounded-lg border border-white/10 text-xs text-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                    Edit Profile
                  </Link>
                </div>

                {/* Quick actions */}
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                  <div className="space-y-1">
                    {[
                      { label: "Browse Auditions", icon: Video, href: "/auditions", color: "text-primary" },
                      { label: "Find Projects", icon: Search, href: "/projects", color: "text-blue-400" },
                      { label: "Discover Talent", icon: Users, href: "/discover", color: "text-green-400" },
                      { label: "Messages", icon: MessageSquare, href: "/messages", color: "text-purple-400" },
                    ].map((action) => (
                      <Link key={action.label} href={action.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account info */}
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Account</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <span className={`font-medium capitalize ${user.plan === "pro" ? "text-primary" : "text-foreground"}`}>{user.plan || "Free"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Role</span>
                      <span className="font-medium text-foreground capitalize">{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified</span>
                      <span className={`font-medium ${user.isVerified ? "text-green-400" : "text-muted-foreground"}`}>{user.isVerified ? "Yes" : "Pending"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
