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

    const { applicationId, sanctionedAmount, action, remarks } = await req.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const amount = Number(sanctionedAmount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Please enter a valid sanctioned amount in ₹.' }, { status: 400 });
      }

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          sanctionedAmount: amount,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Scholarship grant of ₹${amount.toLocaleString('en-IN')} approved successfully. Award Letter and Certificate unlocked.`,
        application: updated,
      });
    }

    if (action === 'REJECT') {
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.REJECTED,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Application rejected by Board of Trustees.',
        application: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Trustee Action Error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}