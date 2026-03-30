"use client";
import { useState, useEffect } from "react";

const SECTIONS = [
  "General",
  "Integrations",
  "Commission",
  "Subscriptions",
  "Notifications",
  "Security",
  "Admin Roles",
] as const;
type Section = (typeof SECTIONS)[number];

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm text-white font-medium">{label}</div>
        {description && <div className="text-xs text-white/40 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          value ? "bg-amber-500" : "bg-white/15"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-white/40 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
        />
        {suffix && <span className="text-xs text-white/40">{suffix}</span>}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [section, setSection] = useState<Section>("General");

  // General
  const [platformName, setPlatformName] = useState("CineConnect");
  const [platformTagline, setPlatformTagline] = useState(
    "India's Premier Film & TV Casting Platform"
  );
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  // Commission
  const [hiringCommission, setHiringCommission] = useState("10");
  const [equipmentCommission, setEquipmentCommission] = useState("8");
  const [locationCommission, setLocationCommission] = useState("12");
  const [minEscrowDays, setMinEscrowDays] = useState("3");

  // Subscriptions
  const [proPrice, setProPrice] = useState("999");
  const [elitePrice, setElitePrice] = useState("2499");
  const [proAuditionLimit, setProAuditionLimit] = useState("50");
  const [eliteAuditionLimit, setEliteAuditionLimit] = useState("999");

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [disputeAlerts, setDisputeAlerts] = useState(true);
  const [kycAlerts, setKycAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  // Integrations
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayMode, setRazorpayMode] = useState<"live" | "test">("test");
  const [integrationSaved, setIntegrationSaved] = useState(false);
  const [integrationError, setIntegrationError] = useState("");
  const [integrationStatus, setIntegrationStatus] = useState<{
    isConfigured: boolean; mode: string; keyId: string; hasSecret: boolean;
  } | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);

  // Load current key status on mount (when Integrations tab is selected)
  useEffect(() => {
    if (section !== "Integrations" || integrationStatus !== null) return;
    setLoadingKeys(true);
    fetch("/api/admin/settings/integrations", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        setIntegrationStatus(d);
        setRazorpayMode(d.mode === "live" ? "live" : "test");
        // Pre-fill the key_id field with the full value if available
        if (d.keyIdFull) setRazorpayKeyId(d.keyIdFull);
      })
      .catch(() => {})
      .finally(() => setLoadingKeys(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const handleIntegrationSave = async () => {
    setIntegrationError("");
    try {
      const r = await fetch("/api/admin/settings/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ razorpayKeyId, razorpayKeySecret, razorpayMode }),
      });
      const d = await r.json();
      if (!r.ok) { setIntegrationError(d.error || "Failed to save keys"); return; }
      setIntegrationSaved(true);
      setRazorpayKeySecret("");
      setIntegrationStatus({ isConfigured: true, mode: razorpayMode, keyId: razorpayKeyId.substring(0, 12) + "•••••••••••••", hasSecret: true });
      setTimeout(() => setIntegrationSaved(false), 3000);
    } catch {
      setIntegrationError("Network error. Please try again.");
    }
  };

  // Security
  const [requireKycForHire, setRequireKycForHire] = useState(false);
  const [requireKycForProjects, setRequireKycForProjects] = useState(false);
  const [autoFlagSuspicious, setAutoFlagSuspicious] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, POST to /api/admin/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">System Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Platform configuration & controls</p>
      </div>

      <div className="flex gap-6">
        {/* Section nav */}
        <div className="w-44 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  section === s
                    ? "bg-amber-500/20 text-amber-400 font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl p-6 space-y-5">
          {section === "General" && (
            <>
              <div className="text-sm font-semibold text-white mb-4">General Settings</div>
              <InputField label="Platform Name" value={platformName} onChange={setPlatformName} />
              <InputField
                label="Platform Tagline"
                value={platformTagline}
                onChange={setPlatformTagline}
              />
              <div className="pt-3 space-y-0">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                  Platform Controls
                </div>
                <Toggle
                  label="Maintenance Mode"
                  description="Disables access for all users except admins"
                  value={maintenanceMode}
                  onChange={setMaintenanceMode}
                />
                <Toggle
                  label="Open Registration"
                  description="Allow new users to sign up"
                  value={registrationOpen}
                  onChange={setRegistrationOpen}
                />
                <Toggle
                  label="Require Email Verification"
                  description="Users must verify email before accessing platform"
                  value={requireEmailVerification}
                  onChange={setRequireEmailVerification}
                />
              </div>
            </>
          )}

            {section === "Integrations" && (
               <>
                 <div className="text-sm font-semibold text-white mb-1">Payment Gateway</div>
                 <p className="text-xs text-white/40 mb-4">
                   Configure Razorpay keys. Keys are stored in the database and applied to all payment requests immediately — no server restart needed.
                 </p>

                 {/* Current status banner */}
                 {loadingKeys && (
                   <div className="mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 animate-pulse">
                     Loading current configuration...
                   </div>
                 )}
                 {!loadingKeys && integrationStatus && (
                   <div className={`mb-5 px-4 py-3 rounded-xl border flex items-center gap-3 ${
                     integrationStatus.isConfigured
                       ? integrationStatus.mode === "live"
                         ? "bg-emerald-500/10 border-emerald-500/30"
                         : "bg-amber-500/10 border-amber-500/30"
                       : "bg-red-500/10 border-red-500/30"
                   }`}>
                     <div className={`w-2 h-2 rounded-full shrink-0 ${
                       integrationStatus.isConfigured
                         ? integrationStatus.mode === "live" ? "bg-emerald-400" : "bg-amber-400"
                         : "bg-red-400"
                     }`} />
                     <div>
                       <p className={`text-xs font-semibold ${
                         integrationStatus.isConfigured
                           ? integrationStatus.mode === "live" ? "text-emerald-400" : "text-amber-400"
                           : "text-red-400"
                       }`}>
                         {integrationStatus.isConfigured
                           ? `${integrationStatus.mode === "live" ? "Live" : "Test"} mode configured`
                           : "Not configured — payments running in simulation mode"}
                       </p>
                       {integrationStatus.isConfigured && (
                         <p className="text-[11px] text-white/40 mt-0.5">
                           Key ID: <code className="font-mono text-white/60">{integrationStatus.keyId}</code>
                           &nbsp;· Secret: {integrationStatus.hasSecret ? "✓ saved" : "✗ missing"}
                         </p>
                       )}
                     </div>
                   </div>
                 )}

                 {integrationError && (
                   <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                     {integrationError}
                   </div>
                 )}

                 {/* Mode toggle */}
                 <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs text-white/50">Mode:</span>
                  {(["test", "live"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRazorpayMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        razorpayMode === m
                          ? m === "live"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-white/5 text-white/40 border border-white/10 hover:text-white/70"
                      }`}
                    >
                      {m === "live" ? "Live" : "Test"}
                    </button>
                  ))}
                  {razorpayMode === "live" && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Live payments active
                    </span>
                  )}
                  {razorpayMode === "test" && (
                    <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Test / simulation mode
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 block mb-1">
                      RAZORPAY_KEY_ID&nbsp;
                      <span className="text-white/20">
                        ({razorpayMode === "live" ? "rzp_live_..." : "rzp_test_..."})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      placeholder={razorpayMode === "live" ? "rzp_live_xxxxxxxxxxxx" : "rzp_test_xxxxxxxxxxxx"}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 block mb-1">
                      RAZORPAY_KEY_SECRET&nbsp;
                      <span className="text-white/20">(keep secret — never shared with clients)</span>
                    </label>
                    <input
                      type="password"
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      placeholder="••••••••••••••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="mt-5 bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
                  <div className="text-xs text-white/50 font-semibold mb-1">
                    How these keys are used
                  </div>
                  <div className="text-[12px] text-white/40 leading-relaxed">
                    <span className="text-white/60">KEY_ID</span> — sent to the Razorpay checkout widget (public, safe in browser).
                  </div>
                  <div className="text-[12px] text-white/40 leading-relaxed">
                    <span className="text-white/60">KEY_SECRET</span> — used server-side only to create orders and verify HMAC signatures. Never exposed.
                  </div>
                  <div className="text-[12px] text-white/40 leading-relaxed mt-1">
                      Keys are saved to the database immediately and used for all payment requests. They are also written to <code className="text-amber-400 bg-amber-500/10 px-1 rounded">.env.local</code> for persistence across server restarts.
                    </div>
                </div>

                <div className="pt-5 flex justify-end">
                  <button
                    onClick={handleIntegrationSave}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      integrationSaved
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500 text-black hover:bg-amber-400"
                    }`}
                  >
                    {integrationSaved ? "Keys Saved!" : "Save Keys"}
                  </button>
                </div>
              </>
            )}

            {section === "Commission" && (
            <>
              <div className="text-sm font-semibold text-white mb-4">Commission & Escrow</div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Hiring Commission %"
                  value={hiringCommission}
                  onChange={setHiringCommission}
                  suffix="%"
                  type="number"
                />
                <InputField
                  label="Equipment Rental Commission %"
                  value={equipmentCommission}
                  onChange={setEquipmentCommission}
                  suffix="%"
                  type="number"
                />
                <InputField
                  label="Location Booking Commission %"
                  value={locationCommission}
                  onChange={setLocationCommission}
                  suffix="%"
                  type="number"
                />
                <InputField
                  label="Minimum Escrow Release (days)"
                  value={minEscrowDays}
                  onChange={setMinEscrowDays}
                  suffix="days"
                  type="number"
                />
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mt-2">
                <div className="text-xs text-amber-400">
                  Commission changes apply to new contracts only. Existing contracts are not
                  affected.
                </div>
              </div>
            </>
          )}

          {section === "Subscriptions" && (
            <>
              <div className="text-sm font-semibold text-white mb-4">
                Subscription Plans
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Pro Plan Price (₹/month)"
                  value={proPrice}
                  onChange={setProPrice}
                  suffix="₹"
                  type="number"
                />
                <InputField
                  label="Elite Plan Price (₹/month)"
                  value={elitePrice}
                  onChange={setElitePrice}
                  suffix="₹"
                  type="number"
                />
                <InputField
                  label="Pro — Max Auditions / month"
                  value={proAuditionLimit}
                  onChange={setProAuditionLimit}
                  type="number"
                />
                <InputField
                  label="Elite — Max Auditions / month"
                  value={eliteAuditionLimit}
                  onChange={setEliteAuditionLimit}
                  type="number"
                />
              </div>

              <div className="mt-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                  Plan Comparison Preview
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Free", price: "₹0", color: "border-white/10", features: ["5 auditions/month", "Basic profile", "No badge"] },
                    { name: "Pro", price: `₹${proPrice}`, color: "border-amber-500/30", features: [`${proAuditionLimit} auditions/month`, "Pro badge", "Priority listing"] },
                    { name: "Elite", price: `₹${elitePrice}`, color: "border-purple-500/30", features: [`${eliteAuditionLimit} auditions/month`, "Elite badge", "Featured profile"] },
                  ].map((plan) => (
                    <div key={plan.name} className={`border ${plan.color} rounded-xl p-3`}>
                      <div className="text-xs font-semibold text-white mb-0.5">{plan.name}</div>
                      <div className="text-base font-bold text-amber-400 mb-2">{plan.price}</div>
                      {plan.features.map((f) => (
                        <div key={f} className="text-[11px] text-white/50 flex items-center gap-1">
                          <span className="text-emerald-400">✓</span> {f}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {section === "Notifications" && (
            <>
              <div className="text-sm font-semibold text-white mb-4">
                Notification Settings
              </div>
              <Toggle
                label="Email Notifications"
                description="Send transactional emails to users"
                value={emailNotifications}
                onChange={setEmailNotifications}
              />
              <Toggle
                label="Push Notifications"
                description="In-app push notifications"
                value={pushNotifications}
                onChange={setPushNotifications}
              />
              <div className="pt-2">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                  Admin Alerts
                </div>
                <Toggle
                  label="KYC Submission Alerts"
                  description="Alert when new KYC is submitted"
                  value={kycAlerts}
                  onChange={setKycAlerts}
                />
                <Toggle
                  label="Dispute Alerts"
                  description="Alert when new dispute is raised"
                  value={disputeAlerts}
                  onChange={setDisputeAlerts}
                />
                <Toggle
                  label="Payment Alerts"
                  description="Alert on large or failed transactions"
                  value={paymentAlerts}
                  onChange={setPaymentAlerts}
                />
              </div>
            </>
          )}

          {section === "Security" && (
            <>
              <div className="text-sm font-semibold text-white mb-4">Security Settings</div>
              <Toggle
                label="Require KYC for Hiring"
                description="Users must complete KYC before hiring talent"
                value={requireKycForHire}
                onChange={setRequireKycForHire}
              />
              <Toggle
                label="Require KYC for Posting Projects"
                description="Producers must verify identity before posting"
                value={requireKycForProjects}
                onChange={setRequireKycForProjects}
              />
              <Toggle
                label="Auto-Flag Suspicious Accounts"
                description="Automatically flag accounts with unusual activity"
                value={autoFlagSuspicious}
                onChange={setAutoFlagSuspicious}
              />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <InputField
                  label="Max Login Attempts"
                  value={maxLoginAttempts}
                  onChange={setMaxLoginAttempts}
                  type="number"
                />
                <InputField
                  label="Session Timeout (days)"
                  value={sessionTimeout}
                  onChange={setSessionTimeout}
                  suffix="days"
                  type="number"
                />
              </div>
            </>
          )}

          {section === "Admin Roles" && (
            <>
              <div className="text-sm font-semibold text-white mb-4">Admin Role Management</div>
              <div className="space-y-3">
                {[
                  {
                    role: "Super Admin",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    permissions: [
                      "Full platform access",
                      "Manage all admins",
                      "System settings",
                      "Financial controls",
                    ],
                  },
                  {
                    role: "Finance Admin",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    permissions: [
                      "Finance & payments",
                      "Refunds",
                      "Escrow release",
                      "Revenue reports",
                    ],
                  },
                  {
                    role: "Moderation Admin",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    permissions: [
                      "User moderation",
                      "Content review",
                      "KYC approval",
                      "Dispute resolution",
                    ],
                  },
                  {
                    role: "Support Admin",
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    permissions: [
                      "View users",
                      "Resolve disputes",
                      "Send notifications",
                      "Read-only finance",
                    ],
                  },
                ].map((r) => (
                  <div
                    key={r.role}
                    className={`${r.bg} border border-white/8 rounded-xl p-4`}
                  >
                    <div className={`text-sm font-semibold ${r.color} mb-2`}>{r.role}</div>
                    <div className="flex flex-wrap gap-2">
                      {r.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-[11px] bg-white/5 text-white/60 px-2 py-0.5 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/30 mt-2">
                To grant/revoke admin access, use User Management and toggle the Admin flag.
              </div>
            </>
          )}

          {/* Save button */}
          {section !== "Admin Roles" && section !== "Integrations" && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  saved
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500 text-black hover:bg-amber-400"
                }`}
              >
                {saved ? "Saved!" : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
