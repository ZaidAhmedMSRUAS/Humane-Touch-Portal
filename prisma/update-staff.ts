import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'Password@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const staffMembers = [
    // --- ADMIN ---
    {
      fullName: 'Zaid Ahmed',
      phone: '9902751305',
      email: 'zaid.admin@humanetouch.org',
      role: UserRole.ADMIN,
    },

    // --- TRUSTEES ---
    {
      fullName: 'Tazaiyun Oomer',
      phone: '9845027337',
      email: 'tazaiyun.oomer@humanetouch.org',
      role: UserRole.TRUSTEE,
    },
    {
      fullName: 'Nazia Masood',
      phone: '9880118223',
      email: 'nazia.masood@humanetouch.org',
      role: UserRole.TRUSTEE,
    },
    {
      fullName: 'Zaiba Abdulla',
      phone: '9845196360',
      email: 'zaiba.abdulla@humanetouch.org',
      role: UserRole.TRUSTEE,
    },

    // --- VOLUNTEERS ---
    {
      fullName: 'Nimra M',
      phone: '9972533519',
      email: 'nimra.volunteer@humanetouch.org',
      role: UserRole.VOLUNTEER,
    },
    {
      fullName: 'F Abubakar Siddiq',
      phone: '8123255172',
      email: 'abubakar.volunteer@humanetouch.org',
      role: UserRole.VOLUNTEER,
    },
    {
      fullName: 'Umar',
      phone: '9019720187',
      email: 'umar.volunteer@humanetouch.org',
      role: UserRole.VOLUNTEER,
    },
    {
      fullName: 'Tasmiya',
      phone: '9620421208',
      email: 'tasmiya.volunteer@humanetouch.org',
      role: UserRole.VOLUNTEER,
    },
    {
      fullName: 'Mehrunnisa',
      phone: '6362920821',
      email: 'mehrunnisa.volunteer@humanetouch.org',
      role: UserRole.VOLUNTEER,
    },
  ];

  console.log('🔄 Syncing staff accounts to Neon database...\n');

  for (const staff of staffMembers) {
    const user = await prisma.user.upsert({
      where: {
        phone_role: {
          phone: staff.phone,
          role: staff.role,
        },
      },
      update: {
        fullName: staff.fullName,
        email: staff.email,
        isActive: true,
      },
      create: {
        fullName: staff.fullName,
        phone: staff.phone,
        email: staff.email,
        role: staff.role,
        passwordHash: passwordHash,
        isActive: true,
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });

    console.log(`✓ [${user.role}] ${user.fullName} (${user.phone}) - Ready`);
  }

  console.log('\n✨ All Admin, Trustee, and Volunteer accounts synchronized successfully!');
}

main()
  .catch((e) => {
    console.error('Error syncing staff:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });