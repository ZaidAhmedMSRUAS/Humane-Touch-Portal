import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OtpType } from '@prisma/client';
import { sendEmailOtp, sendMobileOtp } from '@/lib/otpService';

export async function POST(req: Request) {
  try {
    const { identifier, type } = await req.json();

    if (!identifier || !type) {
      return NextResponse.json({ error: 'Phone/Email and verification type are required.' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { identifier: cleanIdentifier, type: type as OtpType },
    });

    await prisma.otpVerification.create({
      data: {
        identifier: cleanIdentifier,
        code: otpCode,
        type: type as OtpType,
        expiresAt,
      },
    });

    const purposeText =
      type === 'FORGOT_PASSWORD'
        ? 'Password Reset'
        : type === 'EMAIL_VERIFY'
        ? 'Email Verification'
        : 'Mobile Verification';

    if (isEmail) {
      await sendEmailOtp(cleanIdentifier, otpCode, purposeText);
    } else {
      await sendMobileOtp(cleanIdentifier, otpCode);
    }

    return NextResponse.json({
      success: true,
      message: `OTP dispatched to ${cleanIdentifier}`,
    });
  } catch (err: any) {
    console.error('OTP Send error:', err);
    return NextResponse.json({ error: 'Failed to dispatch OTP code.' }, { status: 500 });
  }
}