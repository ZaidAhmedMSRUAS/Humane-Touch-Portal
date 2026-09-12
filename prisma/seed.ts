import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'Password@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const actualUsers = [
    // 1. Primary Administrator
    {
      fullName: 'Zaid Ahmed',
      email: 'zaid.admin@humanetouch.org',
      phone: '9902751305',
      role: UserRole.ADMIN,
      isPhoneVerified: true,
      isEmailVerified: true,
      passwordHash,
    },
    // 2. Board Trustees
    {
      fullName: 'Tazaiyun Oomer',
      email: 'tazaiyun.oomer@humanetouch.org',
      phone: '9900000002',
      role: UserRole.TRUSTEE,
      isPhoneVerified: true,
      isEmailVerified: true,
      passwordHash,
    },
    {
      fullName: 'Amaan Asim',
      email: 'amaan.asim@humanetouch.org',
      phone: '9900000005',
      role: UserRole.TRUSTEE,
      isPhoneVerified: true,
      isEmailVerified: true,
      passwordHash,
    },
    // 3. Field Verification Volunteers
    {
      fullName: 'Tanveer Pasha',
      email: 'tanveer.volunteer@humanetouch.org',
      phone: '9900000003',
      role: UserRole.VOLUNTEER,
      isPhoneVerified: true,
      isEmailVerified: true,
      passwordHash,
    },
    {
      fullName: 'Bilal Ahmed',
      email: 'bilal.volunteer@humanetouch.org',
      phone: '9900000007',
      role: UserRole.VOLUNTEER,
      isPhoneVerified: true,
      isEmailVerified: true,
      passwordHash,
    },
  ];

  for (const u of actualUsers) {
    await prisma.user.upsert({
      where: {
        phone_role: {
          phone: u.phone,
          role: u.role,
        },
      },
      update: {
        fullName: u.fullName,
        email: u.email,
      },
      create: u,
    });
  }

  console.log('✓ Seed file updated with Zaid Ahmed as Admin.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());