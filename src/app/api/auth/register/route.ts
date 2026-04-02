import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerClientSchema, registerSupplierSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    if (type === "CLIENT") {
      const parsed = registerClientSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "CLIENT",
          clientProfile: {
            create: {
              companyName: parsed.data.companyName || null,
            },
          },
        },
      });

      return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
    }

    if (type === "SUPPLIER") {
      const parsed = registerSupplierSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: "SUPPLIER",
          supplierProfile: {
            create: {
              companyName: parsed.data.companyName,
              description: parsed.data.description || null,
            },
          },
        },
      });

      return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
    }

    return NextResponse.json({ error: "Type d'inscription invalide" }, { status: 400 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
