import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ApplicationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      ((session.user as any).role !== UserRole.TRUSTEE &&
        (session.user as any).role !== UserRole.ADMIN)
    ) {
      return NextResponse.json({ error: 'Trustee authorization required.' }, { status: 403 });
    }

    const { applicationId, sanctionedAmount, interviewScore, interviewNotes, trusteeName, decision } = await req.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    const currentTrustee = trusteeName || session.user.name || 'Board of Trustees';

    if (decision === 'APPROVE') {
      const grant = Number(sanctionedAmount);
      if (isNaN(grant) || grant <= 0) {
        return NextResponse.json({ error: 'Please specify a valid sanctioned grant amount in ₹.' }, { status: 400 });
      }

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          sanctionedAmount: grant,
        },
      });

      return NextResponse.json({
        success: true,
        message: `In-Person Interview recorded by ${currentTrustee}. Grant of ₹${grant.toLocaleString('en-IN')} approved! Documents unlocked.`,
        application: updated,
      });
    }

    if (decision === 'REJECT') {
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.REJECTED,
        },
      });

      return NextResponse.json({
        success: true,
        message: `In-Person Interview evaluation recorded. Application marked as rejected.`,
        application: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid decision option.' }, { status: 400 });
  } catch (error: any) {
    console.error('Trustee interview recording error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record interview' }, { status: 500 });
  }
}