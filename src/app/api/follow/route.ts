import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow =
  mongoose.models.Follow ||
  mongoose.model<IFollow>("Follow", FollowSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// GET /api/follow?userId=  — get followers/following + check if current user follows
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const authUser = getUser(req);

  const [followerCount, followingCount, isFollowing] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
    authUser
      ? Follow.exists({ follower: authUser.id, following: userId })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({ followerCount, followingCount, isFollowing: !!isFollowing });
}

// POST /api/follow  — follow a user { userId }
export async function POST(req: NextRequest) {
  const authUser = getUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === authUser.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  try {
    await Follow.create({ follower: authUser.id, following: userId });
    // Increment follower count on target user
    await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });
    const followerCount = await Follow.countDocuments({ following: userId });
    return NextResponse.json({ following: true, followerCount });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Already following" }, { status: 409 });
    }
    throw err;
  }
}

// DELETE /api/follow?userId=  — unfollow
export async function DELETE(req: NextRequest) {
  const authUser = getUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  await Follow.findOneAndDelete({ follower: authUser.id, following: userId });
  await User.findByIdAndUpdate(userId, { $inc: { followerCount: -1 } });
  const followerCount = await Follow.countDocuments({ following: userId });
  return NextResponse.json({ following: false, followerCount });
}
