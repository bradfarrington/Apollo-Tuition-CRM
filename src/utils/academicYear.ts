export const YEAR_GROUPS: Record<string, number> = {
  'Pre-School': 0,
  'Reception': 0,
  'Year 1': 1,
  'Year 2': 2,
  'Year 3': 3,
  'Year 4': 4,
  'Year 5': 5,
  'Year 6': 6,
  'Year 7': 7,
  'Year 8': 8,
  'Year 9': 9,
  'Year 10': 10,
  'Year 11': 11,
  'Year 12': 12,
  'Year 13': 13,
};

/**
 * Returns the year the current academic year ends.
 * E.g. in April 2026, we are in 2025/2026, so it returns 2026.
 * In Sept 2026, we are in 2026/2027, so it returns 2027.
 */
export function getCurrentAcademicYearEnd(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11, 8 is September
  // If it's before September, the academic year ends in the current calendar year.
  // If it's September or later, the academic year ends in the next calendar year.
  if (month < 8) {
    return year;
  }
  return year + 1;
}

/**
 * Calculates the expected graduation year (cohort) based on the current
 * academic year and the given Year Group name (e.g., 'Year 11').
 */
export function calculateCohortFromYearGroup(yearGroupName: string | null): number | null {
  if (!yearGroupName) return null;
  const match = yearGroupName.match(/Year\s*(\d+)/i);
  if (!match) return null;
  
  const yearNumber = parseInt(match[1], 10); // e.g. 11
  const yearsUntilGraduation = 13 - yearNumber;
  return getCurrentAcademicYearEnd() + yearsUntilGraduation;
}

/**
 * Derives the current Year Group name based on a student's graduation cohort
 * and the current academic year.
 */
export function getYearGroupFromCohort(cohort: number | null): string {
  if (!cohort) return 'Unknown';
  
  const yearsUntilGraduation = cohort - getCurrentAcademicYearEnd();
  const currentYear = 13 - yearsUntilGraduation;

  if (currentYear > 13) return 'Graduated';
  if (currentYear < 1) return 'Pre-School';
  return `Year ${currentYear}`;
}

/**
 * Derives the Key Stage based on a Year Group string or numerical year.
 */
export function getKeyStageForYearGroup(yearGroup: string | number): string {
  let year: number;
  
  if (typeof yearGroup === 'string') {
    const match = yearGroup.match(/Year\s*(\d+)/i);
    year = match ? parseInt(match[1], 10) : 0;
  } else {
    year = yearGroup;
  }

  if (year >= 1 && year <= 2) return 'KS1';
  if (year >= 3 && year <= 6) return 'KS2';
  if (year >= 7 && year <= 9) return 'KS3';
  if (year >= 10 && year <= 11) return 'KS4';
  if (year >= 12 && year <= 13) return 'KS5';
  
  return 'N/A';
}

/**
 * A combined utility to get both the Year Group and Key Stage from a cohort.
 */
export function getAcademicDetailsFromCohort(cohort: number | null) {
  const yearGroup = getYearGroupFromCohort(cohort);
  const keyStage = getKeyStageForYearGroup(yearGroup);
  
  return {
    yearGroup,
    keyStage,
  };
}
