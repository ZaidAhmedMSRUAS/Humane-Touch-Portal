import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OtpType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { identifier, code, type } = await req.json();

    if (!identifier || !code || !type) {
      return NextResponse.json({ error: 'Identifier, code, and verification type are required.' }, { status: 400 });
    }

    const record = await prisma.otpVerification.findFirst({
      where: {
        identifier: identifier.trim(),
        code: code.trim(),
        type: type as OtpType,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired OTP verification code.' }, { status: 400 });
    }

    // Delete used OTP
    await prisma.otpVerification.delete({ where: { id: record.id } });

    // Update user record if verifying an existing profile
    if (type === 'PHONE_VERIFY') {
      await prisma.user.updateMany({
        where: { phone: identifier.trim() },
        data: { isPhoneVerified: true },
      });
    } else if (type === 'EMAIL_VERIFY') {
      await prisma.user.updateMany({
        where: { email: identifier.trim() },
        data: { isEmailVerified: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Verification successful.' });
  } catch (err: any) {
    console.error('OTP verify error:', err);
    return NextResponse.json({ error: 'Failed to verify code.' }, { status: 500 });
  }
}