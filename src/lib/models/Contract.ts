import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  project: mongoose.Types.ObjectId;
  audition?: mongoose.Types.ObjectId;
  producer: mongoose.Types.ObjectId;
  talent: mongoose.Types.ObjectId;
  roleTitle: string;
  startDate?: Date;
  endDate?: Date;
  shootDays?: number;
  ratePerDay: number;
  totalAmount: number;
  currency: string;
  terms?: string;
  status: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled" | "disputed";
  producerSignature?: string;   // base64 or URL
  talentSignature?: string;
  producerSignedAt?: Date;
  talentSignedAt?: Date;
  contractNumber: string;
  paymentStatus: "pending" | "escrowed" | "released" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  milestones?: {
    title: string;
    dueDate?: Date;
    amount: number;
    status: "pending" | "released";
  }[];
  fileUrl?: string;   // generated PDF
  createdAt?: Date;
  updatedAt?: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    audition: { type: Schema.Types.ObjectId, ref: "Audition" },
    producer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    talent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roleTitle: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    shootDays: Number,
    ratePerDay: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    terms: String,
    status: {
      type: String,
      enum: ["draft", "sent", "signed", "active", "completed", "cancelled", "disputed"],
      default: "draft",
    },
    producerSignature: String,
    talentSignature: String,
    producerSignedAt: Date,
    talentSignedAt: Date,
    contractNumber: { type: String, required: true, unique: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "escrowed", "released", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    milestones: [
      {
        title: String,
        dueDate: Date,
        amount: Number,
        status: { type: String, enum: ["pending", "released"], default: "pending" },
      },
    ],
    fileUrl: String,
  },
  { timestamps: true }
);

export const Contract =
  mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);
