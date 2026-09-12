import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Searching for Volunteer "Zaid Khan"...');

  const deleted = await prisma.user.deleteMany({
    where: {
      fullName: { contains: 'Zaid Khan', mode: 'insensitive' },
      role: UserRole.VOLUNTEER,
    },
  });

  console.log(`✓ Permanently removed ${deleted.count} record(s) for Volunteer Zaid Khan from database.`);
}

main()
  .catch((e) => {
    console.error('Error removing Zaid Khan:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });