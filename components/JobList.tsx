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
  const isAdminView = !!onDeleteJob && (currentUserType === UserType.ADMIN || currentUserType === UserType.HR);

  const getLogo = (job: Job) => {
    if (job.companyLogoSrc) return job.companyLogoSrc;
    const company = job.company.toLowerCase();
    if (company.includes('amazon')) return 'https://logos-world.net/wp-content/uploads/2021/02/Amazon-Fresh-Logo.png';
    if (company.includes('zepto')) return 'https://media.licdn.com/dms/image/C4D0BAQG18sQCXpMEtA/company-logo_200_200/0/1652344793834?e=2147483647&v=beta&t=U-Wq_d_uF9I5JKl5rY2-2h4Tf2G5-GgXlP0iR4qGg_I';
    return `https://ui-avatars.com/api/?name=${job.company.charAt(0)}&color=7F9CF5&background=EBF4FF`;
  };

  if (isAdminView) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-1/3 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Process</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length > 0 ? jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-md object-contain p-1 border border-gray-100 bg-white" src={getLogo(job)} alt={`${job.company} logo`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.jobType}</div>
                    <div className="text-sm text-gray-500">{job.numberOfOpenings} openings</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.jobCity}</div>
                    <div className="text-sm text-gray-500">{job.locality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                          <button className="text-gray-500 hover:text-blue-600 font-medium">Edit</button>
                          {onDeleteJob && (
                               <button onClick={() => onDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-medium">
                                  Delete
                               </button>
                          )}
                      </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-gray-500">
                    No jobs posted yet. Start by posting a new job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // PUBLIC/CANDIDATE VIEW (CARDS)
  if (jobs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
        No jobs posted yet.
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
            <div className="flex justify-between items-start mb-2 pr-16">
              <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
            </div>
            <p className="text-gray-600 text-sm">{job.company}</p>
            <p className="text-gray-600 text-sm flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.jobCity}, {job.locality}{job.storeName && job.storeName !== job.locality ? `, ${job.storeName}` : ''}
            </p>
            <p className="text-gray-700 text-sm flex items-center mt-1">
              <span className="mr-1 text-gray-500">₹</span> {job.salaryRange}
              {job.incentive && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                  + {job.incentive}
                </span>
              )}
            </p>
            <p className="text-gray-700 text-sm flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Openings: {job.numberOfOpenings}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              job.experienceLevel === 'Fresher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {job.experienceLevel}
            </span>
            {onApplyNow && (
              <Button variant="primary" size="md" onClick={() => onApplyNow(job)}>
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
