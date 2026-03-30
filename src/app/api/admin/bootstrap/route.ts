import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

// Bootstrap endpoint — promotes the currently logged-in user to admin
// Protected by a secret header: X-Admin-Bootstrap: <JWT_SECRET>
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-bootstrap");
  if (secret !== JWT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  let decoded: { id: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(decoded.id, { isAdmin: true }, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ message: "Admin access granted", user });
}
