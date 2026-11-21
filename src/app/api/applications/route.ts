import bcrypt from 'bcryptjs';
﻿import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApplicationRefNumber } from '@/lib/refGenerator';
import { sanitizeAmount, sanitizeMarks, sanitizeText } from '@/lib/validation';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { academicYearForReference, getCurrentAcademicYear } from '@/lib/academicYear';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
  const applications = await prisma.application.findMany({ where: { studentId: (session.user as any).id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Please log in as a student to apply.' }, { status: 401 });
    const userId = (session.user as any).id;
    const body = await req.json();
    if (body.applicationType !== ApplicationType.FRESH && body.applicationType !== ApplicationType.RENEWAL) {
      return NextResponse.json({ error: 'Select Fresh or Renewal as the application type.' }, { status: 400 });
    }
    const academicYear = getCurrentAcademicYear();
    const existingApplication = await prisma.application.findFirst({ where: { studentId: userId, academicYear } });
    if (existingApplication) return NextResponse.json({ error: `You already have an application for ${academicYear}. Track it from your dashboard.`, applicationId: existingApplication.id }, { status: 409 });

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
      !body.parentName?.trim() ||
      !body.residentialAddress ||
      !body.personalStatement
    ) {
      return NextResponse.json(
        { error: 'All mandatory text fields marked with (*) are required.' },
        { status: 400 }
      );
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
