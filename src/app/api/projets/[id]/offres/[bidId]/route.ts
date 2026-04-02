import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: accept or reject a bid (CLIENT owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
  const project = await prisma.project.findUnique({ where: { id: params.id } });

  if (!project || project.clientId !== client?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (project.status !== "OPEN" && project.status !== "IN_REVIEW") {
    return NextResponse.json({ error: "Ce projet n'est plus en phase de sélection" }, { status: 400 });
  }

  const { action } = await req.json();

  if (action === "ACCEPT") {
    // Check supplier has a connected Stripe account to receive payment
    const bid = await prisma.bid.findUnique({
      where: { id: params.bidId },
      include: { supplier: { select: { stripeAccountActive: true } } },
    });
    if (!bid) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    if (!bid.supplier.stripeAccountActive) {
      return NextResponse.json(
        { error: "Ce fournisseur n'a pas encore configuré son compte de paiement. Veuillez sélectionner un autre fournisseur ou attendre qu'il finalise son inscription." },
        { status: 400 }
      );
    }

    // Atomic transaction: accept this bid, reject all others, project → IN_REVIEW (awaiting client payment)
    await prisma.$transaction([
      prisma.bid.update({
        where: { id: params.bidId },
        data: { status: "ACCEPTED" },
      }),
      prisma.bid.updateMany({
        where: { projectId: params.id, id: { not: params.bidId } },
        data: { status: "REJECTED" },
      }),
      prisma.project.update({
        where: { id: params.id },
        data: { status: "IN_REVIEW", selectedBidId: params.bidId },
      }),
    ]);

    return NextResponse.json({ requiresPayment: true });
  }

  if (action === "REJECT") {
    const updated = await prisma.bid.update({
      where: { id: params.bidId },
      data: { status: "REJECTED" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}

// DELETE: withdraw a bid (SUPPLIER owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  const bid = await prisma.bid.findUnique({ where: { id: params.bidId } });

  if (!bid || bid.supplierId !== supplier?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (bid.status !== "PENDING") {
    return NextResponse.json({ error: "Cette offre ne peut plus être retirée" }, { status: 400 });
  }

  await prisma.bid.update({
    where: { id: params.bidId },
    data: { status: "WITHDRAWN" },
  });

  return NextResponse.json({ success: true });
}
