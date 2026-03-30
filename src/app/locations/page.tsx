"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, IndianRupee, Plus, Search, X, CheckCircle2, Users, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface LocationItem {
  _id: string;
  name: string;
  type: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  dailyRate?: number;
  currency: string;
  area?: number;
  capacity?: number;
  amenities?: string[];
  available: boolean;
  contactName?: string;
  owner: { _id: string; name: string; slug?: string; avatar?: string; isVerified?: boolean };
  createdAt: string;
}

const LOCATION_TYPES = [
  "All", "Indoor Studio", "Outdoor", "Farmhouse", "Bungalow", "Industrial",
  "Office", "Rooftop", "Beach", "Forest", "Heritage", "Other",
];

export default function LocationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LocationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locType, setLocType] = useState("All");
  const [citySearch, setCitySearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "Indoor Studio", description: "",
    address: "", city: "", state: "", pincode: "",
    dailyRate: "", area: "", capacity: "", amenities: "",
    contactName: "", contactPhone: "",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (locType !== "All") params.set("type", locType);
    if (citySearch) params.set("city", citySearch);
    const res = await fetch(`/api/locations?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.locations || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [locType, citySearch]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...form,
        dailyRate: form.dailyRate ? Number(form.dailyRate) : undefined,
        area: form.area ? Number(form.area) : undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        amenities: form.amenities ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean) : [],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => [data.location, ...prev]);
      setTotal((t) => t + 1);
      setShowForm(false);
      setForm({ name: "", type: "Indoor Studio", description: "", address: "", city: "", state: "", pincode: "", dailyRate: "", area: "", capacity: "", amenities: "", contactName: "", contactPhone: "" });
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
                <h1 className="text-3xl font-bold text-foreground mb-1">Film Locations</h1>
                <p className="text-muted-foreground text-sm">
                  {total} listings — studios, outdoor, farmhouses, heritage sites & more
                </p>
              </div>
              {user && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> List a Location
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by city..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {LOCATION_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setLocType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      locType === t
                        ? "gold-gradient text-black"
                        : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/3 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">No locations listed yet.</p>
              {user && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-5 py-2 rounded-xl gold-gradient text-black font-semibold text-sm hover:opacity-90"
                >
                  List your location
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((loc) => (
                <div
                  key={loc._id}
                  className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] hover:border-primary/20 hover:bg-white/3 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loc.available ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                      {loc.available ? "Available" : "Booked"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-foreground text-sm mb-1">{loc.name}</h3>
                  <p className="text-xs text-primary mb-2">{loc.type}</p>

                  {loc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{loc.description}</p>
                  )}

                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{loc.city}, {loc.state}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                    {loc.area && (
                      <span>{loc.area.toLocaleString("en-IN")} sq.ft</span>
                    )}
                    {loc.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {loc.capacity} people
                      </span>
                    )}
                  </div>

                  {loc.amenities && loc.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {loc.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground">{a}</span>
                      ))}
                      {loc.amenities.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground">+{loc.amenities.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    {loc.dailyRate ? (
                      <div className="flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-bold text-primary">{loc.dailyRate.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-muted-foreground ml-1">/day</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Rate on request</span>
                    )}
                    <Link
                      href={`/profile/${loc.owner.slug || loc.owner._id}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      {loc.owner.isVerified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      {loc.owner.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List Location Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[oklch(0.10_0_0)] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <h2 className="text-lg font-bold text-foreground">List a Film Location</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Location Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sunrise Farmhouse, Bandra"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  {LOCATION_TYPES.filter((t) => t !== "All").map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the location, access, parking, restrictions..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">City *</label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">State *</label>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.dailyRate}
                    onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                    placeholder="15000"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Amenities (comma separated)</label>
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder="Parking, Generator, Changing Room, AC..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Name</label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Phone</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
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
                  {submitting ? "Listing..." : "List Location"}
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
