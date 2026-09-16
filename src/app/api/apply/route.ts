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

    if (!body.collegeName || !body.courseName || !body.currentYearOfStudy || !body.householdCategory) {
      return NextResponse.json({ error: 'All asterisk (*) questions must be filled.' }, { status: 400 });
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
    console.error('Student Application Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}