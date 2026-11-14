import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateAndCleanPhone, validateEmail, sanitizeText } from '@/lib/validation';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, email, password, otpCode } = body;
    const requestedRole = String(body.role || UserRole.STUDENT).toUpperCase();
    const registrationRoles: UserRole[] = [UserRole.STUDENT, UserRole.VOLUNTEER, UserRole.TRUSTEE];
    if (!registrationRoles.includes(requestedRole as UserRole)) {
      return NextResponse.json({ error: 'Choose Student, Volunteer, or Trustee registration.' }, { status: 400 });
    }
    const role = requestedRole as UserRole;
    const requiresApproval = role === UserRole.VOLUNTEER || role === UserRole.TRUSTEE;

    const cleanedName = sanitizeText(fullName, 100);
    if (!cleanedName || cleanedName.length < 3) {
      return NextResponse.json(
        { error: 'Full Name must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    const phoneCheck = validateAndCleanPhone(phone);
    if (!phoneCheck.isValid) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(String(otpCode || ''))) return NextResponse.json({ error: 'Enter the six digit email OTP.' }, { status: 400 });
    const otp = await prisma.otpVerification.findFirst({ where: { identifier: emailCheck.cleaned, code: String(otpCode), type: 'EMAIL_VERIFY', expiresAt: { gt: new Date() } } });
    if (!otp) return NextResponse.json({ error: 'Email OTP is invalid or expired. Request a new code.' }, { status: 400 });

    const existingPhone = await prisma.user.findFirst({
      where: { phone: phoneCheck.cleaned },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: `Mobile number ${phoneCheck.cleaned} is already registered. Please log in instead.` },
        { status: 409 }
      );
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: emailCheck.cleaned },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: `Email address ${emailCheck.cleaned} is already registered. Please log in instead.` },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const matchedOtp = await tx.otpVerification.findFirst({ where: { id: otp.id, expiresAt: { gt: new Date() } } });
      if (!matchedOtp) throw new Error('Email OTP is invalid or expired. Request a new code.');
      const created = await tx.user.create({ data: { fullName: cleanedName, phone: phoneCheck.cleaned, email: emailCheck.cleaned, role, passwordHash: hashedPassword, isEmailVerified: true, isActive: !requiresApproval } });
      await tx.otpVerification.delete({ where: { id: otp.id } });
      return created;
    });

    return NextResponse.json({
      success: true,
      message: requiresApproval
        ? `${role === UserRole.VOLUNTEER ? 'Volunteer' : 'Trustee'} registration received. An admin must approve your account before you can sign in.`
        : 'Student account registered successfully! You may now log in.',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
