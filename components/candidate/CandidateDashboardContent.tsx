import React, { useState, useEffect } from 'react';
import { CandidateDashboardContentProps, CandidateMenuItem, UserType, UserProfile, DailyLineup } from '../../types';
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
import { onUserApplicationsChange } from '../../services/firebaseService';

const AppliedJobsList: React.FC<{ applications: DailyLineup[] }> = ({ applications }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Applied': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Interested': return 'text-green-600 bg-green-50 border-green-100';
            case 'Connected': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'Rejected':
            case 'Not Interested': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    if (applications.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">You haven't applied for any jobs yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{app.role}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(app.callStatus)}`}>
                                {app.callStatus}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{app.storeName || 'General Opening'}</p>
                        <p className="text-xs text-gray-400 mt-1">Location: {app.location}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                        <span className="text-gray-500">Applied on: {new Date(app.createdAt).toLocaleDateString()}</span>
                        {app.interviewDateTime && (
                             <span className="text-indigo-600 font-bold">Interview: {new Date(app.interviewDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const CandidateDashboardContent: React.FC<CandidateDashboardContentProps> = ({ activeCandidateMenuItem, jobs, onApplyNow, onCvCompletion, onProfileUpdate, currentUserProfile }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'applied'>('browse');
  const [myApplications, setMyApplications] = useState<DailyLineup[]>([]);

  useEffect(() => {
    if (currentUserProfile?.phone) {
        const unsub = onUserApplicationsChange(currentUserProfile.phone, setMyApplications);
        return () => unsub();
    }
  }, [currentUserProfile?.phone]);

  const renderContent = () => {
    switch (activeCandidateMenuItem) {
      case CandidateMenuItem.JobBoard:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Job Board</h2>
                    <p className="text-gray-600 mt-1">Manage your applications and find new career opportunities.</p>
                </div>
                <div className="inline-flex p-1 bg-gray-200 rounded-lg self-start sm:self-center">
                    <button 
                        onClick={() => setActiveTab('browse')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'browse' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Browse All
                    </button>
                    <button 
                        onClick={() => setActiveTab('applied')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'applied' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Applied Jobs ({myApplications.length})
                    </button>
                </div>
            </div>
            
            {activeTab === 'browse' ? (
                <JobList jobs={jobs} currentUserType={UserType.CANDIDATE} onApplyNow={onApplyNow} />
            ) : (
                <AppliedJobsList applications={myApplications} />
            )}
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