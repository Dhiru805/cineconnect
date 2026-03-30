import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { Audition } from "@/lib/models/Audition";
import { Project } from "@/lib/models/Project";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";

// GET /api/auditions?projectId=xxx  OR  ?applicantId=me
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (projectId) {
      filter.project = projectId;
    } else {
      filter.applicant = decoded.id;
    }

    const auditions = await Audition.find(filter)
      .populate("applicant", "name avatar slug role skills")
      .populate("project", "title type location")
      .sort({ createdAt: -1 });

    return NextResponse.json({ auditions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/auditions — apply to a project
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const body = await req.json();
    const { projectId, roleAppliedFor, coverNote, selfTapeUrl } = body;

    if (!projectId || !roleAppliedFor) {
      return NextResponse.json({ error: "projectId and roleAppliedFor required" }, { status: 400 });
    }

    const exists = await Audition.findOne({ project: projectId, applicant: decoded.id });
    if (exists) {
      return NextResponse.json({ error: "Already applied to this project" }, { status: 409 });
    }

    const audition = await Audition.create({
      project: projectId,
      applicant: decoded.id,
      roleAppliedFor,
      coverNote,
      selfTapeUrl,
    });

    await Project.findByIdAndUpdate(projectId, { $inc: { applicantCount: 1 } });

    return NextResponse.json({ audition }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/auditions — update status (producer)
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { auditionId, status, producerNotes, callbackDate } = await req.json();
    const audition = await Audition.findByIdAndUpdate(
      auditionId,
      { status, producerNotes, callbackDate },
      { new: true }
    );
    return NextResponse.json({ audition });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
