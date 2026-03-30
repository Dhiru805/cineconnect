import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Audition } from "@/lib/models/Audition";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";

  const query: Record<string, any> = {};
  if (status) query.status = status;

  const total = await Audition.countDocuments(query);
  const auditions = await Audition.find(query)
    .populate("project", "title type")
    .populate("applicant", "name email avatar role")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ auditions, total, page, pages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const auditionId = searchParams.get("auditionId");
  if (!auditionId) return NextResponse.json({ error: "Missing auditionId" }, { status: 400 });

  await Audition.findByIdAndDelete(auditionId);
  return NextResponse.json({ success: true });
}
