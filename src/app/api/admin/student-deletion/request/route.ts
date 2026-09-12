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
    const requesterPhone = (session.user as any).phone || session.user.email;
    const requesterName = session.user.name || 'Head Volunteer Nimra M';

    // Allow Volunteers and Admins to initiate
    if (requesterRole !== UserRole.VOLUNTEER && requesterRole !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Only authorized volunteers can initiate deletion requests.' }, { status: 403 });
    }

    const { studentId, reason } = await req.json();

    if (!studentId || !reason?.trim()) {
      return NextResponse.json({ error: 'Student ID and Deletion Reason are required.' }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { applications: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // Check if an existing pending request already exists
    const existing = await prisma.studentDeletionRequest.findFirst({
      where: {
        studentId: student.id,
        status: 'PENDING',
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A deletion request for this student is already pending Admin approval.' }, { status: 400 });
    }

    const requestRecord = await prisma.studentDeletionRequest.create({
      data: {
        studentId: student.id,
        studentName: student.fullName,
        studentPhone: student.phone,
        requestedByPhone: requesterPhone,
        requestedByName: requesterName,
        reason: reason.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deletion request submitted for ${student.fullName}. Awaiting Admin Zaid's approval.`,
      requestRecord,
    });
  } catch (error: any) {
    console.error('Deletion Request Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit request' }, { status: 500 });
  }
}