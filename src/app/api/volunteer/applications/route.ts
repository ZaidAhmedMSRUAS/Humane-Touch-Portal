import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as any;

    // Resolve user from database by ID, phone, or email
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          sessionUser.id ? { id: sessionUser.id } : undefined,
          sessionUser.phone ? { phone: sessionUser.phone } : undefined,
          sessionUser.email ? { email: sessionUser.email } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
    }

    const isHeadVolunteerOrAdmin =
      dbUser.role === UserRole.ADMIN ||
      dbUser.phone === '9972533519' || // Nimra M (Head Volunteer)
      dbUser.fullName?.toLowerCase().includes('nimra');

    // Head volunteer / Admin sees all; regular volunteers see their assigned students
    const whereClause = isHeadVolunteerOrAdmin
      ? {}
      : {
          OR: [
            { assignedVolunteerId: dbUser.id },
            { assignedVolunteer: { phone: dbUser.phone } },
          ],
        };

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        assignedVolunteer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('Volunteer applications fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}