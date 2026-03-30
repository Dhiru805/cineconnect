import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Contract } from "@/lib/models/Contract";
import { Payment } from "@/lib/models/Payment";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";
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

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, contractId } =
      await req.json();

    if (!contractId || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    // Verify signature (skip in test mode)
    if (RAZORPAY_KEY_SECRET && razorpay_signature) {
      const expected = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expected !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // Update contract
    contract.razorpayPaymentId = razorpay_payment_id;
    contract.paymentStatus = "escrowed";
    if (contract.status === "signed") contract.status = "active";
    await contract.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        paidAt: new Date(),
      }
    );

    return NextResponse.json({ success: true, contractId, paymentStatus: "escrowed" });
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
