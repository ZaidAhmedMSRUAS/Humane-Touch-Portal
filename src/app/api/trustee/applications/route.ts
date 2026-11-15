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

    const isAdmin = (session.user as any).role === UserRole.ADMIN;
    const [applications, registeredCandidates, approvedScholars, sanctionedAggregate] = await Promise.all([
      prisma.application.findMany({
        where: isAdmin ? undefined : { status: 'TRUSTEE_INTERVIEW' },
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
      }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      // A trustee records the grant when moving an application to
      // ADMIN_FINALIZATION. Include those sanctioned amounts immediately;
      // final approval is tracked separately by approvedScholars below.
      prisma.application.aggregate({ where: { sanctionedAmount: { gt: 0 } }, _sum: { sanctionedAmount: true } }),
    ]);

    return NextResponse.json({
      success: true,
      applications,
      statistics: {
        registeredCandidates,
        approvedScholars,
        sanctionedGrants: sanctionedAggregate._sum.sanctionedAmount || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching trustee applications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}
