import { prisma } from '@/lib/prisma';

/**
 * Generates unique course-segregated reference numbers:
 * Format: HT/26-27/{Course}/{0001}
 */
export async function generateApplicationRefNumber(
  rawCourseName?: string | null,
  academicCycle: string = '26-27'
): Promise<string> {
  // 1. Sanitize Course Name (e.g. "B.Tech Computer Science" -> "B.Tech", "BCA" -> "BCA")
  let courseCode = (rawCourseName || 'GEN').trim();

  // Clean leading/trailing spaces and retain standard degree codes
  if (courseCode.toLowerCase().includes('b.tech') || courseCode.toLowerCase().includes('btech')) {
    courseCode = 'B.Tech';
  } else if (courseCode.toLowerCase().includes('bca')) {
    courseCode = 'BCA';
  } else if (courseCode.toLowerCase().includes('mbbs')) {
    courseCode = 'MBBS';
  } else if (courseCode.toLowerCase().includes('b.com') || courseCode.toLowerCase().includes('bcom')) {
    courseCode = 'B.Com';
  } else if (courseCode.toLowerCase().includes('b.sc') || courseCode.toLowerCase().includes('bsc')) {
    courseCode = 'B.Sc';
  } else if (courseCode.toLowerCase().includes('puc') || courseCode.toLowerCase().includes('11th') || courseCode.toLowerCase().includes('12th')) {
    courseCode = 'PUC';
  } else if (courseCode.toLowerCase().includes('be') || courseCode.toLowerCase().includes('b.e')) {
    courseCode = 'B.E';
  } else {
    // Keep alphanumeric and dot characters
    courseCode = courseCode.replace(/[^a-zA-Z0-9.]/g, '').slice(0, 8) || 'DEGREE';
  }

  const prefix = `HT/${academicCycle}/${courseCode}/`;

  // 2. Query all existing applications with this course prefix to find the max sequence
  const existingApps = await prisma.application.findMany({
    where: {
      referenceNumber: {
        startsWith: prefix,
      },
    },
    select: { referenceNumber: true },
  });

  let maxSequence = 0;
  for (const app of existingApps) {
    if (app.referenceNumber) {
      const parts = app.referenceNumber.split('/');
      const lastPart = parts[parts.length - 1];
      const seq = parseInt(lastPart, 10);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    }
  }

  const nextSeq = String(maxSequence + 1).padStart(4, '0');
  return `${prefix}${nextSeq}`;
}