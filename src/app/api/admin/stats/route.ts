import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Project } from "@/lib/models/Project";
import { Audition } from "@/lib/models/Audition";
import { Contract } from "@/lib/models/Contract";
import { Payment } from "@/lib/models/Payment";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalUsers,
    talentCount,
    crewCount,
    producerCount,
    agencyCount,
    brandCount,
    activeToday,
    activeWeek,
    activeMonth,
    totalProjects,
    openProjects,
    totalAuditions,
    pendingKyc,
    bannedUsers,
    flaggedUsers,
    totalContracts,
    totalPayments,
    paidPayments,
    // growth data last 7 days
    recentUsers,
    recentProjects,
    recentPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "talent" }),
    User.countDocuments({ role: "crew" }),
    User.countDocuments({ role: "producer" }),
    User.countDocuments({ role: "agency" }),
    User.countDocuments({ role: "brand" }),
    User.countDocuments({ updatedAt: { $gte: dayAgo } }),
    User.countDocuments({ updatedAt: { $gte: weekAgo } }),
    User.countDocuments({ updatedAt: { $gte: monthAgo } }),
    Project.countDocuments(),
    Project.countDocuments({ status: "open" }),
    Audition.countDocuments(),
    User.countDocuments({ kycStatus: "pending" }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ flagged: true }),
    Contract.countDocuments(),
    Payment.countDocuments(),
    Payment.countDocuments({ status: "paid" }),
    User.find({ createdAt: { $gte: weekAgo } }).select("createdAt role").lean(),
    Project.find({ createdAt: { $gte: weekAgo } }).select("createdAt").lean(),
    Payment.find({ createdAt: { $gte: weekAgo } }).select("createdAt amount status").lean(),
  ]);

  // Revenue aggregation
  const revenueAgg = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const monthlyRevenueAgg = await Payment.aggregate([
    { $match: { status: "paid", paidAt: { $gte: monthAgo } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

  // Daily revenue last 30 days
  const dailyRevenue = await Payment.aggregate([
    { $match: { status: "paid", paidAt: { $gte: monthAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // User growth last 7 days
  const userGrowth: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    userGrowth[d.toISOString().slice(0, 10)] = 0;
  }
  recentUsers.forEach((u: any) => {
    const key = new Date(u.createdAt).toISOString().slice(0, 10);
    if (userGrowth[key] !== undefined) userGrowth[key]++;
  });

  return NextResponse.json({
    users: {
      total: totalUsers,
      byRole: { talent: talentCount, crew: crewCount, producer: producerCount, agency: agencyCount, brand: brandCount },
      activeToday,
      activeWeek,
      activeMonth,
      banned: bannedUsers,
      flagged: flaggedUsers,
      pendingKyc,
    },
    projects: { total: totalProjects, open: openProjects },
    auditions: { total: totalAuditions },
    contracts: { total: totalContracts },
    payments: {
      total: totalPayments,
      paid: paidPayments,
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
    },
    growth: {
      users: Object.entries(userGrowth).map(([date, count]) => ({ date, count })),
    },
  });
}
