import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OtpType, UserRole } from '@prisma/client';
import { sendEmailOtp, sendMobileOtp } from '@/lib/otpService';
import { randomInt } from 'crypto';
import { validateAndCleanPhone } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const { identifier, type, role } = await req.json();

    if (!identifier || !type || !['PHONE_VERIFY', 'EMAIL_VERIFY', 'FORGOT_PASSWORD'].includes(type)) {
      return NextResponse.json({ error: 'Phone/Email and verification type are required.' }, { status: 400 });
    }

    if (typeof identifier !== 'string') {
      return NextResponse.json({ error: 'A valid phone number or email address is required.' }, { status: 400 });
    }

    let cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');
    if ((type === 'EMAIL_VERIFY' && !isEmail) || (type === 'PHONE_VERIFY' && isEmail)) {
      return NextResponse.json({ error: 'Identifier does not match the requested verification type.' }, { status: 400 });
    }

    let otpIdentifier = cleanIdentifier;
    let otpRole: UserRole | undefined;
    if (type === 'FORGOT_PASSWORD') {
      const allowedRoles: UserRole[] = [UserRole.STUDENT, UserRole.VOLUNTEER, UserRole.TRUSTEE];
      if (!allowedRoles.includes(role as UserRole)) {
        return NextResponse.json({ error: 'Choose Student, Volunteer, or Trustee.' }, { status: 400 });
      }

      const phoneCheck = validateAndCleanPhone(cleanIdentifier);
      if (!phoneCheck.isValid) {
        return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
      }

      cleanIdentifier = phoneCheck.cleaned;
      otpRole = role as UserRole;
      otpIdentifier = `${otpRole}:${cleanIdentifier}`;

      const user = await prisma.user.findFirst({
        where: { phone: cleanIdentifier, role: otpRole },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({
          success: true,
          message: 'If an account matches those details, a verification code has been sent.',
        });
      }
    }

    const otpCode = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpVerification.deleteMany({
      where: { identifier: otpIdentifier, type: type as OtpType },
    });

    await prisma.otpVerification.create({
      data: {
        identifier: otpIdentifier,
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
      await prisma.otpVerification.deleteMany({ where: { identifier: otpIdentifier, type: type as OtpType } });
      return NextResponse.json({ error: isEmail ? 'Email delivery is not configured. Please contact support.' : 'SMS delivery is not configured. Please contact support.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: otpRole
        ? 'If an account matches those details, a verification code has been sent.'
        : `OTP dispatched to ${cleanIdentifier}`,
    });
  } catch (err: any) {
    console.error('OTP Send error:', err);
    return NextResponse.json({ error: 'Failed to dispatch OTP code.' }, { status: 500 });
  }
}
