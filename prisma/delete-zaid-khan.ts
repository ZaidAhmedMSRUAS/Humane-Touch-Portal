import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Removing Volunteer Zaid Khan (9900000003)...');

  // 1. Find user record
  const user = await prisma.user.findFirst({
    where: {
      phone: '9900000003',
      role: UserRole.VOLUNTEER,
    },
  });

  if (!user) {
    console.log('ℹ️ User 9900000003 not found or already deleted.');
    return;
  }

  // 2. Unassign any assigned applications to prevent foreign key errors
  await prisma.application.updateMany({
    where: { assignedVolunteerId: user.id },
    data: { assignedVolunteerId: null },
  });

  // 3. Remove any verification reports created by this user
  await prisma.verificationReport.deleteMany({
    where: { volunteerId: user.id },
  });

  // 4. Delete the volunteer account
  await prisma.user.delete({
    where: { id: user.id },
  });

  console.log(`✓ Successfully deleted Volunteer Zaid Khan (${user.phone}).\n`);

  // 5. Display updated active staff directory
  const remainingStaff = await prisma.user.findMany({
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

  console.log('--- UPDATED ACTIVE STAFF DIRECTORY ---');
  console.table(remainingStaff);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });