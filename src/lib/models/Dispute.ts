import mongoose, { Schema, Document } from "mongoose";

export interface IDispute extends Document {
  raisedBy: mongoose.Types.ObjectId;
  against?: mongoose.Types.ObjectId;
  contract?: mongoose.Types.ObjectId;
  category: "payment" | "hiring" | "behavior" | "fraud" | "content" | "other";
  subject: string;
  description: string;
  status: "open" | "in_review" | "resolved" | "escalated" | "closed";
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  messages?: { from: mongoose.Types.ObjectId; text: string; at: Date }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    against: { type: Schema.Types.ObjectId, ref: "User" },
    contract: { type: Schema.Types.ObjectId, ref: "Contract" },
    category: {
      type: String,
      enum: ["payment", "hiring", "behavior", "fraud", "content", "other"],
      required: true,
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "escalated", "closed"],
      default: "open",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    resolution: String,
    messages: [{ from: { type: Schema.Types.ObjectId, ref: "User" }, text: String, at: Date }],
  },
  { timestamps: true }
);

export const Dispute =
  mongoose.models.Dispute || mongoose.model<IDispute>("Dispute", DisputeSchema);
