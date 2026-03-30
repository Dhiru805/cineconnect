import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Dispute } from "@/lib/models/Dispute";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";

  const query: Record<string, any> = {};
  if (status) query.status = status;
  if (category) query.category = category;

  const total = await Dispute.countDocuments(query);
  const disputes = await Dispute.find(query)
    .populate("raisedBy", "name email avatar")
    .populate("against", "name email avatar")
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ disputes, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  // Users can raise disputes
  const { connectDB: db } = await import("@/lib/mongodb");
  await db();
  const body = await req.json();
  const { raisedBy, against, contract, category, subject, description } = body;
  if (!raisedBy || !category || !subject || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const dispute = await Dispute.create({ raisedBy, against, contract, category, subject, description });
  return NextResponse.json({ dispute });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { disputeId, action, resolution, assignedTo } = await req.json();
  if (!disputeId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const update: Record<string, any> = {};
  if (action === "assign") update.assignedTo = assignedTo;
  if (action === "resolve") { update.status = "resolved"; update.resolution = resolution; }
  if (action === "escalate") update.status = "escalated";
  if (action === "close") update.status = "closed";
  if (action === "review") update.status = "in_review";

  const dispute = await Dispute.findByIdAndUpdate(disputeId, { $set: update }, { new: true });
  return NextResponse.json({ dispute });
}
