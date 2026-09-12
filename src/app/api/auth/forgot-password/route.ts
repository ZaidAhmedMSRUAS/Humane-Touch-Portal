import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { phone, code, newPassword } = await req.json();

    if (!phone || !code || !newPassword) {
      return NextResponse.json({ error: 'Phone number, OTP code, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const validOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: phone.trim(),
        code: code.trim(),
        type: 'FORGOT_PASSWORD',
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      return NextResponse.json({ error: 'Invalid or expired reset OTP code.' }, { status: 400 });
    }

    // Clear the OTP
    await prisma.otpVerification.delete({ where: { id: validOtp.id } });

    // Update password across any active roles for this phone number
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.user.updateMany({
      where: { phone: phone.trim() },
      data: { passwordHash },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'No user account found associated with this mobile number.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}