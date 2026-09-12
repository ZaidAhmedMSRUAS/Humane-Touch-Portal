export interface CourseCategory {
  category: string;
  courses: { name: string; code: string }[];
}

export const PRESET_COURSES: CourseCategory[] = [
  {
    category: 'Engineering & Technology',
    courses: [
      { name: 'B.E. / B.Tech (Computer Science / IT / AI)', code: 'BTECH-CS' },
      { name: 'B.E. / B.Tech (Electronics / Electrical)', code: 'BTECH-EE' },
      { name: 'B.E. / B.Tech (Mechanical / Civil / Other)', code: 'BTECH-ENG' },
      { name: 'BCA (Bachelor of Computer Applications)', code: 'BCA' },
      { name: 'MCA (Master of Computer Applications)', code: 'MCA' },
      { name: 'M.Tech', code: 'MTECH' },
      { name: 'Diploma in Engineering / Polytechnic', code: 'DIPLOMA' },
    ],
  },
  {
    category: 'Medical & Healthcare',
    courses: [
      { name: 'MBBS', code: 'MBBS' },
      { name: 'BDS (Dental)', code: 'BDS' },
      { name: 'B.Pharm (Pharmacy)', code: 'BPHARM' },
      { name: 'Pharm.D', code: 'PHARMD' },
      { name: 'B.Sc Nursing', code: 'BSCNURS' },
      { name: 'BAMS / BHMS / AYUSH', code: 'AYUSH' },
      { name: 'Allied Health Sciences / Lab Tech / Physiotherapy', code: 'ALLIED' },
    ],
  },
  {
    category: 'Commerce, Management & Law',
    courses: [
      { name: 'B.Com', code: 'BCOM' },
      { name: 'BBA / BBM', code: 'BBA' },
      { name: 'MBA', code: 'MBA' },
      { name: 'M.Com', code: 'MCOM' },
      { name: 'CA / CS / CMA Studies', code: 'PROF-FIN' },
      { name: 'LLB / B.A. LL.B (Law)', code: 'LAW' },
    ],
  },
  {
    category: 'Science, Arts & Education',
    courses: [
      { name: 'B.Sc (General / Life Sciences)', code: 'BSC' },
      { name: 'M.Sc', code: 'MSC' },
      { name: 'B.A. (Bachelor of Arts)', code: 'BA' },
      { name: 'M.A. (Master of Arts)', code: 'MA' },
      { name: 'B.Ed / D.Ed', code: 'BED' },
    ],
  },
  {
    category: 'Pre-University & High School',
    courses: [
      { name: 'PUC I / 11th Standard', code: 'PUC1' },
      { name: 'PUC II / 12th Standard', code: 'PUC2' },
      { name: 'ITI (Industrial Training)', code: 'ITI' },
    ],
  },
];

export function getCourseCode(courseName: string): string {
  for (const group of PRESET_COURSES) {
    const match = group.courses.find((c) => c.name.toLowerCase() === courseName.toLowerCase());
    if (match) return match.code;
  }
  // Fallback slug for custom "Other" courses
  return courseName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase() || 'GEN';
}