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

    // Enforce 4 Mandatory Documents (*)
    if (!body.marksCardUrl || String(body.marksCardUrl).trim() === '') {
      missingDocs.push('Previous Year Marks Card / Grade Sheet (*)');
    }
    if (!body.incomeCertUrl || String(body.incomeCertUrl).trim() === '') {
      missingDocs.push('Income Certificate / Salary Slip (*)');
    }
    if (!body.feeDemandUrl || String(body.feeDemandUrl).trim() === '') {
      missingDocs.push('College Fee Demand Note (*)');
    }
    if (!body.idProofUrl || String(body.idProofUrl).trim() === '') {
      missingDocs.push('Student Aadhar Card / ID Proof (*)');
    }

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: `Submission blocked: All mandatory documents marked with an asterisk must be uploaded.`,
          missingDocuments: missingDocs,
        },
        { status: 400 }
      );
    }

    // Validate Academic Information
    if (
      !body.collegeName ||
      !body.courseName ||
      !body.currentYearOfStudy ||
      !body.householdCategory ||
      !body.residentialAddress ||
      !body.personalStatement
    ) {
      return NextResponse.json(
        { error: 'All mandatory academic and address fields marked with (*) are required.' },
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
      message: 'Application and mandatory documents successfully registered.',
    });
  } catch (error: any) {
    console.error('Student Application Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}