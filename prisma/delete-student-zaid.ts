import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Locating STUDENT account for Zaid Ahmed...\n');

  // Query strictly for student role to protect Admin credentials
  const targetStudents = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      fullName: { contains: 'Zaid', mode: 'insensitive' },
    },
    include: {
      studentApplications: {
        select: { id: true, referenceNumber: true },
      },
    },
  });

  if (targetStudents.length === 0) {
    console.log('ℹ️ No student account found for Zaid Ahmed.');
    return;
  }

  for (const student of targetStudents) {
    console.log(`Found student: ${student.fullName} (Phone: ${student.phone}, Role: ${student.role})`);

    const appIds = student.studentApplications.map((a) => a.id);

    if (appIds.length > 0) {
      // 1. Delete dependent verification reports
      const reports = await prisma.verificationReport.deleteMany({
        where: { applicationId: { in: appIds } },
      });
      console.log(`  ✓ Removed ${reports.count} linked verification report(s)`);

      // 2. Delete applications
      const apps = await prisma.application.deleteMany({
        where: { id: { in: appIds } },
      });
      console.log(`  ✓ Removed ${apps.count} linked application(s)`);
    }

    // 3. Clear deletion requests
    await prisma.studentDeletionRequest.deleteMany({
      where: { studentId: student.id },
    });

    // 4. Delete student User record
    await prisma.user.delete({
      where: { id: student.id },
    });

    console.log(`  ✓ Permanently purged student record: ${student.fullName} (ID: ${student.id})\n`);
  }

  console.log('✨ Cleanup complete! Admin Zaid Ahmed (9902751305) remains active.');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });