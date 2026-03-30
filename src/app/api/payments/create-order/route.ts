import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Contract } from "@/lib/models/Contract";
import { Payment } from "@/lib/models/Payment";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// Create a Razorpay order via direct HTTP (no SDK needed)
async function createRazorpayOrder(amount: number, currency: string, receipt: string) {
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const body = JSON.stringify({ amount: amount * 100, currency, receipt });

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay error: ${err}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { contractId } = await req.json();

    if (!contractId) return NextResponse.json({ error: "contractId required" }, { status: 400 });

    const contract = await Contract.findById(contractId)
      .populate("producer", "name email")
      .populate("talent", "name email")
      .populate("project", "title");

    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    if (contract.producer._id.toString() !== user.id) {
      return NextResponse.json({ error: "Only the producer can initiate payment" }, { status: 403 });
    }
    if (contract.paymentStatus === "escrowed" || contract.paymentStatus === "released") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
    }

    let razorpayOrder: { id: string } | null = null;
    let orderId: string;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // Test mode — generate a fake order id
      orderId = `test_order_${crypto.randomBytes(8).toString("hex")}`;
    } else {
      razorpayOrder = await createRazorpayOrder(
        contract.totalAmount,
        contract.currency,
        `contract_${contract.contractNumber}`
      );
      orderId = razorpayOrder.id;
    }

    // Persist order id on contract
    contract.razorpayOrderId = orderId;
    await contract.save();

    // Create payment record
    const payment = await Payment.create({
      contract: contract._id,
      payer: contract.producer._id,
      payee: contract.talent._id,
      amount: contract.totalAmount,
      currency: contract.currency,
      razorpayOrderId: orderId,
      status: "created",
      type: "booking",
      description: `Booking payment for ${(contract.project as { title?: string })?.title || "project"}`,
    });

    return NextResponse.json({
      orderId,
      amount: contract.totalAmount,
      currency: contract.currency,
      keyId: RAZORPAY_KEY_ID || "test_mode",
      contractId: contract._id,
      paymentId: payment._id,
      contractNumber: contract.contractNumber,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
