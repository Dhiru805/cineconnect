"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Bell, Check, CheckCheck, Loader2, Briefcase, MessageSquare,
  Star, Trophy, AlertCircle, Info, ArrowRight, Trash2,
} from "lucide-react";

interface INotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  audition: { icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
  message: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
  shortlist: { icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  selected: { icon: Trophy, color: "text-green-400", bg: "bg-green-500/10" },
  alert: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  info: { icon: Info, color: "text-muted-foreground", bg: "bg-white/8" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Group notifications by date
function groupByDate(notifications: INotification[]) {
  const groups: Record<string, INotification[]> = {};
  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user]);

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClick = (n: INotification) => {
    if (!n.isRead) markRead(n._id);
    if (n.link) router.push(n.link);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const grouped = groupByDate(displayed);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors disabled:opacity-50"
                >
                  {markingAll
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <CheckCheck className="w-3.5 h-3.5" />}
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 mt-5">
              {(["all", "unread"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${filter === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {tab}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs gold-gradient text-black font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl border border-white/8 bg-white/5 flex items-center justify-center mb-5">
                <Bell className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                {filter === "unread"
                  ? "You're all caught up! Switch to 'All' to see past notifications."
                  : "When you get audition updates, messages, or casting alerts, they'll appear here."}
              </p>
              {filter === "unread" ? (
                <button onClick={() => setFilter("all")} className="text-sm text-primary hover:underline">
                  View all notifications
                </button>
              ) : (
                <Link href="/projects" className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90">
                  Browse Projects <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    {dateLabel}
                  </h2>
                  <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden divide-y divide-white/8">
                    {items.map((n) => {
                      const conf = typeConfig[n.type] || typeConfig.info;
                      const Icon = conf.icon;
                      return (
                        <div
                          key={n._id}
                          onClick={() => handleClick(n)}
                          className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer group ${n.isRead ? "hover:bg-white/3" : "bg-primary/3 hover:bg-primary/5"}`}
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${conf.bg}`}>
                            <Icon className={`w-4 h-4 ${conf.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-foreground" : "text-foreground"}`}>
                                {n.title}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                            {n.link && (
                              <span className="text-xs text-primary mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                View details <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          {/* Unread dot / read action */}
                          <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
                            {!n.isRead && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                            {!n.isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/8"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-muted-foreground" />
                              </button>
                            )}
                            {n.isRead && (
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings link */}
          {notifications.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/settings" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Manage notification preferences in Settings
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
