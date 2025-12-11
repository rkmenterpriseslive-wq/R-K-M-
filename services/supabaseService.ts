
import { supabase } from './supabaseClient';
import { Job } from '../types';

// Mock data for fallback
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Store Manager',
    company: 'Reliance Retail',
    storeName: 'Reliance Smart',
    description: 'Manage daily store operations, staff, and inventory.',
    postedDate: new Date().toISOString(),
    adminId: 'admin1',
    experienceLevel: '3-5 Years',
    salaryRange: '25,000 - 35,000',
    numberOfOpenings: 2,
    jobCategory: 'Retail',
    jobCity: 'Mumbai',
    locality: 'Andheri West',
    minQualification: 'Graduate',
    genderPreference: 'Any',
    jobType: 'Full-time',
    workLocationType: 'In-office',
    workingDays: '6 days',
    jobShift: 'Day Shift',
    interviewAddress: 'Reliance Smart, Andheri West, Mumbai',
    salaryType: 'Fixed',
  },
  {
    id: '2',
    title: 'Delivery Associate',
    company: 'Swiggy',
    storeName: 'Swiggy Instamart',
    description: 'Deliver groceries and packages to customers safely and on time.',
    postedDate: new Date(Date.now() - 86400000).toISOString(),
    adminId: 'admin1',
    experienceLevel: 'Fresher',
    salaryRange: '15,000 - 20,000',
    numberOfOpenings: 10,
    jobCategory: 'Logistics',
    jobCity: 'Delhi',
    locality: 'Lajpat Nagar',
    minQualification: '10th Pass',
    genderPreference: 'Male',
    jobType: 'Full-time',
    workLocationType: 'Field',
    workingDays: '6 days',
    jobShift: 'Rotational',
    interviewAddress: 'Swiggy Hub, Lajpat Nagar, Delhi',
    salaryType: 'Fixed + Incentive',
    incentive: 'Up to 5000',
  }
];

// Map Supabase snake_case to App camelCase
const mapToJob = (data: any): Job => ({
  id: data.id,
  title: data.title,
  company: data.company,
  storeName: data.store_name,
  description: data.description,
  postedDate: data.posted_date,
  adminId: data.admin_id,
  experienceLevel: data.experience_level,
  salaryRange: data.salary_range,
  numberOfOpenings: data.number_of_openings,
  companyLogoSrc: data.company_logo_src,
  // New fields
  jobCategory: data.job_category,
  jobCity: data.job_city,
  locality: data.locality,
  minQualification: data.min_qualification,
  genderPreference: data.gender_preference,
  jobType: data.job_type,
  workLocationType: data.work_location_type,
  workingDays: data.working_days,
  jobShift: data.job_shift,
  interviewAddress: data.interview_address,
  salaryType: data.salary_type,
  incentive: data.incentive,
});

export const getJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('posted_date', { ascending: false });

    if (error) {
      console.info('Supabase: Could not fetch jobs, falling back to mock data. This is expected if the database is not set up.', error.message);
      return MOCK_JOBS;
    }

    return (data || []).map(mapToJob);
  } catch (err) {
    console.info('Supabase: An unexpected error occurred while fetching jobs, falling back to mock data.', err);
    return MOCK_JOBS;
  }
};

export const createJob = async (job: Omit<Job, 'id' | 'postedDate'>): Promise<Job | null> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title: job.title,
          company: job.company,
          store_name: job.storeName,
          description: job.description,
          admin_id: job.adminId,
          experience_level: job.experienceLevel,
          salary_range: job.salaryRange,
          number_of_openings: job.numberOfOpenings,
          company_logo_src: job.companyLogoSrc,
          posted_date: new Date().toISOString(),
          // New fields
          job_category: job.jobCategory,
          job_city: job.jobCity,
          locality: job.locality,
          min_qualification: job.minQualification,
          gender_preference: job.genderPreference,
          job_type: job.jobType,
          work_location_type: job.workLocationType,
          working_days: job.workingDays,
          job_shift: job.jobShift,
          interview_address: job.interviewAddress,
          salary_type: job.salaryType,
          incentive: job.incentive,
        },
      ])
      .select()
      .single();

    if (error) {
        console.info('Supabase: Could not create job, simulating locally. Data will not persist.', error.message);
        const mockNewJob: Job = {
            id: Math.random().toString(36).substr(2, 9),
            postedDate: new Date().toISOString(),
            ...job,
            adminId: job.adminId || 'mock-admin'
        };
        return mockNewJob;
    }

    return data ? mapToJob(data) : null;
  } catch (error) {
      console.info('Supabase: An unexpected error occurred while creating a job, simulating locally.', error);
      // Return a temporary object so the UI doesn't break
      return {
        id: Math.random().toString(36).substr(2, 9),
        postedDate: new Date().toISOString(),
        ...job,
        adminId: job.adminId || 'mock-admin'
      };
  }
};

export const deleteJob = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

    if (error) {
        console.info(`Supabase: Could not delete job (ID: ${id}), simulating locally.`, error.message);
    }
  } catch (error) {
      console.info(`Supabase: An unexpected error occurred while deleting job (ID: ${id}), simulating locally.`, error);
  }
};
