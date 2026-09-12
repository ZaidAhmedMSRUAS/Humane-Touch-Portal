import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 403 });
    }

    const volunteers = await prisma.user.findMany({
      where: { role: 'VOLUNTEER', isActive: true },
      select: { id: true, fullName: true, phone: true, email: true },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(volunteers);
  } catch (error: any) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers.' }, { status: 500 });
  }
}