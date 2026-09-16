import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApplicationRefNumber } from '@/lib/refGenerator';
import { sanitizeAmount, sanitizeMarks, sanitizeText } from '@/lib/validation';
import { ApplicationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please log in as a student to apply.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    // 1. Mandatory Document Gating
    const missingDocs: string[] = [];
    const isValidDoc = (val: any) =>
      val && typeof val === 'string' && val.trim() !== '' && val.trim() !== 'null' && val.trim() !== 'undefined';

    if (!isValidDoc(body.marksCardUrl)) missingDocs.push('Previous Year Marks Card / Grade Sheet (*)');
    if (!isValidDoc(body.incomeCertUrl)) missingDocs.push('Income Certificate / Salary Slip (*)');
    if (!isValidDoc(body.feeDemandUrl)) missingDocs.push('College Fee Demand Note (*)');
    if (!isValidDoc(body.idProofUrl)) missingDocs.push('Student Aadhar Card / ID Proof (*)');

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: `SUBMISSION REJECTED: All 4 mandatory documents marked with (*) must be uploaded before registration.`,
          missingDocuments: missingDocs,
        },
        { status: 400 }
      );
    }

    // 2. Strict Academic Marks Constraint (Cannot exceed 100)
    const marksNum = Number(body.previousScoreMarks);
    if (isNaN(marksNum)) {
      return NextResponse.json(
        { error: 'Previous Academic Marks must be a valid number.' },
        { status: 400 }
      );
    }
    if (marksNum > 100) {
      return NextResponse.json(
        { error: `Previous Academic Marks cannot be greater than 100%. You entered: ${marksNum}%.` },
        { status: 400 }
      );
    }
    if (marksNum < 0) {
      return NextResponse.json(
        { error: 'Previous Academic Marks cannot be negative.' },
        { status: 400 }
      );
    }

    // 3. Validate Academic Fields
    if (!body.collegeName || !body.courseName || !body.currentYearOfStudy || !body.householdCategory) {
      return NextResponse.json(
        { error: 'All mandatory fields marked with (*) are required.' },
        { status: 400 }
      );
    }

    const refNumber = await generateApplicationRefNumber(body.courseName);

    const application = await prisma.application.create({
      data: {
        student: { connect: { id: userId } },
        referenceNumber: refNumber,
        collegeName: sanitizeText(body.collegeName),
        courseName: sanitizeText(body.courseName),
        currentYearOfStudy: sanitizeText(body.currentYearOfStudy),
        residentialAddress: sanitizeText(body.residentialAddress, 500),
        personalStatement: sanitizeText(body.personalStatement, 2000),
        previousScoreMarks: sanitizeMarks(body.previousScoreMarks),
        familyAnnualIncome: sanitizeAmount(body.familyAnnualIncome),
        annualTuitionFee: sanitizeAmount(body.annualTuitionFee),
        householdCategory: sanitizeText(body.householdCategory),
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
    console.error('Application Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}