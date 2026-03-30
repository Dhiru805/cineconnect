"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Heart, MessageCircle, Share2, BadgeCheck, Film, Megaphone,
  Award, Camera, Plus, Loader2, Send, ArrowRight, TrendingUp,
  Users, Search,
} from "lucide-react";

interface IAuthor {
  _id: string;
  name: string;
  avatar?: string;
  slug?: string;
  role: string;
  isVerified?: boolean;
  verificationLevel?: string;
}

interface IPost {
  _id: string;
  author: IAuthor;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  type: "post" | "casting_call" | "achievement" | "behind_scenes";
  tags?: string[];
  likeCount: number;
  commentCount: number;
  likes: string[];
  createdAt: string;
}

const typeConfig = {
  post: { label: "Post", color: "text-muted-foreground", bg: "" },
  casting_call: { label: "Casting Call", color: "text-primary", bg: "border-primary/20 bg-primary/5" },
  achievement: { label: "Achievement", color: "text-amber-400", bg: "border-amber-500/20 bg-amber-500/5" },
  behind_scenes: { label: "Behind the Scenes", color: "text-blue-400", bg: "border-blue-500/20 bg-blue-500/5" },
};

const typeIcons = {
  post: Film,
  casting_call: Megaphone,
  achievement: Award,
  behind_scenes: Camera,
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
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function PostCard({ post, currentUserId, onLike }: {
  post: IPost;
  currentUserId?: string;
  onLike: (postId: string, liked: boolean) => void;
}) {
  const liked = currentUserId ? post.likes.includes(currentUserId) : false;
  const typeConf = typeConfig[post.type] || typeConfig.post;
  const TypeIcon = typeIcons[post.type] || Film;
  const initials = post.author.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`rounded-2xl border bg-[oklch(0.10_0_0)] overflow-hidden hover:border-white/15 transition-all ${typeConf.bg || "border-white/8"}`}>
      {/* Post type badge */}
      {post.type !== "post" && (
        <div className={`px-4 py-2 border-b border-white/8 flex items-center gap-1.5 text-xs font-semibold ${typeConf.color}`}>
          <TypeIcon className="w-3 h-3" /> {typeConf.label}
        </div>
      )}

      <div className="p-5">
        {/* Author */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/profile/${post.author.slug || post.author._id}`} className="shrink-0">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-sm hover:opacity-90 transition-opacity">
              {initials}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/profile/${post.author.slug || post.author._id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                {post.author.name}
              </Link>
              {post.author.isVerified && (
                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
              {post.author.verificationLevel === "celebrity" && (
                <span className="px-1.5 py-0.5 rounded-full text-xs gold-gradient text-black font-semibold">★</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{post.author.role}</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

        {/* Media */}
        {post.mediaUrl && post.mediaType === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaUrl}
            alt="post media"
            className="w-full rounded-xl object-cover max-h-80 mb-4 border border-white/8"
          />
        )}
        {post.mediaUrl && post.mediaType === "video" && (
          <div className="relative rounded-xl overflow-hidden mb-4 border border-white/8 bg-black">
            <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center h-36 hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                <Film className="w-6 h-6 text-black" />
              </div>
            </a>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-primary/70 hover:text-primary cursor-pointer">#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/8">
          <button
            onClick={() => onLike(post._id, liked)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{post.likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount}</span>
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/feed#${post._id}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposePost({ onCreated }: { onCreated: (post: IPost) => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [type, setType] = useState<IPost["type"]>("post");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tags, setTags] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  if (!user) return null;

  const initials = user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const r = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: content.trim(),
          type,
          mediaUrl: mediaUrl.trim() || undefined,
          mediaType: mediaUrl ? "video" : undefined,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await r.json();
      if (r.ok) {
        onCreated(data.post);
        setContent("");
        setMediaUrl("");
        setTags("");
        setType("post");
        setExpanded(false);
      }
    } catch {
      // silent
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <textarea
            ref={textRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="Share an update, casting call, or achievement..."
            rows={expanded ? 3 : 1}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />

          {expanded && (
            <div className="mt-3 space-y-3">
              {/* Type */}
              <div className="flex flex-wrap gap-2">
                {(["post", "casting_call", "achievement", "behind_scenes"] as IPost["type"][]).map((t) => {
                  const conf = typeConfig[t];
                  return (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${type === t ? `border-current ${conf.color} bg-white/5` : "border-white/10 text-muted-foreground hover:border-white/20"}`}>
                      {conf.label}
                    </button>
                  );
                })}
              </div>

              {/* Optional media URL */}
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Optional: YouTube / Vimeo / image URL..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-primary/50"
              />

              {/* Tags */}
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated): acting, casting, bollywood..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-primary/50"
              />

              <div className="flex items-center justify-between">
                <button onClick={() => { setExpanded(false); setContent(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button
                  onClick={handlePost}
                  disabled={posting || !content.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<"all" | IPost["type"]>("all");
  const skip = useRef(0);
  const LIMIT = 10;

  const loadPosts = useCallback(async (reset = false) => {
    if (reset) {
      skip.current = 0;
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const typeParam = filter !== "all" ? `&type=${filter}` : "";
      const r = await fetch(`/api/feed?skip=${skip.current}&limit=${LIMIT}${typeParam}`);
      const data = await r.json();
      const newPosts: IPost[] = data.posts || [];
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      skip.current += newPosts.length;
      setHasMore(newPosts.length === LIMIT);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => { loadPosts(true); }, [loadPosts]);

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) { window.location.href = "/login"; return; }
    const action = liked ? "unlike" : "like";
    try {
      const r = await fetch("/api/feed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId, action }),
      });
      const data = await r.json();
      if (r.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, likeCount: data.likeCount, likes: data.liked ? [...p.likes, user._id] : p.likes.filter((id) => id !== user._id) }
              : p
          )
        );
      }
    } catch {
      // silent
    }
  };

  const filterOptions: { id: "all" | IPost["type"]; label: string }[] = [
    { id: "all", label: "All" },
    { id: "casting_call", label: "Casting Calls" },
    { id: "achievement", label: "Achievements" },
    { id: "behind_scenes", label: "Behind the Scenes" },
    { id: "post", label: "Updates" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main feed */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header */}
              <div>
                <h1 className="text-xl font-bold text-foreground">Industry Feed</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Updates, casting calls, and achievements from the community.</p>
              </div>

              {/* Filter */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFilter(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === opt.id ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground border border-white/8 bg-white/3"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Compose */}
              {user && (
                <ComposePost
                  onCreated={(post) => {
                    setPosts((prev) => [post, ...prev]);
                    skip.current += 1;
                  }}
                />
              )}

              {/* Posts */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Film className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No posts yet.</p>
                  {user ? (
                    <p className="text-xs text-muted-foreground opacity-60">Be the first to post an update!</p>
                  ) : (
                    <Link href="/register" className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline">
                      Join to post <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      currentUserId={user?._id}
                      onLike={handleLike}
                    />
                  ))}
                  {hasMore && (
                    <button
                      onClick={() => loadPosts(false)}
                      disabled={loadingMore}
                      className="w-full py-3 rounded-xl border border-white/10 bg-white/3 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Load more"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Search */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search feed..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Trending */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Trending
                </h3>
                <div className="space-y-2">
                  {["#bollywood", "#casting2026", "#OTT", "#indiefilm", "#actinglife"].map((tag) => (
                    <button key={tag} className="block text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested */}
              <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> People to Follow
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Casting Directors", desc: "10k+ in your city", href: "/discover?role=producer" },
                    { name: "Actors & Models", desc: "18k+ verified profiles", href: "/discover?role=talent" },
                    { name: "Film Crew", desc: "DOP, editors & more", href: "/discover?role=crew" },
                  ].map((item) => (
                    <Link key={item.name} href={item.href} className="flex items-center justify-between group hover:opacity-90">
                      <div>
                        <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Post a Casting Call */}
              {user && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Post a Casting Call</h3>
                  <p className="text-xs text-muted-foreground mb-3">Reach 50,000+ talent instantly.</p>
                  <Link href="/post-project" className="flex items-center gap-1.5 px-3 py-2 rounded-xl gold-gradient text-black text-xs font-semibold hover:opacity-90 transition-opacity">
                    <Plus className="w-3.5 h-3.5" /> Post Project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
