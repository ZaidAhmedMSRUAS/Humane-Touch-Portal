import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSecretaryAccount } from '@/lib/secretaryAccess';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isSecretaryAccount(session?.user)) {
      return NextResponse.json({ error: 'Secretary access required.' }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      include: {
        student: { select: { id: true, fullName: true, phone: true, email: true } },
        assignedVolunteer: { select: { id: true, fullName: true, phone: true } },
        verificationReport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('Secretary application view error:', error);
    return NextResponse.json({ error: error.message || 'Could not load applications.' }, { status: 500 });
  }
}
