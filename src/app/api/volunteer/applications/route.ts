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

    const user = session.user as any;
    const isHeadVolunteerOrAdmin =
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.VOLUNTEER && user.phone === '9972533519'); // Nimra M

    // Head volunteer / Admin sees all; regular volunteers see their allotted students
    const whereClause = isHeadVolunteerOrAdmin
      ? {}
      : { assignedVolunteerId: user.id };

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
        verificationReport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('Volunteer applications fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}