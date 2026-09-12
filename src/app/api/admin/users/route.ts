import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET: List all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

// POST: Admin directly overrides/updates a user's password or details
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin credentials required.' }, { status: 403 });
    }

    const { userId, newPassword, fullName, email, phone, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    let updateData: any = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (phone) updateData.phone = phone.trim();
    if (role) updateData.role = role;

    if (newPassword && newPassword.trim()) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Profile & credentials updated successfully for ${updatedUser.fullName}.`,
    });
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update user profile.' }, { status: 500 });
  }
}