import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: set or remove sponsoring for a supplier (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { days } = await req.json().catch(() => ({}));

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: params.id } });
  if (!supplier) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });

  // days = 0 means remove sponsoring; days > 0 means extend/set
  const sponsoredUntil =
    days && days > 0
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;

  await prisma.supplierProfile.update({
    where: { id: supplier.id },
    data: { sponsoredUntil },
  });

  return NextResponse.json({ ok: true, sponsoredUntil });
}
