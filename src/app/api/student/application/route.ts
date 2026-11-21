import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApplicationRefNumber } from '@/lib/refGenerator';
import { sanitizeAmount, sanitizeMarks, sanitizeText } from '@/lib/validation';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { academicYearForReference, getCurrentAcademicYear } from '@/lib/academicYear';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    const userId = (session.user as any).id;
    const application = await prisma.application.findFirst({
      where: { studentId: userId },
      include: {
        student: { select: { id: true, fullName: true, phone: true, email: true } },
        assignedVolunteer: { select: { fullName: true } },
        verificationReport: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not load application.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please log in as a student to apply.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const academicYear = getCurrentAcademicYear();

    if (body.applicationType !== ApplicationType.FRESH && body.applicationType !== ApplicationType.RENEWAL) {
      return NextResponse.json({ error: 'Select Fresh or Renewal as the application type.' }, { status: 400 });
    }

    const existingApplication = await prisma.application.findFirst({ where: { studentId: userId, academicYear } });
    if (existingApplication) {
      return NextResponse.json({ error: `You already have an application for ${academicYear}. Track it from your dashboard.`, applicationId: existingApplication.id }, { status: 409 });
    }

    const missingDocs: string[] = [];

    // HARD GUARD: Verify all 4 required files exist and are not empty
    const checkDoc = (val: any) => val && String(val).trim() !== '' && String(val).trim() !== 'null' && String(val).trim() !== 'undefined';

    if (!checkDoc(body.marksCardUrl)) missingDocs.push('Previous Year Marks Card / Grade Sheet (*)');
    if (!checkDoc(body.incomeCertUrl)) missingDocs.push('Income Certificate / Salary Slip (*)');
    if (!checkDoc(body.feeDemandUrl)) missingDocs.push('College Fee Demand Note (*)');
    if (!checkDoc(body.idProofUrl)) missingDocs.push('Student Aadhar Card / ID Proof (*)');

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: `SUBMISSION REJECTED: All 4 mandatory documents marked with (*) must be uploaded. Missing: ${missingDocs.join(', ')}`,
          missingDocuments: missingDocs,
        },
        { status: 400 }
      );
    }

    if (!body.collegeName || !body.courseName || !body.currentYearOfStudy || !body.householdCategory || !body.parentName?.trim()) {
      return NextResponse.json({ error: 'All asterisk (*) questions must be filled.' }, { status: 400 });
    }

    const aadhaarNumber = String(body.aadhaarNumber || '').replace(/\s/g, '');
    if (!/^\d{12}$/.test(aadhaarNumber)) return NextResponse.json({ error: 'Aadhaar number must contain 12 digits.' }, { status: 400 });

    const refNumber = await generateApplicationRefNumber(body.courseName, academicYearForReference(academicYear));

    const application = await prisma.application.create({
      data: {
        student: { connect: { id: userId } },
        referenceNumber: refNumber,
        academicYear,
        applicationType: body.applicationType,
        collegeName: sanitizeText(body.collegeName),
        courseName: sanitizeText(body.courseName),
        currentYearOfStudy: sanitizeText(body.currentYearOfStudy),
        residentialAddress: sanitizeText(body.residentialAddress, 500),
        personalStatement: sanitizeText(body.personalStatement, 2000),
        aadhaarNumber,
        parentName: sanitizeText(body.parentName, 100),
        previousScoreMarks: sanitizeMarks(body.previousScoreMarks),
        familyAnnualIncome: sanitizeAmount(body.familyAnnualIncome),
        annualTuitionFee: sanitizeAmount(body.annualTuitionFee),
        householdCategory: sanitizeText(body.householdCategory),
        sslcMarksCardUrl: body.sslcMarksCardUrl,
        pucMarksCardUrl: body.pucMarksCardUrl,
        marksCardUrl: body.marksCardUrl,
        incomeCertUrl: body.incomeCertUrl,
        feeDemandUrl: body.feeDemandUrl,
        idProofUrl: body.idProofUrl,
        status: ApplicationStatus.SUBMITTED,
      },
    });

    return NextResponse.json({
      success: true,
      referenceNumber: refNumber,
      applicationId: application.id,
      message: 'Application registered successfully.',
    });
  } catch (error: any) {
    console.error('Student Application Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}
