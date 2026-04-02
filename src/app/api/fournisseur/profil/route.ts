import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      companyName: true,
      description: true,
      averageRating: true,
      totalRatings: true,
      registrationPaid: true,
      sponsoredUntil: true,
    },
  });

  if (!supplier) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  return NextResponse.json(supplier);
}
