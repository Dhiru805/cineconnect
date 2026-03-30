import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Contract } from "@/lib/models/Contract";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/contracts — list contracts for current user (as producer or talent)
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // "producer" | "talent" | null (both)

    let query: Record<string, unknown> = {};
    if (role === "producer") {
      query = { producer: user.id };
    } else if (role === "talent") {
      query = { talent: user.id };
    } else {
      query = { $or: [{ producer: user.id }, { talent: user.id }] };
    }

    const contracts = await Contract.find(query)
      .populate("producer", "name avatar slug")
      .populate("talent", "name avatar slug")
      .populate("project", "title type")
      .populate("audition", "role")
      .sort({ createdAt: -1 });

    return NextResponse.json({ contracts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/contracts — create a new contract (producer only)
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();

    const {
      project,
      audition,
      talent,
      roleTitle,
      startDate,
      endDate,
      shootDays,
      ratePerDay,
      totalAmount,
      currency,
      terms,
      milestones,
    } = body;

    if (!project || !talent || !roleTitle || !ratePerDay || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contractNumber = `CC-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const contract = await Contract.create({
      project,
      audition,
      producer: user.id,
      talent,
      roleTitle,
      startDate,
      endDate,
      shootDays,
      ratePerDay,
      totalAmount,
      currency: currency || "INR",
      terms,
      milestones,
      contractNumber,
      status: "draft",
      paymentStatus: "pending",
    });

    const populated = await Contract.findById(contract._id)
      .populate("producer", "name avatar slug")
      .populate("talent", "name avatar slug")
      .populate("project", "title type")
      .populate("audition", "role");

    return NextResponse.json({ contract: populated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/contracts — update status, add signature, update payment status
export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { contractId, action, signature } = body;

    if (!contractId) return NextResponse.json({ error: "contractId required" }, { status: 400 });

    const contract = await Contract.findById(contractId);
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    const isProducer = contract.producer.toString() === user.id;
    const isTalent = contract.talent.toString() === user.id;

    if (!isProducer && !isTalent) {
      return NextResponse.json({ error: "Not authorised to modify this contract" }, { status: 403 });
    }

    switch (action) {
      case "send":
        if (!isProducer) return NextResponse.json({ error: "Only producer can send" }, { status: 403 });
        contract.status = "sent";
        break;

      case "sign":
        if (isProducer) {
          contract.producerSignature = signature;
          contract.producerSignedAt = new Date();
        } else if (isTalent) {
          contract.talentSignature = signature;
          contract.talentSignedAt = new Date();
        }
        if (contract.producerSignature && contract.talentSignature) {
          contract.status = "signed";
        }
        break;

      case "cancel":
        contract.status = "cancelled";
        break;

      case "complete":
        if (!isProducer) return NextResponse.json({ error: "Only producer can mark complete" }, { status: 403 });
        contract.status = "completed";
        contract.paymentStatus = "released";
        break;

      case "release_payment":
        if (!isProducer) return NextResponse.json({ error: "Only producer can release payment" }, { status: 403 });
        contract.paymentStatus = "released";
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await contract.save();
    const updated = await Contract.findById(contractId)
      .populate("producer", "name avatar slug")
      .populate("talent", "name avatar slug")
      .populate("project", "title type")
      .populate("audition", "role");

    return NextResponse.json({ contract: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
