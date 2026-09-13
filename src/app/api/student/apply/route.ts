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

    const missing: string[] = [];

    // 1. Mandatory Question Checks
    if (!body.collegeName?.trim()) missing.push('College / Institution Name');
    if (!body.courseName?.trim()) missing.push('Course / Degree Name');
    if (!body.currentYearOfStudy?.trim()) missing.push('Current Year of Study');
    if (!body.householdCategory?.trim()) missing.push('Household Category');
    if (!body.previousScoreMarks) missing.push('Previous Academic Score Marks');
    if (!body.familyAnnualIncome) missing.push('Family Annual Income');
    if (!body.annualTuitionFee) missing.push('Annual College Tuition Fee');

    // 2. Mandatory Cloudinary Document Checks
    if (!body.marksCardUrl?.trim()) missing.push('Previous Year Marks Card (*) document');
    if (!body.incomeCertUrl?.trim()) missing.push('Income Certificate / Slip (*) document');
    if (!body.feeDemandUrl?.trim()) missing.push('College Fee Demand Note (*) document');
    if (!body.idProofUrl?.trim()) missing.push('Student Aadhar Card / ID Proof (*) document');

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Missing mandatory questions or documents: ${missing.join(', ')}`,
          missingFields: missing,
        },
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
      message: 'Application and documents successfully registered.',
    });
  } catch (error: any) {
    console.error('Student Application Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}