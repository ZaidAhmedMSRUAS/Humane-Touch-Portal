import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// 1. GET ALL PENDING REQUESTS (For Admin Review)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const requests = await prisma.studentDeletionRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. APPROVE OR REJECT DELETION (Admin Action)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin approval required.' }, { status: 403 });
    }

    const { requestId, action, adminRemarks } = await req.json(); // action: 'APPROVE' | 'REJECT'

    const requestRecord = await prisma.studentDeletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!requestRecord || requestRecord.status !== 'PENDING') {
      return NextResponse.json({ error: 'Valid pending request not found.' }, { status: 404 });
    }

    const adminName = session.user?.name || 'Zaid Ahmed (Admin)';

    if (action === 'APPROVE') {
      // 1. Delete all applications related to this student
      await prisma.scholarshipApplication.deleteMany({
        where: { studentId: requestRecord.studentId },
      });

      // 2. Delete student account from Users
      await prisma.user.deleteMany({
        where: { id: requestRecord.studentId },
      });

      // 3. Mark request as APPROVED
      await prisma.studentDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminRemarks: adminRemarks || 'Approved and student purged from database.',
          resolvedAt: new Date(),
          resolvedBy: adminName,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Student ${requestRecord.studentName} has been permanently deleted with Admin approval.`,
      });
    } else {
      // REJECT ACTION
      await prisma.studentDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminRemarks: adminRemarks || 'Rejected by Admin.',
          resolvedAt: new Date(),
          resolvedBy: adminName,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Deletion request for ${requestRecord.studentName} was rejected.`,
      });
    }
  } catch (error: any) {
    console.error('Admin Deletion Action Error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}