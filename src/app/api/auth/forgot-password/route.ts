import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { identifier, newPassword, otpCode } = await req.json();

    if (!identifier || !newPassword) {
      return NextResponse.json({ error: 'Phone number and new password are required' }, { status: 400 });
    }

    const cleanPhone = String(identifier).replace(/\D/g, '').slice(-10);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: String(identifier).trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account registered with this phone/email' }, { status: 404 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(String(newPassword).trim(), 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${user.fullName}. You can now sign in.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: error.message || 'Password reset failed' }, { status: 500 });
  }
}