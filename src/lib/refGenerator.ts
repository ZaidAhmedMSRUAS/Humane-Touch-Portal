import { prisma } from '@/lib/prisma';
import { getCourseCode } from '@/constants/courses';

/**
 * Generates an official Reference Number:
 * Format: HT/<YEAR_CYCLE>/<COURSE_CODE>/<4_DIGIT_SEQ>
 * Example: HT/26-27/MBBS/0001 or HT/26-27/BTECH-CS/0004
 */
export async function generateApplicationRefNumber(
  courseName: string,
  academicYear: string = '2026-2027'
): Promise<string> {
  const courseCode = getCourseCode(courseName);

  const yearParts = academicYear.split('-');
  const yearSlug =
    yearParts.length === 2
      ? `${yearParts[0].slice(-2)}-${yearParts[1].slice(-2)}`
      : '26-27';

  const prefix = `HT/${yearSlug}/${courseCode}/`;

  const count = await prisma.application.count({
    where: {
      referenceNumber: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = String(count + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}