import { supabase } from './supabase';
import { calculateCohortFromYearGroup, getKeyStageForYearGroup } from '../utils/academicYear';

export async function convertEnquiryToStudentAndParent(lead: any, enquiry: any, activeSubjects: any[]) {
  // 1. Create Parent record using the Lead's information
  const nameParts = lead?.parent_name?.split(' ') || ['Unknown'];
  const { data: parent, error: parentError } = await supabase.from('parents').insert({
    first_name: nameParts[0],
    last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
    email: lead?.email,
    phone: lead?.phone,
    preferred_contact_method: lead?.preferred_contact_method || null,
    relationship_to_student: lead?.relationship_to_student || null,
    address_line_1: lead?.address_line_1 || null,
    city: lead?.city || null,
    postal_code: lead?.postal_code || null,
    how_heard: lead?.how_heard || lead?.source || null,
    referral_source: lead?.source || null,
    status: 'active'
  }).select().single();
  
  if (parentError) throw parentError;

  // 2. Loop through enquiry.students and create Student records
  const students = enquiry.students || [];
  for (const stu of students) {
     const cohort = calculateCohortFromYearGroup(stu.year_group);
     const ks = getKeyStageForYearGroup(stu.year_group);

     const { data: newStudent, error: studentError } = await supabase.from('students').insert({
       first_name: stu.first_name,
       last_name: stu.last_name,
       date_of_birth: stu.date_of_birth || null,
       status: 'onboarding',
       school_year: stu.year_group,
       key_stage: ks === 'N/A' ? null : ks,
       academic_cohort: cohort,
       primary_parent_id: parent.id,
       notes: stu.notes || null
     }).select().single();

     if (studentError) { console.error('Error creating student:', studentError); continue; }
     
     // 3. Handle Subjects
     if (stu.subjects && stu.subjects.length > 0) {
        const matchedSubjects = activeSubjects.filter(sub => stu.subjects.includes(sub.name));
        if (matchedSubjects.length > 0) {
          const links = matchedSubjects.map(sub => ({
            student_id: newStudent.id,
            subject_id: sub.id
          }));
          await supabase.from('student_subjects').insert(links);
        }
     }
  }

  // 4. Mark Enquiry as Won
  await supabase.from('enquiries').update({ status: 'won' }).eq('id', enquiry.id);
  
  return parent;
}
