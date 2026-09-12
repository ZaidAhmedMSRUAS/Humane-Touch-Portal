const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('Password@123', 10);

  const users = [
    { fullName: 'System Administrator', phone: '9902751305', role: 'ADMIN', email: 'admin@humanetouch.org' },
    { fullName: 'Admin (Student Persona)', phone: '9902751305', role: 'STUDENT', email: 'admin.student@humanetouch.org' },
    { fullName: 'Tazaiyun Oomer', phone: '9900000002', role: 'TRUSTEE', email: 'tazaiyun@humanetouch.org' },
    { fullName: 'Amaan Asim', phone: '9900000005', role: 'TRUSTEE', email: 'amaan@humanetouch.org' },
    { fullName: 'Board Trustee 3', phone: '9900000006', role: 'TRUSTEE', email: 'trustee3@humanetouch.org' },
    { fullName: 'Zaid Khan (South)', phone: '9900000003', role: 'VOLUNTEER', email: 'zaid@humanetouch.org' },
    { fullName: 'Bilal Ahmed (North)', phone: '9900000007', role: 'VOLUNTEER', email: 'bilal@humanetouch.org' },
    { fullName: 'Tanveer Pasha (Central)', phone: '9900000008', role: 'VOLUNTEER', email: 'tanveer@humanetouch.org' },
    { fullName: 'Ayesha Siddiqua', phone: '9900000004', role: 'STUDENT', email: 'ayesha@student.com' },
  ];

  console.log('Writing users directly into database...');

  for (const u of users) {
    const record = await prisma.user.upsert({
      where: {
        phone_role: {
          phone: u.phone,
          role: u.role,
        },
      },
      update: {
        fullName: u.fullName,
        passwordHash: hash,
        email: u.email,
        isActive: true,
      },
      create: {
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        email: u.email,
        passwordHash: hash,
        isActive: true,
      },
    });
    console.log(` -> [${record.role}] ${record.fullName} (Phone: ${record.phone}) created/verified.`);
  }

  console.log('\nSUCCESS: All user profiles are ready!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());