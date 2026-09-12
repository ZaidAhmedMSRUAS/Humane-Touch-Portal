import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requesterRole = (session.user as any).role;
    if (requesterRole !== UserRole.VOLUNTEER && requesterRole !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Access restricted to volunteers' }, { status: 403 });
    }

    const requests = await prisma.studentDeletionRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch requests' }, { status: 500 });
  }
}