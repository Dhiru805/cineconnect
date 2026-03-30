"use client";
import { useEffect, useState, useCallback } from "react";

interface Contract {
  _id: string;
  contractNumber: string;
  roleTitle: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  producer?: { name: string; email: string };
  talent?: { name: string; email: string };
  project?: { title: string; type: string };
}

interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  paidAt?: string;
  payer?: { name: string; email: string };
  payee?: { name: string; email: string };
  contract?: { contractNumber: string; roleTitle: string; totalAmount: number };
  razorpayPaymentId?: string;
}

const PAYMENT_COLORS: Record<string, string> = {
  created: "bg-amber-500/20 text-amber-400",
  paid: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-400",
  refunded: "bg-blue-500/20 text-blue-400",
};

const CONTRACT_PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-white/10 text-white/40",
  escrowed: "bg-amber-500/20 text-amber-400",
  released: "bg-emerald-500/20 text-emerald-400",
  refunded: "bg-blue-500/20 text-blue-400",
};

export default function AdminFinance() {
  const [tab, setTab] = useState<"contracts" | "payments">("payments");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), type: tab });
    const r = await fetch(`/api/admin/finance?${params}`);
    const d = await r.json();
    if (tab === "contracts") {
      setContracts(d.contracts || []);
      setRevenue(
        (d.contracts || []).reduce(
          (s: number, c: Contract) =>
            s + (c.paymentStatus === "released" ? c.totalAmount : 0),
          0
        )
      );
    } else {
      setPayments(d.payments || []);
      setRevenue(
        (d.payments || [])
          .filter((p: Payment) => p.status === "paid")
          .reduce((s: number, p: Payment) => s + p.amount, 0)
      );
    }
    setTotal(d.total || 0);
    setPages(d.pages || 1);
    setLoading(false);
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (
    contractId: string | null,
    paymentId: string | null,
    action: string
  ) => {
    await fetch("/api/admin/finance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId, paymentId, action }),
    });
    load();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Finance & Payments</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} records</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3 text-right">
          <div className="text-[11px] text-white/40 uppercase tracking-wider">
            {tab === "contracts" ? "Released Payments" : "Paid Transactions"}
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ₹{revenue.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["payments", "contracts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-amber-500/20 text-amber-400"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments table */}
      {tab === "payments" && (
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Payer → Payee</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Razorpay ID</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 text-sm">
                    No payments yet
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-4 py-3">
                      <div className="text-xs text-white">{p.payer?.name || "—"}</div>
                      <div className="text-[11px] text-white/40">→ {p.payee?.name || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-emerald-400">
                      ₹{p.amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{p.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          PAYMENT_COLORS[p.status] || "bg-white/10 text-white/40"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-white/30 font-mono">
                      {p.razorpayPaymentId
                        ? p.razorpayPaymentId.slice(0, 16) + "…"
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-white/40">
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.status !== "refunded" && (
                          <button
                            onClick={() => doAction(null, p._id, "refund")}
                            className="text-[11px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        {p.status !== "paid" && (
                          <button
                            onClick={() => doAction(null, p._id, "markPaid")}
                            className="text-[11px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contracts table */}
      {tab === "contracts" && (
        <div className="bg-[oklch(0.12_0_0)] border border-white/8 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Contract #</th>
                <th className="text-left px-4 py-3">Parties</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 text-sm">
                    No contracts yet
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c._id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-4 py-3 text-xs font-mono text-white/60">
                      {c.contractNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-white">{c.producer?.name || "—"}</div>
                      <div className="text-[11px] text-white/40">↔ {c.talent?.name || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {c.project?.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-emerald-400">
                      ₹{c.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          c.status === "disputed"
                            ? "bg-red-500/20 text-red-400"
                            : c.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          CONTRACT_PAYMENT_COLORS[c.paymentStatus] ||
                          "bg-white/10 text-white/40"
                        }`}
                      >
                        {c.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.paymentStatus === "escrowed" && (
                          <button
                            onClick={() => doAction(c._id, null, "release")}
                            className="text-[11px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                          >
                            Release
                          </button>
                        )}
                        {c.paymentStatus !== "refunded" && (
                          <button
                            onClick={() => doAction(c._id, null, "refund")}
                            className="text-[11px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                          >
                            Refund
                          </button>
                        )}
                        {c.status !== "disputed" && (
                          <button
                            onClick={() => doAction(c._id, null, "dispute")}
                            className="text-[11px] px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            Flag Dispute
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">
          Page {page} of {pages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
