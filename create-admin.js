const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  console.log('Connecting to database and verifying Admin account...');
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.upsert({
    where: {
      phone_role: {
        phone: '9902751305',
        role: 'ADMIN',
      },
    },
    update: {
      fullName: 'System Administrator',
      email: 'admin@humanetouch.org',
      passwordHash: passwordHash,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
    create: {
      fullName: 'System Administrator',
      phone: '9902751305',
      email: 'admin@humanetouch.org',
      role: 'ADMIN',
      passwordHash: passwordHash,
      isActive: true,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
  });

  console.log('✓ ADMIN profile successfully confirmed in database:');
  console.log(`  - Name: ${admin.fullName}`);
  console.log(`  - Role: ${admin.role}`);
  console.log(`  - Phone: ${admin.phone}`);
  console.log(`  - Active: ${admin.isActive}`);
}

run()
  .catch((e) => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());