import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.user.findMany({
    where: {
      role: { in: [UserRole.ADMIN, UserRole.TRUSTEE, UserRole.VOLUNTEER] },
    },
    select: {
      fullName: true,
      phone: true,
      role: true,
    },
    orderBy: { role: 'asc' },
  });

  console.log('\n--- ACTIVE STAFF DIRECTORY IN DATABASE ---');
  console.table(staff);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });