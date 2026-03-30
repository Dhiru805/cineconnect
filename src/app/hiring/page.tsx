"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Download,
  Eye,
  PenLine,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  X,
  Send,
  Shield,
  Briefcase,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IContract {
  _id: string;
  contractNumber: string;
  status: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled" | "disputed";
  paymentStatus: "pending" | "escrowed" | "released" | "refunded";
  roleTitle: string;
  totalAmount: number;
  currency: string;
  ratePerDay: number;
  shootDays?: number;
  startDate?: string;
  endDate?: string;
  terms?: string;
  producer: { _id: string; name: string; slug: string };
  talent: { _id: string; name: string; slug: string };
  project: { _id: string; title: string; type: string };
  audition?: { _id: string; role: string };
  producerSignature?: string;
  talentSignature?: string;
  producerSignedAt?: string;
  talentSignedAt?: string;
  createdAt: string;
}

interface IAudition {
  _id: string;
  roleAppliedFor: string;
  status: string;
  coverNote?: string;
  selfTapeUrl?: string;
  producerNotes?: string;
  callbackDate?: string;
  createdAt: string;
  applicant: { _id: string; name: string; slug: string; location?: string; skills?: string[] };
  project: { _id: string; title: string; type: string; location: string };
}

interface IProject {
  _id: string;
  title: string;
  type: string;
  rolesNeeded: { roleTitle: string }[];
  budget: number;
  currency: string;
  location: string;
}

type MainTab = "contracts" | "panel" | "create";

const statusColors: Record<string, string> = {
  draft: "bg-white/8 text-muted-foreground",
  sent: "bg-blue-500/15 text-blue-400",
  signed: "bg-green-500/15 text-green-400",
  active: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  disputed: "bg-orange-500/15 text-orange-400",
};

const paymentColors: Record<string, string> = {
  pending: "bg-white/8 text-muted-foreground",
  escrowed: "bg-blue-500/15 text-blue-400",
  released: "bg-green-500/15 text-green-400",
  refunded: "bg-orange-500/15 text-orange-400",
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

// ─── Signature Canvas ─────────────────────────────────────────────────────────

function SignatureCanvas({ onSave, onClose }: { onSave: (sig: string) => void; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getXY = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getXY(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#e8c547";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    const { x, y } = getXY(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDraw = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[oklch(0.12_0_0)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">Draw Your Signature</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Sign in the box below using your mouse or touchscreen.</p>
        <canvas
          ref={canvasRef}
          width={380}
          height={160}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full rounded-xl border border-white/15 bg-white/3 cursor-crosshair touch-none"
          style={{ height: 160 }}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={clear} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
          <button
            onClick={save}
            disabled={isEmpty}
            className="flex-1 px-4 py-2.5 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Contract Detail Modal ─────────────────────────────────────────────────────

function ContractModal({
  contract,
  me,
  onClose,
  onRefresh,
}: {
  contract: IContract;
  me: { id: string; role: string };
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [showSigCanvas, setShowSigCanvas] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [error, setError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const isProducer = contract.producer._id === me.id || (contract.producer as unknown as string) === me.id;
  const isTalent = contract.talent._id === me.id || (contract.talent as unknown as string) === me.id;
  const mySignature = isProducer ? contract.producerSignature : contract.talentSignature;
  const canSign = (contract.status === "sent" || contract.status === "draft") && !mySignature;
  const canPay = isProducer && contract.status === "signed" && contract.paymentStatus === "pending";

  const doAction = async (action: string, signature?: string) => {
    setActioning(true);
    setError("");
    try {
      const r = await fetch("/api/contracts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract._id, action, signature }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Action failed"); return; }
      onRefresh();
    } catch {
      setError("Network error");
    } finally {
      setActioning(false);
    }
  };

  const initPayment = async () => {
    setPayLoading(true);
    setError("");
    try {
      const r = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract._id }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Payment init failed"); return; }

      // If Razorpay keys are configured, open checkout
      if (data.keyId && data.keyId !== "test_mode" && typeof window !== "undefined") {
        const options = {
          key: data.keyId,
          amount: data.amount * 100,
          currency: data.currency,
          name: "CineConnect",
          description: `Booking: ${contract.roleTitle}`,
          order_id: data.orderId,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, contractId: contract._id }),
            });
            onRefresh();
          },
          theme: { color: "#e8c547" },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Razorpay = (window as any).Razorpay;
        if (Razorpay) {
          new Razorpay(options).open();
        }
      } else {
        // Test mode — simulate payment verification
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: `test_pay_${Date.now()}`,
            razorpay_signature: "test_signature",
            contractId: contract._id,
          }),
        });
        onRefresh();
      }
    } catch {
      setError("Payment error");
    } finally {
      setPayLoading(false);
    }
  };

  const printContract = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Contract ${contract.contractNumber}</title>
      <style>
        body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #111; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 12px; }
        .row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
        .terms { font-size: 13px; line-height: 1.7; white-space: pre-wrap; background: #f9f9f9; padding: 16px; border-radius: 4px; }
        .sigs { display: flex; gap: 40px; margin-top: 40px; }
        .sig-box { flex: 1; }
        .sig-box h3 { font-size: 13px; font-weight: bold; margin-bottom: 8px; }
        .sig-img { border: 1px solid #ddd; height: 60px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 4px; overflow: hidden; }
        .sig-img img { max-height: 56px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>SERVICE CONTRACT</h1>
      <p class="meta">Contract No: ${contract.contractNumber} &nbsp;|&nbsp; Date: ${new Date(contract.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div class="section"><h2>Parties</h2>
        <div class="row"><span><strong>Producer:</strong> ${contract.producer.name}</span></div>
        <div class="row"><span><strong>Talent:</strong> ${contract.talent.name}</span></div>
      </div>
      <div class="section"><h2>Project & Role</h2>
        <div class="row"><span><strong>Project:</strong> ${contract.project.title}</span><span><strong>Type:</strong> ${contract.project.type}</span></div>
        <div class="row"><span><strong>Role:</strong> ${contract.roleTitle}</span>${contract.shootDays ? `<span><strong>Shoot Days:</strong> ${contract.shootDays}</span>` : ""}</div>
        ${contract.startDate ? `<div class="row"><span><strong>Start:</strong> ${new Date(contract.startDate).toLocaleDateString("en-IN")}</span>${contract.endDate ? `<span><strong>End:</strong> ${new Date(contract.endDate).toLocaleDateString("en-IN")}</span>` : ""}</div>` : ""}
      </div>
      <div class="section"><h2>Payment</h2>
        <div class="row"><span><strong>Rate per Day:</strong> ₹${formatINR(contract.ratePerDay)}</span><span><strong>Total Amount:</strong> ₹${formatINR(contract.totalAmount)}</span></div>
        <div class="row"><span><strong>Payment Status:</strong> ${contract.paymentStatus}</span></div>
      </div>
      ${contract.terms ? `<div class="section"><h2>Terms & Conditions</h2><div class="terms">${contract.terms}</div></div>` : ""}
      <div class="sigs">
        <div class="sig-box"><h3>Producer Signature</h3>
          <div class="sig-img">${contract.producerSignature ? `<img src="${contract.producerSignature}" />` : "<span style='color:#999;font-size:12px'>Not signed</span>"}</div>
          ${contract.producerSignedAt ? `<p style='font-size:11px;color:#666;margin-top:4px'>Signed: ${new Date(contract.producerSignedAt).toLocaleString("en-IN")}</p>` : ""}
        </div>
        <div class="sig-box"><h3>Talent Signature</h3>
          <div class="sig-img">${contract.talentSignature ? `<img src="${contract.talentSignature}" />` : "<span style='color:#999;font-size:12px'>Not signed</span>"}</div>
          ${contract.talentSignedAt ? `<p style='font-size:11px;color:#666;margin-top:4px'>Signed: ${new Date(contract.talentSignedAt).toLocaleString("en-IN")}</p>` : ""}
        </div>
      </div>
      <script>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <>
      {showSigCanvas && (
        <SignatureCanvas
          onSave={(sig) => { setShowSigCanvas(false); doAction("sign", sig); }}
          onClose={() => setShowSigCanvas(false)}
        />
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[oklch(0.11_0_0)] flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/8 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[contract.status]}`}>{contract.status}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${paymentColors[contract.paymentStatus]}`}>{contract.paymentStatus}</span>
              </div>
              <h2 className="text-base font-bold text-foreground">Contract #{contract.contractNumber}</h2>
              <p className="text-xs text-muted-foreground">{contract.project.title} — {contract.roleTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={printContract} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-muted-foreground mb-1">Producer</p>
                <p className="text-sm font-semibold text-foreground">{contract.producer.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-muted-foreground mb-1">Talent</p>
                <p className="text-sm font-semibold text-foreground">{contract.talent.name}</p>
              </div>
            </div>

            {/* Role & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                <p className="font-medium text-foreground text-xs">{contract.roleTitle}</p>
              </div>
              {contract.shootDays && (
                <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-0.5">Shoot Days</p>
                  <p className="font-medium text-foreground">{contract.shootDays}</p>
                </div>
              )}
              {contract.startDate && (
                <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-0.5">Start</p>
                  <p className="font-medium text-foreground text-xs">{new Date(contract.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              )}
              {contract.endDate && (
                <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-0.5">End</p>
                  <p className="font-medium text-foreground text-xs">{new Date(contract.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                  <div className="flex items-center gap-1 text-foreground font-bold text-xl">
                    <IndianRupee className="w-5 h-5" />
                    {formatINR(contract.totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">₹{formatINR(contract.ratePerDay)}/day</p>
                </div>
                {contract.paymentStatus === "escrowed" && (
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
                    <Shield className="w-4 h-4" />
                    Held in Escrow
                  </div>
                )}
                {contract.paymentStatus === "released" && (
                  <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Payment Released
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            {contract.terms && (
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Terms & Conditions</p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{contract.terms}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Producer Signature", sig: contract.producerSignature, date: contract.producerSignedAt },
                { label: "Talent Signature", sig: contract.talentSignature, date: contract.talentSignedAt },
              ].map(({ label, sig, date }) => (
                <div key={label} className="p-4 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-muted-foreground mb-2">{label}</p>
                  {sig ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sig} alt="signature" className="h-12 w-full object-contain" />
                      {date && <p className="text-xs text-muted-foreground mt-1">{new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
                    </>
                  ) : (
                    <div className="h-12 flex items-center justify-center border border-dashed border-white/15 rounded-lg">
                      <span className="text-xs text-muted-foreground">Not signed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-5 border-t border-white/8 flex flex-wrap gap-3 justify-end shrink-0">
            {isProducer && contract.status === "draft" && (
              <button
                onClick={() => doAction("send")}
                disabled={actioning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/15 transition-colors disabled:opacity-50"
              >
                {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send to Talent
              </button>
            )}

            {canSign && (
              <button
                onClick={() => setShowSigCanvas(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <PenLine className="w-3.5 h-3.5" />
                Sign Contract
              </button>
            )}

            {mySignature && !canSign && contract.status !== "signed" && (
              <span className="flex items-center gap-1.5 px-3 py-2 text-xs text-green-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> You&apos;ve signed
              </span>
            )}

            {canPay && (
              <button
                onClick={initPayment}
                disabled={payLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient text-black text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {payLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IndianRupee className="w-3.5 h-3.5" />}
                Pay ₹{formatINR(contract.totalAmount)} (Escrow)
              </button>
            )}

            {isProducer && contract.paymentStatus === "escrowed" && contract.status === "active" && (
              <button
                onClick={() => doAction("complete")}
                disabled={actioning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {actioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Mark Complete & Release Payment
              </button>
            )}

            {(contract.status === "draft" || contract.status === "sent") && (
              <button
                onClick={() => doAction("cancel")}
                disabled={actioning}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm hover:bg-red-500/15 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Create Contract Form ──────────────────────────────────────────────────────

function CreateContractForm({ me, onCreated }: { me: { id: string; role: string }; onCreated: () => void }) {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [auditions, setAuditions] = useState<IAudition[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedAudition, setSelectedAudition] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [shootDays, setShootDays] = useState("");
  const [ratePerDay, setRatePerDay] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [terms, setTerms] = useState(
    `1. The Talent agrees to perform services as described above.\n2. The Producer agrees to pay the agreed amount upon completion of shoot days.\n3. Payment will be held in escrow by CineConnect and released upon project completion.\n4. Any cancellation within 48 hours of shoot date will result in 50% kill fee.\n5. All produced content remains property of the Production House unless otherwise agreed.\n6. Both parties agree to maintain professional conduct throughout the engagement.`
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = parseFloat(ratePerDay || "0") * parseFloat(shootDays || "0");

  useEffect(() => {
    if (me.role !== "producer" && me.role !== "agency") return;
    fetch("/api/projects?producerId=me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.projects) setProjects(d.projects); })
      .catch(() => {});
  }, [me.role]);

  useEffect(() => {
    if (!selectedProject) { setAuditions([]); return; }
    fetch(`/api/auditions?projectId=${selectedProject}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.auditions) setAuditions(d.auditions); })
      .catch(() => {});
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedAudition) return;
    const a = auditions.find((x) => x._id === selectedAudition);
    if (a) setRoleTitle(a.roleAppliedFor);
  }, [selectedAudition, auditions]);

  const handleCreate = async () => {
    if (!selectedProject || !roleTitle || !ratePerDay || !shootDays) {
      setError("Project, role, rate/day and shoot days are required.");
      return;
    }
    const selectedAud = auditions.find((a) => a._id === selectedAudition);
    if (!selectedAudition || !selectedAud) {
      setError("Please select a talent from the auditions list.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const r = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: selectedProject,
          audition: selectedAudition || undefined,
          talent: selectedAud.applicant._id,
          roleTitle,
          shootDays: parseInt(shootDays),
          ratePerDay: parseFloat(ratePerDay),
          totalAmount: parseFloat(ratePerDay) * parseInt(shootDays),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          terms,
        }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Failed to create contract"); return; }
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  if (me.role !== "producer" && me.role !== "agency") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Briefcase className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">Only producers and agencies can create contracts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Create Booking Contract</h2>
        <p className="text-sm text-muted-foreground">Generate a digital contract for a selected applicant.</p>
      </div>

      {/* Project */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Your Project</label>
        <select
          value={selectedProject}
          onChange={(e) => { setSelectedProject(e.target.value); setSelectedAudition(""); setRoleTitle(""); }}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 text-sm"
        >
          <option value="">Select project...</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
        {projects.length === 0 && <p className="text-xs text-muted-foreground mt-1.5">No projects found. <a href="/post-project" className="text-primary hover:underline">Post one first.</a></p>}
      </div>

      {/* Audition / Talent */}
      {selectedProject && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Select Applicant</label>
          {auditions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3 px-4 rounded-xl bg-white/3 border border-white/8">No applications yet for this project.</p>
          ) : (
            <div className="space-y-2">
              {auditions.map((a) => (
                <label key={a._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAudition === a._id ? "border-primary/50 bg-primary/5" : "border-white/8 bg-white/3 hover:border-white/15"}`}>
                  <input
                    type="radio"
                    name="audition"
                    value={a._id}
                    checked={selectedAudition === a._id}
                    onChange={() => setSelectedAudition(a._id)}
                    className="accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{a.applicant.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${a.status === "shortlisted" ? "bg-green-500/15 text-green-400" : "bg-white/5 text-muted-foreground"}`}>{a.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{a.roleAppliedFor}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Role Title</label>
        <input
          type="text"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="e.g. Female Lead, DOP, Editor..."
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      {/* Dates & Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Shoot Days</label>
          <input
            type="number"
            min="1"
            value={shootDays}
            onChange={(e) => setShootDays(e.target.value)}
            placeholder="e.g. 10"
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Rate per Day (₹)</label>
          <input
            type="number"
            min="0"
            value={ratePerDay}
            onChange={(e) => setRatePerDay(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>
      </div>

      {/* Total preview */}
      {totalAmount > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-3">
          <IndianRupee className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Total Contract Value</p>
            <p className="text-lg font-bold text-foreground">₹{formatINR(totalAmount)}</p>
          </div>
        </div>
      )}

      {/* Terms */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Terms & Conditions</label>
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm resize-none font-mono text-xs leading-relaxed"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={creating}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl gold-gradient text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>Create Contract <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

// ─── Producer Audition Panel ───────────────────────────────────────────────────

function ProducerPanel({ me }: { me: { id: string; role: string } }) {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [auditions, setAuditions] = useState<IAudition[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (me.role !== "producer" && me.role !== "agency") return;
    fetch("/api/projects?producerId=me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.projects) setProjects(d.projects); })
      .catch(() => {});
  }, [me.role]);

  const loadAuditions = useCallback(async (pid: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/auditions?projectId=${pid}`);
      if (!r.ok) return;
      const { auditions: list } = await r.json();
      setAuditions(list || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProject) loadAuditions(selectedProject);
    else setAuditions([]);
  }, [selectedProject, loadAuditions]);

  const updateStatus = async (auditionId: string, status: string) => {
    setUpdatingId(auditionId);
    try {
      await fetch("/api/auditions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditionId, status }),
      });
      setAuditions((prev) => prev.map((a) => a._id === auditionId ? { ...a, status } : a));
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  };

  if (me.role !== "producer" && me.role !== "agency") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">The audition panel is for producers and agencies.</p>
      </div>
    );
  }

  const grouped = {
    applied: auditions.filter((a) => a.status === "applied"),
    shortlisted: auditions.filter((a) => a.status === "shortlisted"),
    selected: auditions.filter((a) => a.status === "selected"),
    rejected: auditions.filter((a) => a.status === "rejected"),
  };

  const statusLabel: Record<string, string> = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    selected: "Selected",
    rejected: "Rejected",
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Select Project</label>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full max-w-sm px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground focus:outline-none focus:border-primary/50 text-sm"
        >
          <option value="">Choose a project...</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && selectedProject && auditions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No applications yet for this project.</p>
        </div>
      )}

      {!loading && auditions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["applied", "shortlisted", "selected", "rejected"] as const).map((col) => (
            <div key={col} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{statusLabel[col]}</span>
                <span className="text-xs text-muted-foreground">{grouped[col].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col].map((a) => (
                  <div key={a._id} className="rounded-xl border border-white/8 bg-[oklch(0.10_0_0)] p-3 hover:border-white/15 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">{a.applicant.name}</p>
                        <p className="text-xs text-muted-foreground">{a.roleAppliedFor}</p>
                      </div>
                      {a.applicant.location && (
                        <span className="text-xs text-muted-foreground shrink-0">{a.applicant.location}</span>
                      )}
                    </div>
                    {a.coverNote && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2 mb-2">&ldquo;{a.coverNote}&rdquo;</p>
                    )}
                    {a.selfTapeUrl && (
                      <a href={a.selfTapeUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline mb-2">
                        <Eye className="w-3 h-3" /> View Self-tape
                      </a>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      {col !== "shortlisted" && col !== "selected" && (
                        <button
                          onClick={() => updateStatus(a._id, "shortlisted")}
                          disabled={updatingId === a._id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/15 transition-colors disabled:opacity-50"
                        >
                          <ThumbsUp className="w-3 h-3" /> Shortlist
                        </button>
                      )}
                      {col === "shortlisted" && (
                        <button
                          onClick={() => updateStatus(a._id, "selected")}
                          disabled={updatingId === a._id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg gold-gradient text-black text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Select
                        </button>
                      )}
                      {col !== "rejected" && (
                        <button
                          onClick={() => updateStatus(a._id, "rejected")}
                          disabled={updatingId === a._id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/15 transition-colors disabled:opacity-50"
                        >
                          <ThumbsDown className="w-3 h-3" /> Reject
                        </button>
                      )}
                      {col === "rejected" && (
                        <button
                          onClick={() => updateStatus(a._id, "applied")}
                          disabled={updatingId === a._id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 text-muted-foreground text-xs font-medium hover:bg-white/8 transition-colors disabled:opacity-50"
                        >
                          <ArrowRight className="w-3 h-3" /> Restore
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 opacity-60">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
                {grouped[col].length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/8 p-4 text-center">
                    <p className="text-xs text-muted-foreground opacity-50">—</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function HiringPage() {
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("contracts");
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [selectedContract, setSelectedContract] = useState<IContract | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setMe({ id: d.user._id || d.user.id, role: d.user.role });
      })
      .catch(() => {});
  }, []);

  const loadContracts = useCallback(async () => {
    setLoadingContracts(true);
    try {
      const r = await fetch("/api/contracts");
      if (!r.ok) return;
      const { contracts: list } = await r.json();
      setContracts(list || []);
    } catch {
      // silent
    } finally {
      setLoadingContracts(false);
    }
  }, []);

  useEffect(() => {
    if (me) loadContracts();
  }, [me, loadContracts]);

  const tabs: { id: MainTab; label: string; show: boolean }[] = [
    { id: "contracts", label: `Contracts${contracts.length > 0 ? ` (${contracts.length})` : ""}`, show: true },
    { id: "panel", label: "Audition Panel", show: !!(me && (me.role === "producer" || me.role === "agency")) },
    { id: "create", label: "New Contract", show: !!(me && (me.role === "producer" || me.role === "agency")) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/8 bg-[oklch(0.08_0_0)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Hiring & Contracts</h1>
            <p className="text-sm text-muted-foreground">Manage auditions, issue contracts, and process payments securely.</p>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
            {tabs.filter((t) => t.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Contracts List */}
          {activeTab === "contracts" && (
            <div>
              {loadingContracts ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground mb-1">No contracts yet.</p>
                  {me?.role === "producer" || me?.role === "agency" ? (
                    <button onClick={() => setActiveTab("create")} className="mt-4 px-5 py-2 rounded-xl gold-gradient text-black text-sm font-semibold">
                      Create First Contract
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground opacity-60">Contracts will appear here once a producer hires you.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {contracts.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => setSelectedContract(c)}
                      className="rounded-2xl border border-white/8 bg-[oklch(0.10_0_0)] p-5 hover:border-white/15 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[c.status]}`}>{c.status}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${paymentColors[c.paymentStatus]}`}>{c.paymentStatus}</span>
                            <span className="text-xs text-muted-foreground">#{c.contractNumber}</span>
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-snug mb-0.5">{c.project.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{c.roleTitle} · {c.producer.name} → {c.talent.name}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" />
                              ₹{formatINR(c.totalAmount)}
                            </div>
                            {c.shootDays && <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{c.shootDays} days</div>}
                            <div>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!c.producerSignature && <div className="w-2 h-2 rounded-full bg-orange-400" title="Producer hasn't signed" />}
                          {!c.talentSignature && <div className="w-2 h-2 rounded-full bg-blue-400" title="Talent hasn't signed" />}
                          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audition Panel */}
          {activeTab === "panel" && me && <ProducerPanel me={me} />}

          {/* Create Contract */}
          {activeTab === "create" && me && (
            <CreateContractForm
              me={me}
              onCreated={() => { loadContracts(); setActiveTab("contracts"); }}
            />
          )}
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && me && (
        <ContractModal
          contract={selectedContract}
          me={me}
          onClose={() => setSelectedContract(null)}
          onRefresh={() => { loadContracts(); setSelectedContract(null); }}
        />
      )}

      <Footer />
    </div>
  );
}
