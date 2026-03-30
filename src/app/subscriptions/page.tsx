"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2, ArrowRight, Zap, Star, Building2, Crown, Loader2,
  BadgeCheck, TrendingUp, BarChart3, Users, Shield, Infinity,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    desc: "Get started and get discovered",
    color: "border-white/8",
    headerBg: "bg-white/3",
    cta: "Current Plan",
    ctaStyle: "border border-white/15 text-muted-foreground cursor-default",
    highlight: false,
    icon: Star,
    features: [
      { text: "Public profile", included: true },
      { text: "Apply to 5 projects/month", included: true },
      { text: "Basic search access", included: true },
      { text: "Direct messaging", included: true },
      { text: "Portfolio (5 items)", included: true },
      { text: "Profile boost in search", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Unlimited applications", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 499,
    period: "per month",
    desc: "For serious professionals",
    color: "border-primary/40",
    headerBg: "gold-gradient",
    cta: "Upgrade to Pro",
    ctaStyle: "gold-gradient text-black font-semibold",
    highlight: true,
    badge: "Most Popular",
    icon: Zap,
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited applications", included: true },
      { text: "Profile boost in search", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Unlimited portfolio", included: true },
      { text: "Priority support", included: true },
      { text: "Verified badge (Pro)", included: true },
      { text: "Production management tools", included: false },
      { text: "Agency roster tools", included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 999,
    period: "per month",
    desc: "For top-tier professionals",
    color: "border-amber-600/30",
    headerBg: "bg-gradient-to-br from-amber-600/30 to-amber-800/10",
    cta: "Upgrade to Elite",
    ctaStyle: "border border-amber-500/40 text-amber-400 hover:bg-amber-500/10",
    highlight: false,
    icon: Crown,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Elite verified badge", included: true },
      { text: "Priority listing (top of search)", included: true },
      { text: "AI casting recommendations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Featured on homepage", included: true },
      { text: "Production management tools", included: false },
      { text: "Agency roster tools", included: false },
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: 5000,
    period: "per month",
    desc: "For production houses & agencies",
    color: "border-purple-500/30",
    headerBg: "bg-gradient-to-br from-purple-600/20 to-purple-900/5",
    cta: "Contact Sales",
    ctaStyle: "border border-purple-500/30 text-purple-400 hover:bg-purple-500/10",
    highlight: false,
    icon: Building2,
    features: [
      { text: "Everything in Elite", included: true },
      { text: "Production management tools", included: true },
      { text: "Call sheet generator", included: true },
      { text: "Team collaboration (5 seats)", included: true },
      { text: "Agency roster tools", included: true },
      { text: "Bulk audition submissions", included: true },
      { text: "Commission tracking", included: true },
      { text: "Agency-branded page", included: true },
    ],
  },
];

const featureComparison = [
  { feature: "Profile & Discovery", free: "Basic", pro: "Boosted", elite: "Top placement", studio: "Agency page" },
  { feature: "Monthly Applications", free: "5", pro: "Unlimited", elite: "Unlimited", studio: "Unlimited" },
  { feature: "Portfolio Items", free: "5", pro: "Unlimited", elite: "Unlimited", studio: "Unlimited" },
  { feature: "Analytics", free: "—", pro: "Full", elite: "Advanced", studio: "Enterprise" },
  { feature: "Verified Badge", free: "Basic", pro: "Pro badge", elite: "Elite badge", studio: "Agency badge" },
  { feature: "Production Tools", free: "—", pro: "—", elite: "—", studio: "Full suite" },
  { feature: "AI Casting", free: "—", pro: "—", elite: "Included", studio: "Included" },
  { feature: "Support", free: "Community", pro: "Priority email", elite: "Dedicated", studio: "Account manager" },
];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const currentPlan = (user as { plan?: string } | null)?.plan || "free";

  const handleUpgrade = async (planId: string) => {
    if (!user) { window.location.href = "/login"; return; }
    if (planId === "free") return;
    if (planId === "studio") { window.location.href = "/contact"; return; }
    setUpgrading(planId);
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;
      const amountINR = billingAnnual ? Math.round(plan.price * 12 * 0.8) : plan.price;

      // Create Razorpay order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: amountINR, currency: "INR", notes: { plan: planId, billing: billingAnnual ? "annual" : "monthly" } }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        alert(orderData.error || "Failed to create payment order. Please add Razorpay keys in Admin Settings.");
        return;
      }

      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => reject();
          document.head.appendChild(s);
        });
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CineConnect",
        description: `${plan.name} Plan — ${billingAnnual ? "Annual" : "Monthly"}`,
        order_id: orderData.orderId,
        prefill: { name: (user as { name?: string }).name || "", email: (user as { email?: string }).email || "" },
        theme: { color: "#f59e0b" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ ...response, plan: planId }),
          });
          if (verifyRes.ok) {
            alert(`Payment successful! Your ${plan.name} plan is now active.`);
            window.location.reload();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
      });
      rzp.open();
    } catch {
      alert("Payment error. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  const getAnnualPrice = (monthly: number) => Math.round(monthly * 12 * 0.8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
              <Zap className="w-3 h-3" /> Plans & Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Invest in Your <span className="gold-text">Career</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              From free to full-featured studio tools. Choose the plan that matches your ambitions.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-xl border border-white/10 bg-white/5">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!billingAnnual ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${billingAnnual ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Annual
                <span className="px-1.5 py-0.5 rounded-full gold-gradient text-black text-xs font-bold">-20%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Plans grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              const displayPrice = billingAnnual && plan.price > 0
                ? getAnnualPrice(plan.price)
                : plan.price;
              const displayPeriod = billingAnnual && plan.price > 0 ? "per year" : plan.period;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${plan.color} ${plan.highlight ? "shadow-lg shadow-primary/10" : ""}`}
                >
                  {/* Header */}
                  <div className={`p-5 ${plan.headerBg}`}>
                    {plan.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold text-black bg-black/20 mb-3">
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <PlanIcon className={`w-5 h-5 ${plan.highlight ? "text-black" : "text-foreground"}`} />
                      <span className={`font-bold text-lg ${plan.highlight ? "text-black" : "text-foreground"}`}>{plan.name}</span>
                    </div>
                    <div className={`flex items-baseline gap-1 ${plan.highlight ? "text-black" : ""}`}>
                      <span className="text-3xl font-black">
                        {plan.price === 0 ? "Free" : `₹${displayPrice.toLocaleString("en-IN")}`}
                      </span>
                      {plan.price > 0 && <span className="text-sm opacity-70">/{displayPeriod}</span>}
                    </div>
                    <p className={`text-xs mt-1 opacity-70 ${plan.highlight ? "text-black" : "text-muted-foreground"}`}>{plan.desc}</p>
                  </div>

                  {/* Features */}
                  <div className="p-5 bg-[oklch(0.10_0_0)] flex-1">
                    <ul className="space-y-2.5 mb-5">
                      {plan.features.map((f) => (
                        <li key={f.text} className="flex items-start gap-2 text-xs">
                          {f.included
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            : <span className="w-3.5 h-3.5 shrink-0 mt-0.5 flex items-center justify-center text-muted-foreground/30">—</span>}
                          <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrentPlan ? (
                      <div className="w-full py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-semibold text-center">
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading === plan.id}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 ${plan.ctaStyle}`}
                      >
                        {upgrading === plan.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <>{plan.cta} {plan.price > 0 && <ArrowRight className="w-3.5 h-3.5" />}</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature comparison table */}
          <div className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-white/8">
              <h2 className="text-lg font-bold text-foreground">Full Feature Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground w-1/3">Feature</th>
                    {["Free", "Pro", "Elite", "Studio"].map((plan) => (
                      <th key={plan} className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{plan}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-white/8 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                      <td className="px-6 py-3 text-sm text-foreground">{row.feature}</td>
                      {[row.free, row.pro, row.elite, row.studio].map((val, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          {val === "—"
                            ? <span className="text-muted-foreground/30 text-xs">—</span>
                            : <span className="text-xs text-foreground">{val}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why upgrade section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { icon: TrendingUp, title: "3x More Views", desc: "Pro profiles appear higher in discovery search results.", color: "text-primary" },
              { icon: Infinity, title: "Unlimited Applications", desc: "Never miss an opportunity with no monthly limits.", color: "text-blue-400" },
              { icon: BarChart3, title: "Full Analytics", desc: "Track views, application rates, and career growth.", color: "text-green-400" },
              { icon: BadgeCheck, title: "Verified Badge", desc: "Stand out with a verified Pro or Elite badge.", color: "text-amber-400" },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
                <h3 className="font-semibold text-foreground mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">Frequently Asked Questions</h2>
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period." },
              { q: "Is there a free trial for Pro?", a: "We offer a 7-day free trial for new Pro subscribers. No credit card required to start." },
              { q: "How does the escrow payment work?", a: "When a producer hires you through a contract, they deposit the agreed amount into escrow. You receive it automatically on project completion." },
              { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, UPI, and net banking through Razorpay (India) and Stripe (international)." },
            ].map((item) => (
              <div key={item.q} className="p-5 rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)]">
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="p-10 rounded-3xl border border-primary/20 bg-primary/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/10 blur-[80px]" />
            </div>
            <div className="relative">
              <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Still on Free?</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                50,000+ professionals are already building their careers. Pro starts at just ₹499/mo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!user ? (
                  <Link href="/register" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity">
                    Start Free <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : currentPlan === "free" ? (
                  <button
                    onClick={() => handleUpgrade("pro")}
                    disabled={upgrading === "pro"}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {upgrading === "pro" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Upgrade to Pro — ₹499/mo</>}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-400 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    You&apos;re on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
                  </div>
                )}
                <Link href="/discover" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-foreground font-semibold hover:bg-white/10 transition-colors">
                  <Users className="w-4 h-4" /> Browse Talent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
