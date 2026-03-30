/**
 * Returns Razorpay key credentials, reading from DB (PlatformSettings) first,
 * falling back to environment variables.
 */
import { connectDB } from "@/lib/mongodb";
import { PlatformSettings } from "@/lib/models/PlatformSettings";

export async function getRazorpayKeys(): Promise<{ keyId: string; keySecret: string }> {
  let keyId = process.env.RAZORPAY_KEY_ID || "";
  let keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  // Try DB override (set via Admin → Settings → Integrations)
  try {
    await connectDB();
    const settings = await PlatformSettings.find({
      key: { $in: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] },
    });
    settings.forEach((s) => {
      if (s.key === "RAZORPAY_KEY_ID" && s.value) keyId = s.value;
      if (s.key === "RAZORPAY_KEY_SECRET" && s.value) keySecret = s.value;
    });
  } catch {
    // silently fall back to env vars
  }

  return { keyId, keySecret };
}
