"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Film, MapPin, IndianRupee, Plus, Search, X, CheckCircle2, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface EquipmentItem {
  _id: string;
  title: string;
  category: string;
  brand?: string;
  model?: string;
  description?: string;
  dailyRate: number;
  currency: string;
  location: string;
  condition: string;
  available: boolean;
  features?: string[];
  owner: { _id: string; name: string; slug?: string; avatar?: string; isVerified?: boolean };
  createdAt: string;
}

const CATEGORIES = [
  "All", "Camera", "Lens", "Lighting", "Audio", "Grip & Electric",
  "Editing Suite", "Drone", "Steadicam", "Generator", "Other",
];

const CONDITION_COLORS: Record<string, string> = {
  new: "text-green-400 bg-green-400/10",
  excellent: "text-blue-400 bg-blue-400/10",
  good: "text-amber-400 bg-amber-400/10",
  fair: "text-orange-400 bg-orange-400/10",
};

export default function EquipmentPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "Camera", brand: "", model: "",
    description: "", dailyRate: "", location: "", condition: "good", features: "",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search) params.set("location", search);
    const res = await fetch(`/api/equipment?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.equipment || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [category, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        dailyRate: Number(form.dailyRate),
        features: form.features ? form.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => [data.equipment, ...prev]);
      setTotal((t) => t + 1);
      setShowForm(false);
      setForm({ title: "", category: "Camera", brand: "", model: "", description: "", dailyRate: "", location: "", condition: "good", features: "" });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.07_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Equipment Rentals</h1>
                <p className="text-muted-foreground text-sm">
                  {total} listings — cameras, lenses, lighting, audio & more
                </p>
              </div>
              {user && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> List Equipment
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === cat
                        ? "gold-gradient text-black"
                        : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-white/3 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">No equipment listings found.</p>
              {user && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-5 py-2 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90"
                >
                  List your first item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 hover:bg-white/3 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Film className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CONDITION_COLORS[item.condition] || "text-muted-foreground bg-white/5"}`}>
                      {item.condition}
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                    {item.brand && <span className="text-xs text-muted-foreground">· {item.brand}</span>}
                  </div>

                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  )}

                  <div className="flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">{item.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <div className="flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold text-primary">{item.dailyRate.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground ml-1">/day</span>
                    </div>
                    <Link
                      href={`/profile/${item.owner.slug || item.owner._id}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {item.owner.isVerified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      {item.owner.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List Equipment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[oklch(0.10_0_0)] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-lg font-bold text-foreground">List Equipment for Rent</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sony FX6 Cinema Camera"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Condition *</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    {["new", "excellent", "good", "fair"].map((c) => (
                      <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Brand</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="Sony, Canon, Arri..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Model</label>
                  <input
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="FX6, EOS R5..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the equipment, what's included, rental terms..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Daily Rate (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Location *</label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Mumbai, Delhi..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Features (comma separated)</label>
                <input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="4K, ND Filter, Battery Included..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Listing..." : "List Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
