import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, studentName, studentPhone, reason } = await req.json();

    if (!studentId || !reason?.trim()) {
      return NextResponse.json({ error: 'Student ID and deletion reason are required.' }, { status: 400 });
    }

    const requesterName = session.user.name || 'Nimra M (Head Volunteer)';
    const requesterPhone = (session.user as any).phone || '9972533519';

    const deletionRequest = await prisma.studentDeletionRequest.create({
      data: {
        studentId,
        studentName: studentName || 'Student',
        studentPhone: studentPhone || 'N/A',
        requestedByName: requesterName,
        requestedByPhone: requesterPhone,
        reason: reason.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deletion request for ${studentName} submitted for Admin approval.`,
      deletionRequest,
    });
  } catch (error: any) {
    console.error('Deletion Request Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}