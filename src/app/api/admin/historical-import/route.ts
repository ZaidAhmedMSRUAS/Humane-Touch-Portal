import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, ApplicationStatus } from '@prisma/client';
import { generateApplicationRefNumber } from '@/lib/refGenerator';

export async function POST(req: Request) {
  try {
    const { academicYear, records } = await req.json();

    if (!academicYear || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'Academic Year and records array are required.' },
        { status: 400 }
      );
    }

    const createdRecords = [];

    for (const row of records) {
      const studentPhone = row.phone ? String(row.phone).trim() : `99${Math.floor(10000000 + Math.random() * 90000000)}`;
      const studentName = row.fullName || row.name || 'Past Beneficiary';
      const course = row.courseName || row.course || 'B.Tech.';
      const college = row.collegeName || row.college || 'Affiliated Institution';
      const sanctioned = Number(row.sanctionedAmount || row.amount || 15000);
      const chequeNumber = row.chequeNumber || 'LEGACY-PAST-DISBURSAL';

      // 1. Upsert Student User
      const student = await prisma.user.upsert({
        where: {
          phone_role: {
            phone: studentPhone,
            role: UserRole.STUDENT,
          },
        },
        update: { fullName: studentName },
        create: {
          fullName: studentName,
          phone: studentPhone,
          email: row.email || `${studentPhone}@legacy.humanetouch.org`,
          role: UserRole.STUDENT,
          passwordHash: '$2a$10$wE9K9rKqZ6Qx6L0uW6t4q.Y8N3ZzL6V7K4f1r5e7q9e1w2r3t4y5u',
          isPhoneVerified: true,
        },
      });

      // 2. Generate new format Reference Number
      const refNumber = await generateApplicationRefNumber(course, academicYear);

      // 3. Create Scholarship Record
      const app = await prisma.scholarshipApplication.create({
        data: {
          studentId: student.id,
          referenceNumber: refNumber,
          courseName: course,
          collegeName: college,
          currentYearOfStudy: row.yearOfStudy || 'Final Year',
          annualTuitionFee: sanctioned,
          sanctionedAmount: sanctioned,
          status: ApplicationStatus.DISBURSED,
          chequeNumber: chequeNumber,
          chequeInFavourOf: college,
          disbursedAt: new Date(row.disbursedDate || academicYear.split('-')[0] + '-08-15'),
        },
      });

      createdRecords.push(app);
    }

    return NextResponse.json({
      success: true,
      count: createdRecords.length,
      message: `Successfully imported ${createdRecords.length} records for cycle ${academicYear}`,
    });
  } catch (error: any) {
    console.error('Historical Import Error:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}