import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  type: string;
  description: string;
  producer: mongoose.Types.ObjectId;
  budget: number;
  currency: string;
  location: string;
  startDate?: Date;
  endDate?: Date;
  status: "open" | "casting" | "in-production" | "completed" | "cancelled";
  rolesNeeded: {
    roleTitle: string;
    gender?: string;
    ageMin?: number;
    ageMax?: number;
    skills?: string[];
    count: number;
  }[];
  languages?: string[];
  tags?: string[];
  coverImage?: string;
  applicantCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    producer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    location: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["open", "casting", "in-production", "completed", "cancelled"],
      default: "open",
    },
    rolesNeeded: [
      {
        roleTitle: String,
        gender: String,
        ageMin: Number,
        ageMax: Number,
        skills: [String],
        count: { type: Number, default: 1 },
      },
    ],
    languages: [String],
    tags: [String],
    coverImage: String,
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
