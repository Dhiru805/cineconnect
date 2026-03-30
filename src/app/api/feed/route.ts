import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

// Inline Post model
interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  type: "post" | "casting_call" | "achievement" | "behind_scenes";
  tags?: string[];
  likeCount: number;
  commentCount: number;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    mediaUrl: String,
    mediaType: { type: String, enum: ["image", "video"] },
    type: {
      type: String,
      enum: ["post", "casting_call", "achievement", "behind_scenes"],
      default: "post",
    },
    tags: [String],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// GET /api/feed — paginated feed
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const type = searchParams.get("type");
  const authorId = searchParams.get("authorId");

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (authorId) filter.author = authorId;

  const posts = await Post.find(filter)
    .populate("author", "name avatar slug role isVerified verificationLevel")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(filter);
  return NextResponse.json({ posts, total });
}

// POST /api/feed — create a post
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { content, mediaUrl, mediaType, type, tags } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await Post.create({
    author: user.id,
    content: content.trim(),
    mediaUrl,
    mediaType,
    type: type || "post",
    tags,
  });

  const populated = await Post.findById(post._id).populate(
    "author",
    "name avatar slug role isVerified verificationLevel"
  );
  return NextResponse.json({ post: populated }, { status: 201 });
}

// PATCH /api/feed — like/unlike a post
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { postId, action } = await req.json();
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const post = await Post.findById(postId);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const userId = new mongoose.Types.ObjectId(user.id);
  const liked = post.likes.some((id) => id.equals(userId));

  if (action === "like" && !liked) {
    post.likes.push(userId);
    post.likeCount = post.likes.length;
  } else if (action === "unlike" && liked) {
    post.likes = post.likes.filter((id) => !id.equals(userId));
    post.likeCount = post.likes.length;
  }

  await post.save();
  return NextResponse.json({ likeCount: post.likeCount, liked: !liked });
}
