import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Locating STUDENT accounts for Nimra and Zaid Ahmed...\n');

  // Query strictly for student roles to protect Admin and Volunteer credentials
  const targetStudents = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      OR: [
        { fullName: { contains: 'Nimra', mode: 'insensitive' } },
        { fullName: { contains: 'Zaid', mode: 'insensitive' } },
      ],
    },
    include: {
      studentApplications: {
        select: { id: true, referenceNumber: true },
      },
    },
  });

  if (targetStudents.length === 0) {
    console.log('ℹ️ No records found with role STUDENT for Nimra or Zaid Ahmed.');
    return;
  }

  for (const student of targetStudents) {
    console.log(`Processing deletion for: [${student.role}] ${student.fullName} (${student.phone})`);

    const appIds = student.studentApplications.map((a) => a.id);

    if (appIds.length > 0) {
      // 1. Delete dependent verification reports
      const reports = await prisma.verificationReport.deleteMany({
        where: { applicationId: { in: appIds } },
      });
      console.log(`  ✓ Removed ${reports.count} linked verification report(s)`);

      // 2. Delete scholarship applications
      const apps = await prisma.application.deleteMany({
        where: { id: { in: appIds } },
      });
      console.log(`  ✓ Removed ${apps.count} linked application(s)`);
    }

    // 3. Clear any pending deletion requests
    await prisma.studentDeletionRequest.deleteMany({
      where: { studentId: student.id },
    });

    // 4. Delete the student User record
    await prisma.user.delete({
      where: { id: student.id },
    });

    console.log(`  ✓ Permanently purged student record: ${student.fullName}\n`);
  }

  console.log('✨ Cleanup complete! Admin Zaid Ahmed and Head Volunteer Nimra M accounts remain active.');
}

main()
  .catch((e) => {
    console.error('Error executing cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });