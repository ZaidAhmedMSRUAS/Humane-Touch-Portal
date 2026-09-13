import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.deleteMany({
    where: {
      fullName: { contains: 'Zaid Khan', mode: 'insensitive' },
      role: UserRole.VOLUNTEER,
    },
  });

  console.log(`✓ Permanently deleted ${result.count} account(s) for Volunteer Zaid Khan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });