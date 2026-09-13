import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      ((session.user as any).role !== UserRole.TRUSTEE &&
        (session.user as any).role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: 'Trustee or Admin authorization required.' }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
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
    console.error('Error fetching trustee applications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}