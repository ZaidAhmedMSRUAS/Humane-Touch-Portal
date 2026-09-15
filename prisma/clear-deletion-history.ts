import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Purging resolved deletion history from database...');

  const result = await prisma.studentDeletionRequest.deleteMany({
    where: {
      status: { in: ['APPROVED', 'REJECTED'] },
    },
  });

  console.log(`✓ Successfully cleared ${result.count} resolved deletion history record(s).`);
}

main()
  .catch((e) => {
    console.error('Error clearing history:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });