import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose, { Schema, Document } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

export interface ILocation extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  type: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  dailyRate?: number;
  currency: string;
  area?: number;
  capacity?: number;
  amenities?: string[];
  available: boolean;
  contactName?: string;
  contactPhone?: string;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: String,
    dailyRate: Number,
    currency: { type: String, default: "INR" },
    area: Number,
    capacity: Number,
    amenities: [String],
    available: { type: Boolean, default: true },
    contactName: String,
    contactPhone: String,
  },
  { timestamps: true }
);

const Location =
  mongoose.models.FilmLocation ||
  mongoose.model<ILocation>("FilmLocation", LocationSchema);

function getUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// GET /api/locations?city=&type=&ownerId=
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const ownerId = searchParams.get("ownerId");
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const filter: Record<string, unknown> = {};
  if (city) filter.city = { $regex: city, $options: "i" };
  if (type) filter.type = { $regex: type, $options: "i" };
  if (ownerId) filter.owner = ownerId;

  const [locations, total] = await Promise.all([
    Location.find(filter)
      .populate("owner", "name slug avatar isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Location.countDocuments(filter),
  ]);

  return NextResponse.json({ locations, total, skip, limit });
}

// POST /api/locations
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { name, type, description, address, city, state, pincode, dailyRate, area, capacity, amenities, contactName, contactPhone } = body;

  if (!name || !type || !address || !city || !state) {
    return NextResponse.json(
      { error: "name, type, address, city, and state are required" },
      { status: 400 }
    );
  }

  const loc = await Location.create({
    owner: user.id,
    name, type, description, address, city, state, pincode,
    dailyRate: dailyRate ? Number(dailyRate) : undefined,
    area: area ? Number(area) : undefined,
    capacity: capacity ? Number(capacity) : undefined,
    amenities: amenities || [],
    contactName,
    contactPhone,
  });

  const populated = await Location.findById(loc._id).populate("owner", "name slug avatar isVerified");
  return NextResponse.json({ location: populated }, { status: 201 });
}

// PATCH /api/locations
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { locationId, ...updates } = body;
  if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });

  const loc = await Location.findOne({ _id: locationId, owner: user.id });
  if (!loc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  Object.assign(loc, updates);
  await loc.save();
  return NextResponse.json({ location: loc });
}

// DELETE /api/locations?id=
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await Location.findOneAndDelete({ _id: id, owner: user.id });
  return NextResponse.json({ success: true });
}
