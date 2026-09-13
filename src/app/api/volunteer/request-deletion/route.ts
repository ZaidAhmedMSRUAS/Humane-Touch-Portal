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

    const requesterRole = (session.user as any).role;
    if (requesterRole !== UserRole.VOLUNTEER && requesterRole !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden: Only volunteers and admins can submit deletion requests.' }, { status: 403 });
    }

    const { studentId, studentName, studentPhone, reason } = await req.json();

    if (!studentId || !reason?.trim()) {
      return NextResponse.json({ error: 'Student ID and deletion reason are required.' }, { status: 400 });
    }

    const requesterName = session.user.name || 'Nimra M (Head Volunteer)';
    const requesterPhone = (session.user as any).phone || '9972533519';

    // Prevent duplicate pending requests for the same student
    const existingPending = await prisma.studentDeletionRequest.findFirst({
      where: {
        studentId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      return NextResponse.json({ error: 'A deletion request for this student is already pending Admin approval.' }, { status: 400 });
    }

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
      message: `Deletion request for ${studentName} forwarded to Admin Zaid Ahmed for authorization.`,
      deletionRequest,
    });
  } catch (error: any) {
    console.error('Deletion Request Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}