import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, email, password } = body;

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'Full Name, Mobile Number, and Password are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanName = String(fullName).trim();

    // Check if phone or email already registered
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this mobile number or email already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // Hash password and create student user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Student account created successfully.',
      user: { id: user.id, fullName: user.fullName, phone: user.phone },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register student.' },
      { status: 500 }
    );
  }
}
