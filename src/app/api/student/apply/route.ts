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

    // Mandatory Question Checks
    if (!body.collegeName || String(body.collegeName).trim() === '') missing.push('College / Institution Name');
    if (!body.courseName || String(body.courseName).trim() === '') missing.push('Course / Degree Name');
    if (!body.currentYearOfStudy || String(body.currentYearOfStudy).trim() === '') missing.push('Current Year of Study');
    if (!body.householdCategory || String(body.householdCategory).trim() === '') missing.push('Household Category');
    if (!body.residentialAddress || String(body.residentialAddress).trim() === '') missing.push('Residential Address');
    if (!body.personalStatement || String(body.personalStatement).trim() === '') missing.push('Personal Statement');
    if (!body.previousScoreMarks) missing.push('Previous Academic Marks');
    if (!body.familyAnnualIncome) missing.push('Family Annual Income');
    if (!body.annualTuitionFee) missing.push('Annual College Tuition Fee');

    // Mandatory Document Upload Checks
    if (!body.marksCardUrl || String(body.marksCardUrl).trim() === '') {
      missing.push('Previous Year Marks Card / Grade Sheet (*) document');
    }
    if (!body.incomeCertUrl || String(body.incomeCertUrl).trim() === '') {
      missing.push('Income Certificate / Salary Slip (*) document');
    }
    if (!body.feeDemandUrl || String(body.feeDemandUrl).trim() === '') {
      missing.push('College Fee Demand Note (*) document');
    }
    if (!body.idProofUrl || String(body.idProofUrl).trim() === '') {
      missing.push('Student Aadhar Card / ID Proof (*) document');
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Submission rejected: Missing ${missing.length} mandatory requirement(s).`,
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