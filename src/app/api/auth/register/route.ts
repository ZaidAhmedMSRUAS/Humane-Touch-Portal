import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateAndCleanPhone, validateEmail, sanitizeText } from '@/lib/validation';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, email, password } = body;

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

    const user = await prisma.user.create({
      data: {
        fullName: cleanedName,
        phone: phoneCheck.cleaned,
        email: emailCheck.cleaned,
        role: UserRole.STUDENT,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Student account registered successfully! You may now log in.',
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