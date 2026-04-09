import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envContents = fs.readFileSync(resolve(__dirname, '../.env'), 'utf8');
const getEnv = (key) => envContents.match(new RegExp(`${key}=(.*)`))?.[1]?.trim() || '';

const supabase = createClient(
  getEnv('VITE_SUPABASE_URL'),
  getEnv('VITE_SUPABASE_ANON_KEY')
);

function getCurrentAcademicYearEnd() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month < 8) return year;
  return year + 1;
}

function calculateCohortFromYearGroup(yearGroupName) {
  if (!yearGroupName) return null;
  const match = yearGroupName.match(/Year\s*(\d+)/i);
  if (!match) return null;
  const yearNumber = parseInt(match[1], 10);
  const yearsUntilGraduation = 13 - yearNumber;
  return getCurrentAcademicYearEnd() + yearsUntilGraduation;
}

async function migrate() {
  console.log('Fetching students...');
  const { data: students, error } = await supabase.from('students').select('id, school_year, academic_cohort');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  if (!students) {
      console.log('No students found');
      return;
  }
  console.log(`Found ${students.length} students.`);
  
  for (const student of students) {
    if (!student.academic_cohort && student.school_year) {
      const cohort = calculateCohortFromYearGroup(student.school_year);
      if (cohort) {
          console.log(`Updating student ${student.id} to cohort ${cohort} (was ${student.school_year})`);
          const { error: updateError } = await supabase.from('students').update({ academic_cohort: cohort }).eq('id', student.id);
          if (updateError) {
             console.error(`Failed to update ${student.id}:`, updateError);
          }
      }
    }
  }
  console.log('Done!');
}

migrate();
