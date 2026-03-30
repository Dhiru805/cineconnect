import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { PlatformSettings } from "@/lib/models/PlatformSettings";
import fs from "fs";
import path from "path";

// GET /api/admin/settings/integrations — return current saved keys (masked)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  await connectDB();
  const settings = await PlatformSettings.find({
    key: { $in: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_MODE"] },
  });

  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  // Also pick up from env if not in DB yet
  const keyId = map["RAZORPAY_KEY_ID"] || process.env.RAZORPAY_KEY_ID || "";
  const mode = map["RAZORPAY_MODE"] || (keyId.startsWith("rzp_live_") ? "live" : "test");

  return NextResponse.json({
    keyId: keyId ? keyId.substring(0, 12) + "•••••••••••••" : "",
    keyIdFull: keyId,
    hasSecret: !!(map["RAZORPAY_KEY_SECRET"] || process.env.RAZORPAY_KEY_SECRET),
    mode,
    isConfigured: !!(keyId && (map["RAZORPAY_KEY_SECRET"] || process.env.RAZORPAY_KEY_SECRET)),
  });
}

// POST /api/admin/settings/integrations — save keys to DB and .env.local
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { razorpayKeyId, razorpayKeySecret, razorpayMode } = await req.json();

  if (!razorpayKeyId || !razorpayKeySecret) {
    return NextResponse.json({ error: "Both KEY_ID and KEY_SECRET are required" }, { status: 400 });
  }

  const expectedPrefix = razorpayMode === "live" ? "rzp_live_" : "rzp_test_";
  if (!razorpayKeyId.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: `KEY_ID must start with "${expectedPrefix}" for ${razorpayMode} mode` },
      { status: 400 }
    );
  }

  await connectDB();

  // Upsert each key in DB
  await Promise.all([
    PlatformSettings.findOneAndUpdate(
      { key: "RAZORPAY_KEY_ID" },
      { value: razorpayKeyId },
      { upsert: true, new: true }
    ),
    PlatformSettings.findOneAndUpdate(
      { key: "RAZORPAY_KEY_SECRET" },
      { value: razorpayKeySecret },
      { upsert: true, new: true }
    ),
    PlatformSettings.findOneAndUpdate(
      { key: "RAZORPAY_MODE" },
      { value: razorpayMode || "test" },
      { upsert: true, new: true }
    ),
  ]);

  // Also write to .env.local so next server restart picks them up
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    const upsertEnv = (c: string, k: string, v: string) =>
      new RegExp(`^${k}=.*`, "m").test(c)
        ? c.replace(new RegExp(`^${k}=.*`, "m"), `${k}=${v}`)
        : c + `\n${k}=${v}`;

    content = upsertEnv(content, "RAZORPAY_KEY_ID", razorpayKeyId);
    content = upsertEnv(content, "RAZORPAY_KEY_SECRET", razorpayKeySecret);

    fs.writeFileSync(envPath, content.trim() + "\n", "utf8");
  } catch (err) {
    console.error("Could not write .env.local:", err);
    // Non-fatal — keys are already in DB
  }

  return NextResponse.json({
    success: true,
    message: "Razorpay keys saved. Active for all new payment requests immediately.",
  });
}
