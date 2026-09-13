import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus, UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volunteerId = (session.user as any).id;
    const { applicationId, chequeInFavourOf, remarks, verificationStatus } = await req.json();

    if (!applicationId || !chequeInFavourOf?.trim()) {
      return NextResponse.json(
        { error: 'Application ID and "Cheque In Favour Of" college payee name are required.' },
        { status: 400 }
      );
    }

    // 1. Update Application with Cheque Payee and Verification Status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        chequeInFavourOf: chequeInFavourOf.trim(),
        status: ApplicationStatus.DOC_VERIFICATION,
      },
    });

    // 2. Upsert Verification Report
    await prisma.verificationReport.upsert({
      where: { applicationId },
      update: {
        volunteerId,
        remarks: remarks?.trim() || 'Documents verified and Cheque Payee confirmed.',
        status: verificationStatus || 'VERIFIED',
      },
      create: {
        applicationId,
        volunteerId,
        remarks: remarks?.trim() || 'Documents verified and Cheque Payee confirmed.',
        status: verificationStatus || 'VERIFIED',
      },
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