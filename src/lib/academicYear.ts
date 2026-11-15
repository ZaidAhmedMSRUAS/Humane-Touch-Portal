/** Returns the active academic cycle. Set CURRENT_ACADEMIC_YEAR to override it. */
export function getCurrentAcademicYear(date = new Date()): string {
  const configured = process.env.CURRENT_ACADEMIC_YEAR?.trim();
  if (configured && /^20\d{2}-20\d{2}$/.test(configured)) return configured;

  // The scholarship cycle starts in April. This keeps new submissions in the
  // same cycle across the calendar year boundary.
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

export function academicYearForReference(academicYear: string): string {
  const match = academicYear.match(/^(20\d{2})-(20\d{2})$/);
  return match ? `${match[1].slice(-2)}-${match[2].slice(-2)}` : academicYear;
}
