const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updatedAdmin = await prisma.user.upsert({
    where: {
      phone_role: {
        phone: '9902751305',
        role: 'ADMIN',
      },
    },
    update: {
      fullName: 'Zaid Ahmed',
      email: 'zaid.admin@humanetouch.org',
    },
    create: {
      fullName: 'Zaid Ahmed',
      phone: '9902751305',
      email: 'zaid.admin@humanetouch.org',
      role: 'ADMIN',
      passwordHash: '$2a$10$wE9K9rKqZ6Qx6L0uW6t4q.Y8N3ZzL6V7K4f1r5e7q9e1w2r3t4y5u', // Password@123
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
  });

  console.log(`✓ Admin name updated to: ${updatedAdmin.fullName} (${updatedAdmin.phone})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());