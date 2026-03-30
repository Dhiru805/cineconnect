import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "talent" | "crew" | "producer" | "agency" | "brand" | "super-admin";
  avatar?: string;
  bio?: string;
  location?: string;
  languages?: string[];
  skills?: string[];
  niche?: string;
  rateMin?: number;
  rateMax?: number;
  currency?: string;
  availability?: string;
  portfolio?: { type: "image" | "video"; url: string; title: string }[];
  showreel?: string;
  credits?: { title: string; role: string; year: string; type: string }[];
  slug?: string;
  isVerified?: boolean;
  verificationLevel?: "basic" | "pro" | "agency" | "celebrity";
  followerCount?: number;
  plan?: "free" | "pro" | "elite";
  // Admin fields
  isAdmin?: boolean;
  isBanned?: boolean;
  banReason?: string;
  kycStatus?: "none" | "pending" | "approved" | "rejected";
  kycDocumentUrl?: string;
  kycSelfieUrl?: string;
  kycSubmittedAt?: Date;
  kycReviewedAt?: Date;
  kycReviewedBy?: mongoose.Types.ObjectId;
  kycNotes?: string;
  loginHistory?: { ip: string; at: Date; device?: string }[];
  flagged?: boolean;
  flagReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
        enum: ["talent", "crew", "producer", "agency", "brand", "super-admin"],
      required: true,
    },
    avatar: String,
    bio: String,
    location: String,
    languages: [String],
    skills: [String],
    niche: String,
    rateMin: Number,
    rateMax: Number,
    currency: { type: String, default: "INR" },
    availability: String,
    portfolio: [
      {
        type: { type: String, enum: ["image", "video"] },
        url: String,
        title: String,
      },
    ],
    showreel: String,
    credits: [
      {
        title: String,
        role: String,
        year: String,
        type: String,
      },
    ],
    slug: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
    verificationLevel: {
      type: String,
      enum: ["basic", "pro", "agency", "celebrity"],
      default: "basic",
    },
    followerCount: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "pro", "elite"], default: "free" },
    // Admin fields
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    kycStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    kycDocumentUrl: String,
    kycSelfieUrl: String,
    kycSubmittedAt: Date,
    kycReviewedAt: Date,
    kycReviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    kycNotes: String,
    loginHistory: [{ ip: String, at: Date, device: String }],
    flagged: { type: Boolean, default: false },
    flagReason: String,
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
