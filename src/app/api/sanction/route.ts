import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'TRUSTEE') {
      return NextResponse.json({ error: 'Unauthorized. Trustee access required.' }, { status: 403 });
    }

    const trusteeName = session.user.name || 'Managing Trustee';
    const { applicationId, interviewRemarks, interviewScore, sanctionedAmount, decision } = await req.json();

    if (!applicationId || !decision) {
      return NextResponse.json({ error: 'Application ID and decision status are required.' }, { status: 400 });
    }

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: decision === 'APPROVE' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED,
        sanctionedAmount: decision === 'APPROVE' ? parseFloat(sanctionedAmount) || 0 : 0,
        interviewRemarks: interviewRemarks?.trim() || '',
        interviewScore: parseInt(interviewScore) || 10,
        interviewConductedBy: trusteeName,
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Application ${decision === 'APPROVE' ? 'approved' : 'rejected'} by ${trusteeName}`,
      application: updatedApp,
    });
  } catch (error: any) {
    console.error('Trustee Sanction Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process interview decision.' }, { status: 500 });
  }
}