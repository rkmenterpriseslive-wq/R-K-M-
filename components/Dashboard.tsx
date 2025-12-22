
import React from 'react';
import {
  Job,
  UserType,
  CandidatePipelineStats,
  VendorStats,
  ComplaintStats,
  ProcessMetric,
  RoleMetric,
  AdminMenuItem,
  DashboardProps,
  CandidateMenuItem,
  PartnerRequirementStats,
  HRUpdatesStats,
  RoleWiseData,
  StoreWiseData,
  PartnerWiseData,
  TeamWiseData,
  TeamMemberPerformance,
  UserProfile
} from '../types';
import AdminLayout from './admin/AdminLayout';
import AdminDashboardContent from './admin/AdminDashboardContent';
import CandidateLayout from './candidate/CandidateLayout';
import CandidateDashboardContent from './candidate/CandidateDashboardContent';


const Dashboard: React.FC<DashboardProps & { onHomeClick?: () => void }> = ({
  userType,
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  currentLogoSrc,
  onLogoUpload,
  pipelineStats,
  vendorStats,
  complaintStats,
  partnerRequirementStats,
  hrUpdatesStats, // Added
  candidatesByProcess,
  candidatesByRole,
  roleWiseJobData, // Added
  storeWiseJobData, // Added
  partnerWiseJobData, // Added
  teamWiseJobData, // Added
  teamPerformance, // Added
  teamMembers,
  activeAdminMenuItem,
  onAdminMenuItemClick,
  activeCandidateMenuItem,
  onCandidateMenuItemClick,
  onLogout,
  branding,
  onUpdateBranding,
  currentUser,
  currentUserProfile,
  allUsers, // NEW: allUsers prop
  candidates,
  onApplyNow,
  onCvCompletion,
  onProfileUpdate,
  onHomeClick
}) => {
  const renderDashboardContent = () => {
    switch (userType) {
      case UserType.ADMIN:
      case UserType.HR:
      case UserType.PARTNER:
      case UserType.TEAMLEAD:
      case UserType.STORE_SUPERVISOR:
      case UserType.TEAM:
        return (
          <AdminLayout
            userType={userType}
            currentLogoSrc={currentLogoSrc}
            onLogoUpload={onLogoUpload}
            activeAdminMenuItem={activeAdminMenuItem}
            onAdminMenuItemClick={onAdminMenuItemClick}
            onHomeClick={onHomeClick}
          >
            <AdminDashboardContent
              pipelineStats={pipelineStats}
              vendorStats={vendorStats}
              complaintStats={complaintStats}
              partnerRequirementStats={partnerRequirementStats}
              hrUpdatesStats={hrUpdatesStats} // Passed
              candidatesByProcess={candidatesByProcess}
              candidatesByRole={candidatesByRole}
              roleWiseJobData={roleWiseJobData} // Passed
              storeWiseJobData={storeWiseJobData} // Passed
              partnerWiseJobData={partnerWiseJobData} // Passed
              teamWiseJobData={teamWiseJobData} // Passed
              teamPerformance={teamPerformance} // Passed
              teamMembers={teamMembers}
              jobs={jobs}
              onAddJob={onAddJob}
              onUpdateJob={onUpdateJob}
              onDeleteJob={onDeleteJob}
              currentLogoSrc={currentLogoSrc} 
              onLogoUpload={onLogoUpload} 
              activeAdminMenuItem={activeAdminMenuItem}
              onAdminMenuItemClick={onAdminMenuItemClick}
              userType={userType}
              branding={branding}
              onUpdateBranding={onUpdateBranding}
              currentUser={currentUser}
              // FIX: Pass currentUserProfile to AdminDashboardContent.
              currentUserProfile={currentUserProfile}
              allUsers={allUsers} // NEW: Pass allUsers
              candidates={candidates}
            />
          </AdminLayout>
        );
      case UserType.CANDIDATE:
        return (
          <CandidateLayout
            userType={userType}
            activeCandidateMenuItem={activeCandidateMenuItem}
            onCandidateMenuItemClick={onCandidateMenuItemClick}
            onHomeClick={onHomeClick}
          >
            <CandidateDashboardContent
              activeCandidateMenuItem={activeCandidateMenuItem}
              jobs={jobs}
              onApplyNow={onApplyNow}
              onCvCompletion={onCvCompletion}
              onProfileUpdate={onProfileUpdate}
              currentUserProfile={currentUserProfile}
            />
          </CandidateLayout>
        );
      default:
        // Fallback for any other user type, or if userType is somehow NONE
        return (
          <div className="flex items-center justify-center h-screen">
            <p>Loading your dashboard...</p>
          </div>
        );
    }
  };

  return <>{renderDashboardContent()}</>;
};

export default Dashboard;