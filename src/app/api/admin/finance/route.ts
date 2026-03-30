import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Contract } from "@/lib/models/Contract";
import { Payment } from "@/lib/models/Payment";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type") || "contracts"; // "contracts" | "payments"

  if (type === "payments") {
    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate("payer", "name email")
      .populate("payee", "name email")
      .populate("contract", "contractNumber roleTitle totalAmount")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return NextResponse.json({ payments, total, page, pages: Math.ceil(total / limit) });
  }

  const total = await Contract.countDocuments();
  const contracts = await Contract.find()
    .populate("producer", "name email avatar")
    .populate("talent", "name email avatar")
    .populate("project", "title type")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ contracts, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { contractId, paymentId, action } = await req.json();

  if (contractId) {
    const update: Record<string, any> = {};
    if (action === "dispute") update.status = "disputed";
    if (action === "cancel") update.status = "cancelled";
    if (action === "release") update.paymentStatus = "released";
    if (action === "refund") update.paymentStatus = "refunded";

    const contract = await Contract.findByIdAndUpdate(contractId, { $set: update }, { new: true });
    return NextResponse.json({ contract });
  }

  if (paymentId) {
    const update: Record<string, any> = {};
    if (action === "refund") { update.status = "refunded"; }
    if (action === "markPaid") { update.status = "paid"; update.paidAt = new Date(); }

    const payment = await Payment.findByIdAndUpdate(paymentId, { $set: update }, { new: true });
    return NextResponse.json({ payment });
  }

  return NextResponse.json({ error: "Missing id" }, { status: 400 });
}
