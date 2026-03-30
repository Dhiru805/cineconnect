import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { Project } from "@/lib/models/Project";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";

// GET /api/projects?type=film&location=Mumbai&status=open&producerId=me
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const producerId = searchParams.get("producerId");
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (status) filter.status = status;

    if (producerId === "me") {
      const token = req.cookies.get("token")?.value;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
          filter.producer = decoded.id;
        } catch {
          // token invalid — ignore
        }
      }
    } else if (producerId) {
      filter.producer = producerId;
    }

    const projects = await Project.find(filter)
      .populate("producer", "name avatar slug role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(filter);
    return NextResponse.json({ projects, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/projects — create project (producer only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (!["producer", "agency", "brand"].includes(decoded.role)) {
      return NextResponse.json({ error: "Only producers can post projects" }, { status: 403 });
    }

    const body = await req.json();
    const project = await Project.create({ ...body, producer: decoded.id });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
