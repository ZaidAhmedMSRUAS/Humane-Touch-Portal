import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, email, password } = body;

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: 'Full name, phone number, and password are required.' },
        { status: 400 }
      );
    }

    // Check if phone or email already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phone.trim() },
          ...(email ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this phone number or email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim() || `${phone.trim()}@student.humanetouch.org`,
        passwordHash,
        role: 'STUDENT',
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: newUser.id, fullName: newUser.fullName, phone: newUser.phone },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating account.' },
      { status: 500 }
    );
  }
}