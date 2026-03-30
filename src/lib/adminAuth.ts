// Shared admin auth helper
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024";

export async function requireAdmin(req: NextRequest): Promise<{ ok: true; user: import("@/lib/models/User").IUser } | { ok: false; error: string }> {
  const token = req.cookies.get("token")?.value;
  if (!token) return { ok: false, error: "Unauthorized" };
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return { ok: false, error: "User not found" };
    if (!user.isAdmin && user.role !== "super-admin") return { ok: false, error: "Admin access required" };
    return { ok: true, user };
  } catch {
    return { ok: false, error: "Invalid token" };
  }
}
