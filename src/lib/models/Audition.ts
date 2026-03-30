import mongoose, { Schema, Document } from "mongoose";

export interface IAudition extends Document {
  project: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  roleAppliedFor: string;
  coverNote?: string;
  selfTapeUrl?: string;
  status: "applied" | "shortlisted" | "selected" | "rejected" | "callback";
  producerNotes?: string;
  callbackDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AuditionSchema = new Schema<IAudition>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roleAppliedFor: { type: String, required: true },
    coverNote: String,
    selfTapeUrl: String,
    status: {
      type: String,
      enum: ["applied", "shortlisted", "selected", "rejected", "callback"],
      default: "applied",
    },
    producerNotes: String,
    callbackDate: Date,
  },
  { timestamps: true }
);

export const Audition =
  mongoose.models.Audition ||
  mongoose.model<IAudition>("Audition", AuditionSchema);
