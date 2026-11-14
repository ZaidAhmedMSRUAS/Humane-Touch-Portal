import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OtpType } from '@prisma/client';
import { sendEmailOtp, sendMobileOtp } from '@/lib/otpService';
import { randomInt } from 'crypto';

export async function POST(req: Request) {
  try {
    const { identifier, type } = await req.json();

    if (!identifier || !type || !['PHONE_VERIFY', 'EMAIL_VERIFY', 'FORGOT_PASSWORD'].includes(type)) {
      return NextResponse.json({ error: 'Phone/Email and verification type are required.' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');
    if ((type === 'EMAIL_VERIFY' && !isEmail) || (type === 'PHONE_VERIFY' && isEmail)) {
      return NextResponse.json({ error: 'Identifier does not match the requested verification type.' }, { status: 400 });
    }
    const otpCode = randomInt(100000, 1000000).toString();
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

    const delivered = isEmail
      ? await sendEmailOtp(cleanIdentifier, otpCode, purposeText)
      : await sendMobileOtp(cleanIdentifier, otpCode);
    if (!delivered) {
      await prisma.otpVerification.deleteMany({ where: { identifier: cleanIdentifier, type: type as OtpType } });
      return NextResponse.json({ error: isEmail ? 'Email delivery is not configured. Please contact support.' : 'SMS delivery is not configured. Please contact support.' }, { status: 503 });
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
