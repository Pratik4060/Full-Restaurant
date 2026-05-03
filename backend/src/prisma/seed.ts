import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@zhonix.com" },
    update: {
      name: "Admin User",
      passwordHash,
    },
    create: {
      name: "Admin User",
      email: "admin@zhonix.com",
      passwordHash,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
