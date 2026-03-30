import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/lib/models/Message";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";

// GET /api/messages?with=userId — conversation thread
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const { searchParams } = new URL(req.url);
    const withUser = searchParams.get("with");

    if (!withUser) {
      // Return list of unique conversation partners
      const sent = await Message.find({ sender: decoded.id })
        .populate("recipient", "name avatar slug role")
        .sort({ createdAt: -1 });
      const received = await Message.find({ recipient: decoded.id })
        .populate("sender", "name avatar slug role")
        .sort({ createdAt: -1 });
      return NextResponse.json({ sent, received });
    }

    const messages = await Message.find({
      $or: [
        { sender: decoded.id, recipient: withUser },
        { sender: withUser, recipient: decoded.id },
      ],
    })
      .populate("sender", "name avatar slug")
      .populate("recipient", "name avatar slug")
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: withUser, recipient: decoded.id, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ messages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const { recipientId, content, fileUrl, fileType } = await req.json();
    if (!recipientId || !content) {
      return NextResponse.json({ error: "recipientId and content required" }, { status: 400 });
    }

    const message = await Message.create({
      sender: decoded.id,
      recipient: recipientId,
      content,
      fileUrl,
      fileType,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
