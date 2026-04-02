import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get("sortBy") || "averageRating";

  const suppliers = await prisma.supplierProfile.findMany({
    where: { registrationPaid: true },
    select: {
      id: true,
      companyName: true,
      description: true,
      averageRating: true,
      totalRatings: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: sortBy === "averageRating" ? { averageRating: "desc" } : { createdAt: "desc" },
  });

  return NextResponse.json(suppliers);
}
