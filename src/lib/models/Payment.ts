import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  contract: mongoose.Types.ObjectId;
  payer: mongoose.Types.ObjectId;     // producer
  payee: mongoose.Types.ObjectId;     // talent
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "created" | "paid" | "failed" | "refunded";
  type: "booking" | "milestone" | "subscription";
  description?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    contract: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    payer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    type: {
      type: String,
      enum: ["booking", "milestone", "subscription"],
      default: "booking",
    },
    description: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
