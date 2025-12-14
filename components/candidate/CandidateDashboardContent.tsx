import React from 'react';
// FIX: Import UserType to resolve 'Cannot find name 'UserType'' error.
// Import Education for qualification filtering
import { CandidateDashboardContentProps, CandidateMenuItem, UserType, UserProfile, Education } from '../../types';
import JobList from '../JobList';
import MyDocumentsView from './MyDocumentsView';
import MyProfileView from './MyProfileView';
import CVGeneratorView from './CVGeneratorView';
import MyPayslipsView from './MyPayslipsView';
import MyAttendanceView from './MyAttendanceView';
import MyInterviewsView from './MyInterviewsView';
import CompanyDocumentsView from './CompanyDocumentsView';
import ResignView from './ResignView';
import HelpCenterView from './HelpCenterView';

const CandidateDashboardContent: React.FC<CandidateDashboardContentProps> = ({ activeCandidateMenuItem, jobs, onApplyNow, onCvCompletion, onProfileUpdate, currentUserProfile }) => {
  const renderContent = () => {
    switch (activeCandidateMenuItem) {
      case CandidateMenuItem.MyJobs:
        const getQualificationRank = (degree: string): number => {
            const lowerDegree = degree.toLowerCase();
            // Rank from highest to lowest, covers both job requirements and CV entries
            if (lowerDegree.includes('post graduate') || lowerDegree.startsWith('m')) return 4;
            if (lowerDegree.includes('graduate') || lowerDegree.startsWith('b')) return 3;
            if (lowerDegree.includes('12th pass') || lowerDegree.includes('intermediate')) return 2;
            if (lowerDegree.includes('10th pass') || lowerDegree.includes('high school')) return 1;
            return 0;
        };

        const userHighestQualificationRank = currentUserProfile?.educations
            ? Math.max(0, ...currentUserProfile.educations.map(edu => getQualificationRank(edu.degree)))
            : 0;

        const availableJobs = jobs.filter(job => {
            const jobQualificationRank = getQualificationRank(job.minQualification);
            // Show jobs where the minimum qualification is less than or equal to the user's highest qualification.
            return jobQualificationRank <= userHighestQualificationRank;
        });
        
        return (
          <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">My Jobs</h2>
                <p className="text-gray-500 mt-1">Track your job applications and discover new opportunities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">My Applied Jobs</h3>
                <div className="text-center py-10 text-gray-500">
                    <p>You haven't applied for any jobs yet.</p>
                    <p className="text-sm mt-2">Applied jobs will appear here.</p>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Best Jobs Matching Your Highest Qualification</h3>
                <JobList jobs={availableJobs} currentUserType={UserType.CANDIDATE} onApplyNow={onApplyNow} />
            </div>
          </div>
        );
      case CandidateMenuItem.MyDocuments:
        return <MyDocumentsView currentUserProfile={currentUserProfile} onProfileUpdate={onProfileUpdate} />;
      case CandidateMenuItem.MyProfile:
        return <MyProfileView currentUserProfile={currentUserProfile} />;
      case CandidateMenuItem.CVGenerator:
        return <CVGeneratorView onCvComplete={onCvCompletion} currentUserProfile={currentUserProfile} />;
      case CandidateMenuItem.MyPayslips:
        return <MyPayslipsView />;
      case CandidateMenuItem.MyAttendance:
        return <MyAttendanceView />;
      case CandidateMenuItem.MyInterviews:
        return <MyInterviewsView />;
      case CandidateMenuItem.CompanyDocuments:
        return <CompanyDocumentsView />;
      case CandidateMenuItem.Resign:
        return <ResignView />;
      case CandidateMenuItem.HelpCenter:
        return <HelpCenterView />;
      default:
        return <div>Select a menu item</div>;
    }
  };

  return <div className="animate-fade-in">{renderContent()}</div>;
};

export default CandidateDashboardContent;