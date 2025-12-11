
import React from 'react';
import { Job, UserType } from '../types';
import Button from './Button';

interface JobListProps {
  jobs: Job[];
  currentUserType: UserType;
  onDeleteJob?: (id: string) => void;
  onApplyNow?: (job: Job) => void; // New prop for apply button
}

const JobList: React.FC<JobListProps> = ({ jobs, currentUserType, onDeleteJob, onApplyNow }) => {
  const isAdmin = currentUserType === UserType.ADMIN;

  if (jobs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
        No jobs posted yet. {isAdmin && 'Start by posting a new job!'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between relative">
          {job.companyLogoSrc && (
            <div className="absolute top-4 right-4 w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
              <img src={job.companyLogoSrc} alt={`${job.company} logo`} className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div>
            <div className="flex justify-between items-start mb-2 pr-16"> {/* Add padding-right to avoid overlap with logo */}
              <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
              {/* Experience Level moved to the bottom row */}
            </div>
            <p className="text-gray-600 text-sm">{job.company}</p>
            <p className="text-gray-600 text-sm flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.jobCity}, {job.locality} {job.storeName && `| ${job.storeName}`}
            </p>
            <p className="text-gray-700 text-sm flex items-center mt-1">
              <span className="mr-1 text-gray-500">₹</span> {job.salaryRange}
            </p>
            <p className="text-gray-700 text-sm flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Openings: {job.numberOfOpenings}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between"> {/* Changed to justify-between to space out items */}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              job.experienceLevel === 'Fresher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {job.experienceLevel}
            </span>
            {isAdmin && onDeleteJob ? (
              <Button variant="danger" size="sm" onClick={() => onDeleteJob(job.id)}>
                Delete
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={() => onApplyNow?.(job)}>
                Apply Now
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;
