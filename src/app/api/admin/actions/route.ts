import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const [applications, volunteers, users] = await Promise.all([
      prisma.application.findMany({
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
          assignedVolunteer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
          verificationReport: true,
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin authorization required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'APPROVE_STAFF_REGISTRATION') {
      const { targetUserId } = body;
      if (!targetUserId) return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
      const pendingUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, fullName: true, role: true, isActive: true } });
      if (!pendingUser || (pendingUser.role !== UserRole.VOLUNTEER && pendingUser.role !== UserRole.TRUSTEE)) {
        return NextResponse.json({ error: 'Only volunteer or trustee registrations can be approved here.' }, { status: 400 });
      }
      if (pendingUser.isActive) return NextResponse.json({ error: 'This account is already active.' }, { status: 409 });
      const approvedUser = await prisma.user.update({ where: { id: pendingUser.id }, data: { isActive: true } });
      return NextResponse.json({ success: true, message: `${approvedUser.fullName}'s ${approvedUser.role.toLowerCase()} account is approved and can now sign in.` });
    }

    // 1. UPDATE STUDENT APPLICATION DETAILS (Admin Edit Access)
    if (action === 'UPDATE_APPLICATION') {
      const {
        applicationId,
        collegeName,
        courseName,
        currentYearOfStudy,
        previousScoreMarks,
        familyAnnualIncome,
        annualTuitionFee,
        householdCategory,
        residentialAddress,
        personalStatement,
        chequeInFavourOf,
      } = body;

      if (!applicationId) {
        return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
      }

      const updated = await prisma.application.update({
        where: { id: String(applicationId) },
        data: {
          ...(collegeName !== undefined && { collegeName: collegeName.trim() }),
          ...(courseName !== undefined && { courseName: courseName.trim() }),
          ...(currentYearOfStudy !== undefined && { currentYearOfStudy: currentYearOfStudy.trim() }),
          ...(previousScoreMarks !== undefined && { previousScoreMarks: Number(previousScoreMarks) }),
          ...(familyAnnualIncome !== undefined && { familyAnnualIncome: Number(familyAnnualIncome) }),
          ...(annualTuitionFee !== undefined && { annualTuitionFee: Number(annualTuitionFee) }),
          ...(householdCategory !== undefined && { householdCategory: householdCategory.trim() }),
          ...(residentialAddress !== undefined && { residentialAddress: residentialAddress?.trim() || null }),
          ...(personalStatement !== undefined && { personalStatement: personalStatement?.trim() || null }),
          ...(chequeInFavourOf !== undefined && { chequeInFavourOf: chequeInFavourOf?.trim() || null }),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Application updated successfully.',
        application: updated,
      });
    }

    // 2. ASSIGN VOLUNTEER
    if (action === 'ASSIGN_VOLUNTEER') {
      const { applicationId, volunteerId } = body;
      if (!applicationId || !volunteerId) return NextResponse.json({ error: 'Select an application and volunteer.' }, { status: 400 });
      const current = await prisma.application.findUnique({ where: { id: applicationId } });
      const volunteer = await prisma.user.findFirst({ where: { id: volunteerId, role: UserRole.VOLUNTEER, isActive: true } });
      if (!current || !volunteer) return NextResponse.json({ error: 'Application or active volunteer not found.' }, { status: 404 });
      if (current.assignedVolunteerId && current.assignedVolunteerId !== volunteerId) return NextResponse.json({ error: 'This application is already assigned to another volunteer.' }, { status: 409 });
      if (current.status !== 'SUBMITTED' && current.assignedVolunteerId !== volunteerId) return NextResponse.json({ error: 'Assignment is locked after verification begins.' }, { status: 409 });
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          assignedVolunteerId: volunteerId,
          status: 'DOC_VERIFICATION',
        },
      });
      return NextResponse.json({ success: true, application: updated });
    }

    // 3. UPDATE CHEQUE DETAILS
    if (action === 'UPDATE_CHEQUE') {
      const { applicationId, chequeNumber, chequeInFavourOf, sanctionedAmount } = body;
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          ...(chequeNumber !== undefined && { chequeNumber: chequeNumber.trim() }),
          ...(chequeInFavourOf !== undefined && { chequeInFavourOf: chequeInFavourOf.trim() }),
          ...(sanctionedAmount !== undefined && { sanctionedAmount: Number(sanctionedAmount) }),
        },
      });
      return NextResponse.json({ success: true, application: updated });
    }

    if (action === 'FINALIZE_APPLICATION') {
      const { applicationId, decision } = body;
      if (!applicationId || !['APPROVED', 'REJECTED'].includes(decision)) return NextResponse.json({ error: 'Choose an approval or rejection decision.' }, { status: 400 });
      const application = await prisma.application.findFirst({ where: { id: applicationId, status: 'ADMIN_FINALIZATION' } });
      if (!application) return NextResponse.json({ error: 'This application is not awaiting admin finalization.' }, { status: 409 });
      if (decision === 'APPROVED' && (!application.sanctionedAmount || application.sanctionedAmount <= 0)) return NextResponse.json({ error: 'A positive trustee sanctioned amount is required before approval.' }, { status: 400 });
      const updated = await prisma.application.update({ where: { id: applicationId }, data: { status: decision } });
      return NextResponse.json({ success: true, application: updated });
    }

    // 4. RESET PASSWORD
    if (action === 'RESET_PASSWORD') {
      const { targetUserId, newPassword } = body;
      if (!targetUserId || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: targetUserId },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
