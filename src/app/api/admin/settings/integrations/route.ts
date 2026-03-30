import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { razorpayKeyId, razorpayKeySecret, razorpayMode } = await req.json();

  if (!razorpayKeyId || !razorpayKeySecret) {
    return NextResponse.json({ error: "Both KEY_ID and KEY_SECRET are required" }, { status: 400 });
  }

  // Validate key format
  const expectedPrefix = razorpayMode === "live" ? "rzp_live_" : "rzp_test_";
  if (!razorpayKeyId.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: `KEY_ID must start with "${expectedPrefix}" for ${razorpayMode} mode` },
      { status: 400 }
    );
  }

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    // Update or append RAZORPAY_KEY_ID
    if (/^RAZORPAY_KEY_ID=.*/m.test(content)) {
      content = content.replace(/^RAZORPAY_KEY_ID=.*/m, `RAZORPAY_KEY_ID=${razorpayKeyId}`);
    } else {
      content += `\nRAZORPAY_KEY_ID=${razorpayKeyId}`;
    }

    // Update or append RAZORPAY_KEY_SECRET
    if (/^RAZORPAY_KEY_SECRET=.*/m.test(content)) {
      content = content.replace(/^RAZORPAY_KEY_SECRET=.*/m, `RAZORPAY_KEY_SECRET=${razorpayKeySecret}`);
    } else {
      content += `\nRAZORPAY_KEY_SECRET=${razorpayKeySecret}`;
    }

    fs.writeFileSync(envPath, content.trim() + "\n", "utf8");

    return NextResponse.json({ success: true, message: "Keys saved to .env.local. Restart server to apply." });
  } catch (err) {
    console.error("Failed to write .env.local:", err);
    return NextResponse.json({ error: "Failed to write environment file" }, { status: 500 });
  }
}
