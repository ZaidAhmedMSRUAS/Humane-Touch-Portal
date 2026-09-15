import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const requests = await prisma.studentDeletionRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const { requestId, action, adminRemarks } = await req.json();

    const requestRecord = await prisma.studentDeletionRequest.findUnique({
      where: { id: requestId },
    });

    if (!requestRecord || requestRecord.status !== 'PENDING') {
      return NextResponse.json({ error: 'Pending request not found.' }, { status: 404 });
    }

    const adminName = session.user?.name || 'Zaid Ahmed (Admin)';

    if (action === 'APPROVE') {
      const studentApps = await prisma.application.findMany({
        where: { studentId: requestRecord.studentId },
        select: { id: true },
      });
      const appIds = studentApps.map((a) => a.id);

      if (appIds.length > 0) {
        await prisma.verificationReport.deleteMany({
          where: { applicationId: { in: appIds } },
        });

        await prisma.application.deleteMany({
          where: { id: { in: appIds } },
        });
      }

      await prisma.user.deleteMany({
        where: { id: requestRecord.studentId },
      });

      await prisma.studentDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminRemarks: adminRemarks || 'Approved by Admin Zaid Ahmed and purged from database.',
          resolvedAt: new Date(),
          resolvedBy: adminName,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Student ${requestRecord.studentName} has been permanently deleted from the database.`,
      });
    } else {
      await prisma.studentDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminRemarks: adminRemarks || 'Rejected by Admin Zaid Ahmed.',
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

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const result = await prisma.studentDeletionRequest.deleteMany({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} resolved deletion record(s).`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to clear history' }, { status: 500 });
  }
}