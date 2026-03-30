"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu, X, Film, Bell, ChevronDown, Search, LogOut,
  LayoutDashboard, Settings, User, BarChart3, Clapperboard,
  Rss, CreditCard, Users, BookOpen, GraduationCap, Calendar, Building2, Bot, MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Projects", href: "/projects" },
  { label: "Auditions", href: "/auditions" },
  { label: "Feed", href: "/feed" },
  { label: "Messages", href: "/messages" },
];

const moreLinks = [
  { label: "Hiring & Contracts", href: "/hiring", icon: BookOpen },
  { label: "Production Board", href: "/production", icon: Clapperboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Equipment", href: "/equipment", icon: Film },
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Events & Festivals", href: "/events", icon: Calendar },
  { label: "Agency Tools", href: "/agency", icon: Building2 },
  { label: "AI Casting", href: "/ai-casting", icon: Bot },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  // Fetch unread notification count
  useEffect(() => {
    if (!user) { setNotifCount(0); return; }
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setNotifCount(d.unreadCount || 0); })
      .catch(() => {});
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Film className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight gold-text">CineConnect</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-primary bg-white/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              More <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[oklch(0.12_0_0)] shadow-2xl py-1 z-50">
                {moreLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/discover"
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <Search className="w-4 h-4" />
          </Link>

          {!loading && user && (
            <Link
              href="/notifications"
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gold-gradient flex items-center justify-center text-[9px] font-bold text-black">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
          )}

          {!loading && user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-black shrink-0">
                  {initial}
                </div>
                <span className="text-foreground text-xs max-w-[80px] truncate hidden lg:block">{user.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[oklch(0.12_0_0)] shadow-2xl py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-white/8">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-primary capitalize mt-0.5">{user.role} · {(user.plan || "free").toUpperCase()}</p>
                  </div>
                  {[
                    { label: "My Profile", href: `/profile/${(user as { slug?: string }).slug || user._id}`, icon: User },
                    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                    { label: "Analytics", href: "/analytics", icon: BarChart3 },
                    { label: "Feed", href: "/feed", icon: Rss },
                    { label: "Settings", href: "/settings", icon: Settings },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      {item.label}
                    </Link>
                  ))}
                  {(user as { isAdmin?: boolean }).isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="w-3.5 h-3.5 text-xs flex items-center justify-center">★</span>
                      Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-white/8 mt-1 pt-1">
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-1.5 rounded-lg gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                Join Free
              </Link>
            </div>
          ) : null}

          {user && (
            <Link
              href="/post-project"
              className="ml-1 px-4 py-1.5 rounded-lg gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Post Project
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-black/95 px-4 py-4 flex flex-col gap-1 max-h-[85vh] overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href ? "text-primary bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-white/8 my-1" />

          {moreLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              {item.label}
            </Link>
          ))}

          <div className="border-t border-white/8 mt-1 pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link href={`/profile/${(user as { slug?: string }).slug || user._id}`} onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 flex items-center gap-2.5">
                  <User className="w-3.5 h-3.5" /> My Profile
                </Link>
                <Link href="/notifications" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 flex items-center gap-2.5">
                  <Bell className="w-3.5 h-3.5" /> Notifications
                  {notifCount > 0 && <span className="ml-auto text-xs gold-gradient text-black px-1.5 py-0.5 rounded-full font-bold">{notifCount}</span>}
                </Link>
                <Link href="/settings" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 flex items-center gap-2.5">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
                <Link href="/post-project" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg gold-gradient text-black text-sm font-semibold text-center">
                  Post Project
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 text-left flex items-center gap-2.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg gold-gradient text-black text-sm font-semibold text-center">
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
