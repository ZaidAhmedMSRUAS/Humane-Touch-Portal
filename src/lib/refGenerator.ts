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

  // Extract 2-digit year format (e.g., '2026-2027' -> '26-27')
  const yearParts = academicYear.split('-');
  const yearSlug =
    yearParts.length === 2
      ? `${yearParts[0].slice(-2)}-${yearParts[1].slice(-2)}`
      : '26-27';

  const prefix = `HT/${yearSlug}/${courseCode}/`;

  // Count how many applications already exist for this specific course in this academic year
  const count = await prisma.scholarshipApplication.count({
    where: {
      referenceNumber: {
        startsWith: prefix,
      },
    },
  });

  const nextSeq = String(count + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}