import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'VOLUNTEER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as any).id;
    const { applicationId, chequeInFavourOf, volunteerRemarks, remarks } = await req.json();

    if (!applicationId || !chequeInFavourOf?.trim()) {
      return NextResponse.json(
        { error: 'Application ID and "Cheque In Favour Of" college payee name are required.' },
        { status: 400 }
      );
    }

    const appId = String(applicationId);
    const volId = String(volunteerId);
    const payee = chequeInFavourOf.trim();
    const notes = volunteerRemarks?.trim() || remarks?.trim() || 'Documents verified in-person and Cheque Payee confirmed.';

    const assignedApplication = await prisma.application.findFirst({ where: { id: appId, assignedVolunteerId: volId, status: ApplicationStatus.DOC_VERIFICATION } });
    if (!assignedApplication) return NextResponse.json({ error: 'This application is not assigned to you or is no longer awaiting verification.' }, { status: 403 });

    // 2. Upsert Verification Report with verified payee and volunteer remarks
    const updatedApplication = await prisma.$transaction(async (tx) => {
      await tx.verificationReport.upsert({
      where: { applicationId: appId },
      update: {
        volunteer: { connect: { id: volId } },
        chequePayeeVerified: payee,
        volunteerRemarks: notes,
      },
      create: {
        application: { connect: { id: appId } },
        volunteer: { connect: { id: volId } },
        chequePayeeVerified: payee,
        volunteerRemarks: notes,
      },
      });
      return tx.application.update({ where: { id: appId }, data: { chequeInFavourOf: payee, status: ApplicationStatus.TRUSTEE_INTERVIEW } });
    });

    return NextResponse.json({
      success: true,
      message: 'Document verification and Cheque Payee details saved successfully.',
      updatedApplication,
    });
  } catch (error: any) {
    console.error('Verification submission error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
