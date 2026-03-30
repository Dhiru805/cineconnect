import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

// Inline Production model
interface IScene {
  sceneNumber: string;
  description: string;
  location?: string;
  cast?: string[];
  status: "pending" | "filming" | "done";
  scheduledDate?: Date;
  notes?: string;
}

interface ICallSheet {
  date: Date;
  generalCallTime: string;
  location: string;
  scenes: string[];
  crew: { name: string; department: string; callTime: string }[];
  notes?: string;
}

interface IProduction extends Document {
  project: mongoose.Types.ObjectId;
  producer: mongoose.Types.ObjectId;
  title: string;
  status: "pre-production" | "production" | "post-production" | "completed";
  scenes: IScene[];
  shootingDates: Date[];
  crewAssignments: { userId?: mongoose.Types.ObjectId; name: string; role: string; department: string }[];
  callSheets: ICallSheet[];
  milestones: { title: string; dueDate?: Date; completed: boolean }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionSchema = new Schema<IProduction>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    producer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["pre-production", "production", "post-production", "completed"],
      default: "pre-production",
    },
    scenes: [
      {
        sceneNumber: String,
        description: String,
        location: String,
        cast: [String],
        status: { type: String, enum: ["pending", "filming", "done"], default: "pending" },
        scheduledDate: Date,
        notes: String,
      },
    ],
    shootingDates: [Date],
    crewAssignments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: String,
        role: String,
        department: String,
      },
    ],
    callSheets: [
      {
        date: Date,
        generalCallTime: String,
        location: String,
        scenes: [String],
        crew: [{ name: String, department: String, callTime: String }],
        notes: String,
      },
    ],
    milestones: [
      {
        title: String,
        dueDate: Date,
        completed: { type: Boolean, default: false },
      },
    ],
    notes: String,
  },
  { timestamps: true }
);

const Production =
  mongoose.models.Production ||
  mongoose.model<IProduction>("Production", ProductionSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/production?projectId=xxx
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const filter: Record<string, unknown> = { producer: user.id };
  if (projectId) filter.project = projectId;

  const productions = await Production.find(filter)
    .populate("project", "title type status")
    .sort({ createdAt: -1 });

  return NextResponse.json({ productions });
}

// POST /api/production — create production board
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { project, title, scenes, crewAssignments, milestones, notes, status } = body;

  if (!project || !title) {
    return NextResponse.json({ error: "project and title are required" }, { status: 400 });
  }

  const existing = await Production.findOne({ project, producer: user.id });
  if (existing) {
    // Update existing
    Object.assign(existing, { title, scenes, crewAssignments, milestones, notes, status });
    await existing.save();
    const updated = await Production.findById(existing._id).populate("project", "title type status");
    return NextResponse.json({ production: updated });
  }

  const production = await Production.create({
    project,
    producer: user.id,
    title,
    scenes: scenes || [],
    crewAssignments: crewAssignments || [],
    milestones: milestones || [],
    notes,
    status: status || "pre-production",
  });

  const populated = await Production.findById(production._id).populate("project", "title type status");
  return NextResponse.json({ production: populated }, { status: 201 });
}

// PATCH /api/production — update scenes, crew, milestones
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { productionId, action, data } = body;

  if (!productionId) return NextResponse.json({ error: "productionId required" }, { status: 400 });

  const production = await Production.findOne({ _id: productionId, producer: user.id });
  if (!production) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

  switch (action) {
    case "add_scene":
      production.scenes.push(data);
      break;
    case "update_scene": {
      const si = production.scenes.findIndex((s) => s.sceneNumber === data.sceneNumber);
      if (si >= 0) Object.assign(production.scenes[si], data);
      break;
    }
    case "delete_scene":
      production.scenes = production.scenes.filter((s) => s.sceneNumber !== data.sceneNumber);
      break;
    case "add_crew":
      production.crewAssignments.push(data);
      break;
    case "remove_crew":
      production.crewAssignments = production.crewAssignments.filter((c) => c.name !== data.name);
      break;
      case "toggle_milestone": {
        const mi = production.milestones.findIndex((m) => m.title === data.title);
        if (mi >= 0) production.milestones[mi].completed = !production.milestones[mi].completed;
        break;
      }
      case "add_milestone":
        production.milestones.push({ title: data.title, dueDate: data.dueDate, completed: false });
        break;
    case "add_callsheet":
      production.callSheets.push(data);
      break;
    case "update_status":
      production.status = data.status;
      break;
    default:
      // Generic field update
      Object.assign(production, data);
  }

  await production.save();
  const updated = await Production.findById(productionId).populate("project", "title type status");
  return NextResponse.json({ production: updated });
}
