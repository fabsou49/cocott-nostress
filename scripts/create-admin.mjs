import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@cocott.fr" },
    update: { passwordHash, role: "ADMIN" },
    create: {
      id: "admin-001",
      email: "admin@cocott.fr",
      passwordHash,
      name: "Administrateur",
      role: "ADMIN",
    },
  });

  console.log("✅ Admin créé : admin@cocott.fr / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
