import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";

// GET /api/users?role=talent&location=Mumbai&skip=0&limit=12
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const location = searchParams.get("location");
    const language = searchParams.get("language");
    const availability = searchParams.get("availability");
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (role) filter.role = role;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (language) filter.languages = { $in: [language] };
    if (availability) filter.availability = availability;

    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    return NextResponse.json({ users, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/users — update own profile
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const body = await req.json();

    const disallowed = ["password", "email", "_id", "role"];
    disallowed.forEach((k) => delete body[k]);

    const user = await User.findByIdAndUpdate(decoded.id, body, { new: true }).select("-password");
    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
