import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let whereClause: any = {};
    if (userRole === 'STUDENT') {
      whereClause = { studentId: userId };
    } else if (userRole === 'VOLUNTEER') {
      whereClause = {
        OR: [
          { assignedVolunteerId: userId },
          { status: 'DOC_VERIFICATION' },
          { status: 'SUBMITTED' },
        ],
      };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: { select: { fullName: true, phone: true, email: true } },
        assignedVolunteer: { select: { fullName: true, phone: true } },
        verificationReport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to retrieve applications.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in as a student.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      collegeName,
      courseName,
      currentYearOfStudy,
      previousScoreMarks,
      annualTuitionFee,
      familyAnnualIncome,
      householdCategory,
      residentialAddress,
      personalStatement,
      docStudentAadhaar,
      docParentAadhaar,
      docIncomeCaste,
      docMarksCards,
      docFeeDemandNote,
      docDeathDivorceCert,
      docOther,
    } = body;

    // Sequential Reference ID: 4-digit series (HT/26-27/0001 up to HT/26-27/9999+)
    const totalCount = await prisma.application.count();
    const nextSequence = totalCount + 1;
    const referenceNumber = `HT/26-27/${String(nextSequence).padStart(4, '0')}`;

    const newApplication = await prisma.application.create({
      data: {
        referenceNumber,
        studentId: userId,
        collegeName: collegeName.trim(),
        courseName: courseName.trim(),
        currentYearOfStudy: currentYearOfStudy || '1st Year',
        previousScoreMarks: parseFloat(previousScoreMarks) || 0,
        annualTuitionFee: parseFloat(annualTuitionFee) || 0,
        familyAnnualIncome: parseFloat(familyAnnualIncome) || 0,
        householdCategory: householdCategory || 'General / EWS',
        residentialAddress: residentialAddress.trim(),
        personalStatement: personalStatement?.trim() || 'N/A',
        docStudentAadhaar: docStudentAadhaar || null,
        docParentAadhaar: docParentAadhaar || null,
        docIncomeCaste: docIncomeCaste || null,
        docMarksCards: docMarksCards || null,
        docFeeDemandNote: docFeeDemandNote || null,
        docDeathDivorceCert: docDeathDivorceCert || null,
        docOther: docOther || null,
        status: 'SUBMITTED',
      },
      include: {
        student: { select: { fullName: true, phone: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, application: newApplication }, { status: 201 });
  } catch (error: any) {
    console.error('Prisma Application Creation Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit application.' }, { status: 500 });
  }
}