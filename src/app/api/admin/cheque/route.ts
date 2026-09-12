import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 403 });
    }

    const { applicationId, chequeNumber } = await req.json();

    if (!applicationId || !chequeNumber) {
      return NextResponse.json(
        { error: 'Application ID and Cheque Number are mandatory.' },
        { status: 400 }
      );
    }

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { chequeNumber: chequeNumber.trim() },
    });

    return NextResponse.json({
      success: true,
      message: `Cheque number (${chequeNumber}) recorded successfully!`,
      application: updatedApp,
    });
  } catch (error: any) {
    console.error('Cheque Update Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update cheque number.' },
      { status: 500 }
    );
  }
}