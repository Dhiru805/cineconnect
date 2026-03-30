import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  category: "professionalism" | "communication" | "talent" | "general";
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    category: {
      type: String,
      enum: ["professionalism", "communication", "talent", "general"],
      default: "general",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews
ReviewSchema.index({ reviewer: 1, reviewee: 1, project: 1 }, { unique: true, sparse: true });

const Review =
  mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// GET /api/reviews?revieweeId=&skip=&limit=
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const revieweeId = searchParams.get("revieweeId");
  const reviewerId = searchParams.get("reviewerId");
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const filter: Record<string, unknown> = {};
  if (revieweeId) filter.reviewee = revieweeId;
  if (reviewerId) filter.reviewer = reviewerId;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("reviewer", "name slug avatar isVerified role")
      .populate("reviewee", "name slug avatar isVerified role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  // Calculate average rating
  let avgRating = 0;
  if (reviews.length > 0) {
    const allForReviewee = await Review.find({ reviewee: revieweeId });
    const sum = allForReviewee.reduce((acc, r) => acc + r.rating, 0);
    avgRating = allForReviewee.length > 0 ? sum / allForReviewee.length : 0;
  }

  return NextResponse.json({ reviews, total, avgRating: Math.round(avgRating * 10) / 10 });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { revieweeId, projectId, rating, comment, category } = body;

  if (!revieweeId || !rating) {
    return NextResponse.json({ error: "revieweeId and rating are required" }, { status: 400 });
  }
  if (revieweeId === user.id) {
    return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    const review = await Review.create({
      reviewer: user.id,
      reviewee: revieweeId,
      project: projectId || undefined,
      rating: Number(rating),
      comment,
      category: category || "general",
    });

    const populated = await Review.findById(review._id)
      .populate("reviewer", "name slug avatar isVerified role")
      .populate("reviewee", "name slug avatar isVerified role");

    return NextResponse.json({ review: populated }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this person for this project" }, { status: 409 });
    }
    throw err;
  }
}

// DELETE /api/reviews?id=
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await Review.findOneAndDelete({ _id: id, reviewer: user.id });
  return NextResponse.json({ success: true });
}
