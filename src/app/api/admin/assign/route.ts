import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 403 });
    }

    const { applicationId, volunteerId } = await req.json();

    if (!applicationId || !volunteerId) {
      return NextResponse.json({ error: 'Application ID and Volunteer ID are required.' }, { status: 400 });
    }

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        assignedVolunteerId: volunteerId,
        status: ApplicationStatus.DOC_VERIFICATION,
      },
      include: {
        assignedVolunteer: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Allocated to ${updatedApp.assignedVolunteer?.fullName}`,
      application: updatedApp,
    });
  } catch (error: any) {
    console.error('Prisma Allocation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to allocate volunteer.' },
      { status: 500 }
    );
  }
}