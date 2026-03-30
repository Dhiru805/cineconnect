import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

// Inline Notification model
interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// GET /api/notifications — list notifications for current user
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const filter: Record<string, unknown> = { user: user.id };
  if (unreadOnly) filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ user: user.id, isRead: false });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark as read
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { notificationId, markAllRead } = await req.json();

  if (markAllRead) {
    await Notification.updateMany({ user: user.id }, { isRead: true });
    return NextResponse.json({ message: "All marked as read" });
  }
  if (notificationId) {
    await Notification.findOneAndUpdate({ _id: notificationId, user: user.id }, { isRead: true });
    return NextResponse.json({ message: "Marked as read" });
  }
  return NextResponse.json({ error: "notificationId or markAllRead required" }, { status: 400 });
}

// POST /api/notifications — create a notification (internal use)
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { userId, type, title, message, link } = await req.json();
  const notification = await Notification.create({ user: userId || user.id, type, title, message, link });
  return NextResponse.json({ notification }, { status: 201 });
}
