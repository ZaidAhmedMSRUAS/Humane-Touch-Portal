import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, ApplicationStatus } from '@prisma/client';
import { generateApplicationRefNumber } from '@/lib/refGenerator';
import { sanitizePhoneNumber, sanitizeAmount, sanitizeMarks, sanitizeText } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const { academicYear, records } = await req.json();

    if (!academicYear || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'Academic Year and a valid records list are required.' },
        { status: 400 }
      );
    }

    const createdRecords = [];
    const skippedRecords: { row: number; reason: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];

      // 1. Phone Validation (Strict 10-Digit Constraint)
      const validPhone = sanitizePhoneNumber(row.phone);
      if (!validPhone) {
        skippedRecords.push({
          row: i + 1,
          reason: `Invalid 10-digit mobile number: '${row.phone}'. Must be a 10-digit number starting with 6-9.`,
        });
        continue;
      }

      // 2. Field Sanitizations
      const studentName = sanitizeText(row.fullName || row.name || 'Past Beneficiary');
      const course = sanitizeText(row.courseName || row.course || 'B.Tech.');
      const college = sanitizeText(row.collegeName || row.college || 'Affiliated Institution');
      const sanctioned = sanitizeAmount(row.sanctionedAmount || row.amount, 15000);
      const tuitionFee = sanitizeAmount(row.annualTuitionFee || row.fee, sanctioned);
      const income = sanitizeAmount(row.familyAnnualIncome || row.income, 120000);
      const marks = sanitizeMarks(row.previousScoreMarks || row.marks, 75.0);
      const chequeNumber = sanitizeText(row.chequeNumber || 'LEGACY-DISBURSAL');

      // 3. Upsert Student User
      const student = await prisma.user.upsert({
        where: {
          phone_role: {
            phone: validPhone,
            role: UserRole.STUDENT,
          },
        },
        update: { fullName: studentName },
        create: {
          fullName: studentName,
          phone: validPhone,
          email: row.email ? sanitizeText(row.email) : `${validPhone}@legacy.humanetouch.org`,
          role: UserRole.STUDENT,
          passwordHash: '$2a$10$wE9K9rKqZ6Qx6L0uW6t4q.Y8N3ZzL6V7K4f1r5e7q9e1w2r3t4y5u',
          isPhoneVerified: true,
        },
      });

      // 4. Generate Standardized Reference ID
      const refNumber = await generateApplicationRefNumber(course, academicYear);

      // 5. Create Application using Prisma Relation Connect
      const appData: any = {
        student: {
          connect: { id: student.id },
        },
        referenceNumber: refNumber,
        courseName: course,
        collegeName: college,
        currentYearOfStudy: sanitizeText(row.yearOfStudy || 'Final Year'),
        previousScoreMarks: marks,
        familyAnnualIncome: income,
        annualTuitionFee: tuitionFee,
        householdCategory: sanitizeText(row.householdCategory || 'General'),
        status: ApplicationStatus.APPROVED,
      };

      // Optional disbarment attributes
      if (sanctioned > 0) appData.sanctionedAmount = sanctioned;
      if (chequeNumber) appData.chequeNumber = chequeNumber;
      if (college) appData.chequeInFavourOf = college;

      const app = await prisma.application.create({
        data: appData,
      });

      createdRecords.push(app);
    }

    return NextResponse.json({
      success: true,
      count: createdRecords.length,
      skippedCount: skippedRecords.length,
      skippedDetails: skippedRecords,
      message: `Successfully imported ${createdRecords.length} records for cycle ${academicYear}.${
        skippedRecords.length > 0 ? ` (${skippedRecords.length} rows skipped due to invalid phone numbers)` : ''
      }`,
    });
  } catch (error: any) {
    console.error('Historical Import Error:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}