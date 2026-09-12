import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'VOLUNTEER') {
      return NextResponse.json({ error: 'Unauthorized. Volunteer credentials required.' }, { status: 403 });
    }

    const volunteerId = (session.user as any).id;
    const {
      applicationId,
      marksCardVerified,
      incomeCertificateVerified,
      feeDemandNoteVerified,
      chequePayeeVerified,
      volunteerRemarks,
      isRecommended,
    } = await req.json();

    if (!applicationId || !chequePayeeVerified || !volunteerRemarks) {
      return NextResponse.json(
        { error: 'Application ID, Cheque Payee Name, and Volunteer Remarks are mandatory.' },
        { status: 400 }
      );
    }

    // Save Verification Report & move application to TRUSTEE_INTERVIEW
    const report = await prisma.verificationReport.upsert({
      where: { applicationId },
      update: {
        volunteerId,
        marksCardVerified: !!marksCardVerified,
        incomeCertificateVerified: !!incomeCertificateVerified,
        feeDemandNoteVerified: !!feeDemandNoteVerified,
        chequePayeeVerified: chequePayeeVerified.trim(),
        volunteerRemarks: volunteerRemarks.trim(),
        isRecommended: !!isRecommended,
      },
      create: {
        applicationId,
        volunteerId,
        marksCardVerified: !!marksCardVerified,
        incomeCertificateVerified: !!incomeCertificateVerified,
        feeDemandNoteVerified: !!feeDemandNoteVerified,
        chequePayeeVerified: chequePayeeVerified.trim(),
        volunteerRemarks: volunteerRemarks.trim(),
        isRecommended: !!isRecommended,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.TRUSTEE_INTERVIEW,
        chequeInFavourOf: chequePayeeVerified.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'In-person document check complete. Dossier routed for Trustee Interview.',
      report,
    });
  } catch (error: any) {
    console.error('Document verification error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit verification report.' }, { status: 500 });
  }
}