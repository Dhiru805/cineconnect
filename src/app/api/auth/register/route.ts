import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_secret_key_2024";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const user = await User.create({ name, email, password: hashed, role, slug });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, slug },
    });
    response.cookies.set("token", token, { httpOnly: true, maxAge: 7 * 24 * 3600, path: "/" });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
