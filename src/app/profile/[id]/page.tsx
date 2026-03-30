"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  CheckCircle2,
  Star,
  MessageSquare,
  Bookmark,
  Share2,
  Play,
  Film,
  Award,
  ExternalLink,
  ChevronRight,
  Languages,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface UserProfile {
  _id: string;
  name: string;
  role: string;
  location?: string;
  languages?: string[];
  bio?: string;
  isVerified?: boolean;
  slug?: string;
  skills?: string[];
  niche?: string;
  rateMin?: number;
  rateMax?: number;
  currency?: string;
  showreel?: string;
  portfolio?: { type: string; url: string; title: string }[];
  credits?: { title: string; role: string; year: string; type: string }[];
  followerCount?: number;
  plan?: string;
  verificationLevel?: string;
  availability?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const slug = params?.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/users/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
        } else {
          setError(data.error || "User not found");
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Profile not found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error || "This profile does not exist or has been removed."}</p>
          <Link href="/discover" className="px-5 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90">
            Browse Talent
          </Link>
        </div>
      </div>
    );
  }

  const rateLabel =
    profile.rateMin && profile.rateMax
      ? `${profile.currency || "₹"}${profile.rateMin.toLocaleString("en-IN")} – ${profile.currency || "₹"}${profile.rateMax.toLocaleString("en-IN")}/day`
      : profile.rateMin
      ? `From ${profile.currency || "₹"}${profile.rateMin.toLocaleString("en-IN")}/day`
      : "Rate on request";

  const isAvailable = profile.availability === "available" || profile.availability === "Available";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/discover" className="hover:text-foreground transition-colors">Discover</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/discover?role=${profile.role}`} className="hover:text-foreground transition-colors capitalize">{profile.role}s</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{profile.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero card */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent relative">
                  <div className="absolute inset-0 film-strip opacity-20" />
                </div>

                <div className="px-6 pb-6">
                  <div className="flex items-end justify-between -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-[oklch(0.10_0_0)]">
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 mt-12">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/messages?to=${profile._id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                    {profile.isVerified && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 capitalize">{profile.role}{profile.niche ? ` · ${profile.niche}` : ""}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.location}
                      </div>
                    )}
                    {profile.languages && profile.languages.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5" />
                        {profile.languages.join(", ")}
                      </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${isAvailable ? "text-green-400 bg-green-500/10" : "text-yellow-400 bg-yellow-500/10"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-yellow-500"}`} />
                      {isAvailable ? "Available" : profile.availability || "Status unknown"}
                    </div>
                    {profile.verificationLevel && profile.verificationLevel !== "basic" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                        {profile.verificationLevel}
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Projects", value: profile.credits?.length || 0 },
                  { label: "Plan", value: (profile.plan || "free").toUpperCase() },
                  { label: "Followers", value: (profile.followerCount || 0).toLocaleString("en-IN") },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4 text-center">
                    <div className="text-2xl font-bold gold-text mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Portfolio */}
              {profile.portfolio && profile.portfolio.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4">Portfolio</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {profile.portfolio.map((item, i) => (
                      <a
                        key={i}
                        href={item.url || "#"}
                        target={item.url ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="aspect-video rounded-xl border border-white/8 bg-white/3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-white/20 hover:bg-white/6 transition-all group"
                      >
                        {item.type === "video" ? (
                          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-black ml-0.5" />
                          </div>
                        ) : (
                          <Film className="w-7 h-7 text-white/20 group-hover:text-white/40 transition-colors" />
                        )}
                        <span className="text-xs text-muted-foreground text-center px-2">{item.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Showreel */}
              {profile.showreel && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    Showreel
                  </h2>
                  <a
                    href={profile.showreel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Watch Showreel</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{profile.showreel}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground" />
                  </a>
                </div>
              )}

              {/* Credits */}
              {profile.credits && profile.credits.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-6">
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Film & Project Credits
                  </h2>
                  <div className="space-y-3">
                    {profile.credits.map((credit, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{credit.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{credit.role} · {credit.type}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">{credit.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Rate */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                <p className="text-xs text-muted-foreground mb-1">Day Rate</p>
                <p className="text-lg font-bold text-primary mb-4">{rateLabel}</p>
                <Link
                  href={`/messages?to=${profile._id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity mb-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Link>
                <button className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-white/8 transition-colors">
                  Save to Shortlist
                </button>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs border border-white/10 text-muted-foreground bg-white/3">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Role info */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Role</h3>
                <span className="px-2.5 py-1 rounded-lg text-xs border border-primary/20 text-primary bg-primary/8 capitalize">{profile.role}</span>
                {profile.niche && (
                  <span className="ml-2 px-2.5 py-1 rounded-lg text-xs border border-white/10 text-muted-foreground bg-white/3">{profile.niche}</span>
                )}
              </div>

              {/* Share */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Share Profile</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                  >
                    Copy Link
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${profile.name}'s profile on CineConnect: ${window?.location?.href || ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-lg border border-white/10 bg-white/3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors text-center"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
