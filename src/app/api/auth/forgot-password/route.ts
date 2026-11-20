import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { validateAndCleanPhone } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const { identifier, newPassword, otpCode, role } = await req.json();

    if (typeof identifier !== 'string' || typeof newPassword !== 'string' || typeof otpCode !== 'string') {
      return NextResponse.json({ error: 'Phone number, OTP, and new password are required.' }, { status: 400 });
    }

    const allowedRoles: UserRole[] = [UserRole.STUDENT, UserRole.VOLUNTEER, UserRole.TRUSTEE];
    if (!allowedRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Choose Student, Volunteer, or Trustee.' }, { status: 400 });
    }

    const phoneCheck = validateAndCleanPhone(identifier);
    if (!phoneCheck.isValid) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json({ error: 'Enter the six-digit verification code.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const otpIdentifier = `${role}:${phoneCheck.cleaned}`;

    await prisma.$transaction(async (tx) => {
      const now = new Date();
      const user = await tx.user.findFirst({
        where: { phone: phoneCheck.cleaned, role: role as UserRole },
        select: { id: true },
      });
      const otp = await tx.otpVerification.findFirst({
        where: {
          identifier: otpIdentifier,
          code: otpCode,
          type: 'FORGOT_PASSWORD',
          expiresAt: { gt: now },
        },
        select: { id: true },
      });

      if (!user || !otp) {
        throw new Error('Invalid or expired verification code.');
      }

      const consumed = await tx.otpVerification.deleteMany({
        where: { id: otp.id, expiresAt: { gt: now } },
      });
      if (consumed.count !== 1) {
        throw new Error('Invalid or expired verification code.');
      }

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Invalid or expired verification code.') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Password reset failed. Please try again.' }, { status: 500 });
  }
}