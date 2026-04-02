import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commissionConfigSchema } from "@/lib/validations/offers";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const config = await prisma.commissionConfig.findUnique({ where: { id: "global" } });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = commissionConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { successRate, failureRate, registrationFeeEuros } = parsed.data;

  const config = await prisma.commissionConfig.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      successRate: successRate / 100,
      failureRate: failureRate / 100,
      registrationFeeCents: Math.round(registrationFeeEuros * 100),
    },
    update: {
      successRate: successRate / 100,
      failureRate: failureRate / 100,
      registrationFeeCents: Math.round(registrationFeeEuros * 100),
    },
  });

  return NextResponse.json(config);
}
