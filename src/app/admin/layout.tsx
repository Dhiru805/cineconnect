"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/projects", label: "Projects & Casting", icon: "🎬" },
  { href: "/admin/kyc", label: "KYC & Verification", icon: "✅" },
  { href: "/admin/finance", label: "Finance & Payments", icon: "💰" },
  { href: "/admin/disputes", label: "Disputes", icon: "🚨" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check admin status via API
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) router.replace("/dashboard");
        else setChecking(false);
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold text-lg animate-pulse">Verifying admin access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[oklch(0.10_0_0)] border-r border-white/8 flex flex-col fixed h-full z-40">
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <div>
              <div className="font-bold text-sm text-white">CineConnect</div>
              <div className="text-xs text-amber-400 font-semibold">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-amber-500/20 text-amber-400 font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
              {user?.name?.[0] || "A"}
            </div>
            <div>
              <div className="text-xs font-medium text-white">{user?.name || "Admin"}</div>
              <div className="text-xs text-amber-400">Super Admin</div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 min-h-screen bg-[oklch(0.09_0_0)]">
        {children}
      </main>
    </div>
  );
}
