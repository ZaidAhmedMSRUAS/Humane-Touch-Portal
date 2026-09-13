import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// GET: Fetch Applications, Volunteers, and Users for Admin Dashboard
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const [applications, volunteers, users] = await Promise.all([
      prisma.application.findMany({
        include: {
          student: { select: { id: true, fullName: true, phone: true, email: true } },
          assignedVolunteer: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        where: { role: UserRole.VOLUNTEER, isActive: true },
        select: { id: true, fullName: true, phone: true },
        orderBy: { fullName: 'asc' },
      }),
      prisma.user.findMany({
        select: { id: true, fullName: true, phone: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { role: 'asc' },
      }),
    ]);

    return NextResponse.json({ success: true, applications, volunteers, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin data' }, { status: 500 });
  }
}

// POST: Execute Admin Actions (Cheque Entry, Volunteer Assignment, Password Reset)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. ASSIGN VOLUNTEER TO APPLICATION
    if (action === 'ASSIGN_VOLUNTEER') {
      const { applicationId, volunteerId } = body;
      if (!applicationId) return NextResponse.json({ error: 'Application ID required' }, { status: 400 });

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          assignedVolunteerId: volunteerId || null,
          status: volunteerId ? ApplicationStatus.DOC_VERIFICATION : undefined,
        },
      });

      return NextResponse.json({ success: true, message: 'Volunteer assignment updated successfully', updated });
    }

    // 2. ENTER / UPDATE CHEQUE & DISBURSAL DETAILS
    if (action === 'UPDATE_CHEQUE') {
      const { applicationId, chequeNumber, chequeInFavourOf, sanctionedAmount, status } = body;
      if (!applicationId) return NextResponse.json({ error: 'Application ID required' }, { status: 400 });

      const updateData: any = {};
      if (chequeNumber !== undefined) updateData.chequeNumber = String(chequeNumber).trim();
      if (chequeInFavourOf !== undefined) updateData.chequeInFavourOf = String(chequeInFavourOf).trim();
      if (sanctionedAmount !== undefined) updateData.sanctionedAmount = Number(sanctionedAmount);
      if (status) updateData.status = status;

      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: 'Cheque and disbursal details recorded', updated });
    }

    // 3. ADMIN RESET PASSWORD FOR ANY USER
    if (action === 'RESET_PASSWORD') {
      const { targetUserId, newPassword } = body;
      if (!targetUserId || !newPassword || String(newPassword).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(String(newPassword).trim(), 10);
      await prisma.user.update({
        where: { id: targetUserId },
        data: { passwordHash },
      });

      return NextResponse.json({ success: true, message: 'User password reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}