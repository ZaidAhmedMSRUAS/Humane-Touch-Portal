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
      return NextResponse.json(
        { error: 'Session expired or not logged in. Please log in as a student to apply.' },
        { status: 401 }
      );
    }

    let userId = (session.user as any).id;
    if (!userId) {
      const email = session.user.email;
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(session.user.name ? [{ fullName: session.user.name }] : []),
          ],
        },
      });
      if (dbUser) userId = dbUser.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Could not resolve student account. Please log out and log in again.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const missingDocs: string[] = [];
    const isValidDoc = (val: any) =>
      val && typeof val === 'string' && val.trim() !== '' && val.trim() !== 'null' && val.trim() !== 'undefined';

    if (!isValidDoc(body.sslcMarksCardUrl)) missingDocs.push('SSLC (10th) Marks Card (*)');
    if (!isValidDoc(body.pucMarksCardUrl)) missingDocs.push('PUC / 12th Marks Card (*)');
    if (!isValidDoc(body.marksCardUrl)) missingDocs.push('Previous Year Marks Card (*)');
    if (!isValidDoc(body.incomeCertUrl)) missingDocs.push('Income Certificate / Salary Slip (*)');
    if (!isValidDoc(body.feeDemandUrl)) missingDocs.push('College Fee Demand Note (*)');
    if (!isValidDoc(body.idProofUrl)) missingDocs.push('Student Aadhar Card / ID Proof (*)');

    if (missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: `Missing mandatory documents: ${missingDocs.join(', ')}`,
          missingDocuments: missingDocs,
        },
        { status: 400 }
      );
    }

    const marksNum = Number(body.previousScoreMarks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      return NextResponse.json(
        { error: 'Previous Academic Marks must be between 0% and 100%.' },
        { status: 400 }
      );
    }

    if (
      !body.collegeName ||
      !body.courseName ||
      !body.currentYearOfStudy ||
      !body.householdCategory ||
      !body.residentialAddress ||
      !body.personalStatement
    ) {
      return NextResponse.json(
        { error: 'All mandatory text fields marked with (*) are required.' },
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
        sslcMarksCardUrl: body.sslcMarksCardUrl.trim(),
        pucMarksCardUrl: body.pucMarksCardUrl.trim(),
        marksCardUrl: body.marksCardUrl.trim(),
        incomeCertUrl: body.incomeCertUrl.trim(),
        feeDemandUrl: body.feeDemandUrl.trim(),
        idProofUrl: body.idProofUrl.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      referenceNumber: refNumber,
      applicationId: application.id,
      message: 'Application registered successfully.',
    });
  } catch (error: any) {
    console.error('API Application Submission Error:', error);
    return NextResponse.json(
      { error: error.message || 'Database error occurred while creating application.' },
      { status: 500 }
    );
  }
}
