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
        where: { role: UserRole.VOLUNTEER },
        select: { id: true, fullName: true, phone: true },
        orderBy: { fullName: 'asc' },
      }),
      prisma.user.findMany({
        select: { id: true, fullName: true, phone: true, role: true },
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
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          assignedVolunteerId: volunteerId || null,
        },
      });
      return NextResponse.json({ success: true, application: updated });
    }

    // 3. UPDATE CHEQUE DETAILS
    if (action === 'UPDATE_CHEQUE') {
      const { applicationId, chequeNumber, chequeInFavourOf, sanctionedAmount, status } = body;
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: {
          ...(chequeNumber !== undefined && { chequeNumber: chequeNumber.trim() }),
          ...(chequeInFavourOf !== undefined && { chequeInFavourOf: chequeInFavourOf.trim() }),
          ...(sanctionedAmount !== undefined && { sanctionedAmount: Number(sanctionedAmount) }),
          ...(status && { status }),
        },
      });
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
        data: { password: hashedPassword },
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action provided.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}