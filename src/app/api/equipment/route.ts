import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

export interface IEquipment extends Document {
  owner: mongoose.Types.ObjectId;
  title: string;
  category: string;
  brand?: string;
  model?: string;
  description?: string;
  dailyRate: number;
  currency: string;
  location: string;
  condition: "new" | "excellent" | "good" | "fair";
  available: boolean;
  features?: string[];
  createdAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    brand: String,
    model: String,
    description: String,
    dailyRate: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    location: { type: String, required: true },
    condition: { type: String, enum: ["new", "excellent", "good", "fair"], default: "good" },
    available: { type: Boolean, default: true },
    features: [String],
  },
  { timestamps: true }
);

const Equipment =
  mongoose.models.Equipment ||
  mongoose.model<IEquipment>("Equipment", EquipmentSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const ownerId = searchParams.get("ownerId");
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const filter: Record<string, unknown> = {};
  if (category) filter.category = { $regex: category, $options: "i" };
  if (location) filter.location = { $regex: location, $options: "i" };
  if (ownerId) filter.owner = ownerId;

  const [items, total] = await Promise.all([
    Equipment.find(filter)
      .populate("owner", "name slug avatar isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Equipment.countDocuments(filter),
  ]);

  return NextResponse.json({ equipment: items, total, skip, limit });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { title, category, brand, model, description, dailyRate, location, condition, features } = body;

  if (!title || !category || !dailyRate || !location) {
    return NextResponse.json(
      { error: "title, category, dailyRate, and location are required" },
      { status: 400 }
    );
  }

  const item = await Equipment.create({
    owner: user.id,
    title,
    category,
    brand,
    model,
    description,
    dailyRate: Number(dailyRate),
    location,
    condition: condition || "good",
    features: features || [],
  });

  const populated = await Equipment.findById(item._id).populate(
    "owner",
    "name slug avatar isVerified"
  );
  return NextResponse.json({ equipment: populated }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { equipmentId, ...updates } = body;
  if (!equipmentId) return NextResponse.json({ error: "equipmentId required" }, { status: 400 });

  const item = await Equipment.findOne({ _id: equipmentId, owner: user.id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  Object.assign(item, updates);
  await item.save();
  return NextResponse.json({ equipment: item });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await Equipment.findOneAndDelete({ _id: id, owner: user.id });
  return NextResponse.json({ success: true });
}
