import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const kyc = searchParams.get("kyc") || "";
  const plan = searchParams.get("plan") || "";

  const query: Record<string, any> = {};
  if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
  if (role) query.role = role;
  if (status === "banned") query.isBanned = true;
  if (status === "flagged") query.flagged = true;
  if (status === "verified") query.isVerified = true;
  if (kyc) query.kycStatus = kyc;
  if (plan) query.plan = plan;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { userId, action, value, reason } = body;

  if (!userId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const update: Record<string, any> = {};
  switch (action) {
    case "ban":
      update.isBanned = true;
      update.banReason = reason || "Violated platform policy";
      break;
    case "unban":
      update.isBanned = false;
      update.banReason = "";
      break;
    case "flag":
      update.flagged = true;
      update.flagReason = reason || "Suspicious activity";
      break;
    case "unflag":
      update.flagged = false;
      update.flagReason = "";
      break;
    case "verify":
      update.isVerified = true;
      update.kycStatus = "approved";
      update.kycReviewedAt = new Date();
      update.kycReviewedBy = admin._id;
      break;
    case "unverify":
      update.isVerified = false;
      update.kycStatus = "rejected";
      update.kycReviewedAt = new Date();
      update.kycNotes = reason || "";
      break;
    case "setAdmin":
      update.isAdmin = value === true;
      break;
    case "setRole":
      update.role = value;
      break;
    case "setPlan":
      update.plan = value;
      break;
    case "setVerificationLevel":
      update.verificationLevel = value;
      break;
    case "approveKyc":
      update.kycStatus = "approved";
      update.isVerified = true;
      update.kycReviewedAt = new Date();
      update.kycReviewedBy = admin._id;
      break;
    case "rejectKyc":
      update.kycStatus = "rejected";
      update.kycReviewedAt = new Date();
      update.kycNotes = reason || "";
      break;
    case "requestKycResubmission":
      update.kycStatus = "none";
      update.kycNotes = reason || "Please resubmit your KYC documents";
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  await User.findByIdAndDelete(userId);
  return NextResponse.json({ success: true });
}
