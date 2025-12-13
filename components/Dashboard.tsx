import React from 'react';
import {
  Job,
  UserType,
  CandidatePipelineStats,
  VendorStats,
  ComplaintStats,
  ProcessMetric,
  RoleMetric,
  TeamMemberPerformance,
  AdminMenuItem,
  DashboardProps,
  CandidateMenuItem,
  PartnerRequirementStats
} from '../types';
import AdminLayout from './admin/AdminLayout';
import AdminDashboardContent from './admin/AdminDashboardContent';
import CandidateLayout from './candidate/CandidateLayout';
import CandidateDashboardContent from './candidate/CandidateDashboardContent';


const Dashboard: React.FC<DashboardProps> = ({
  userType,
  jobs,
  onAddJob,
  onDeleteJob,
  currentLogoSrc,
  onLogoUpload,
  pipelineStats,
  vendorStats,
  complaintStats,
  partnerRequirementStats,
  candidatesByProcess,
  candidatesByRole,
  teamPerformance,
  activeAdminMenuItem,
  onAdminMenuItemClick,
  activeCandidateMenuItem,
  onCandidateMenuItemClick,
  onLogout,
  branding,
  onUpdateBranding,
  currentUser,
  onApplyNow,
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
            onLogout={onLogout}
            activeAdminMenuItem={activeAdminMenuItem}
            onAdminMenuItemClick={onAdminMenuItemClick}
          >
            <AdminDashboardContent
              pipelineStats={pipelineStats}
              vendorStats={vendorStats}
              complaintStats={complaintStats}
              partnerRequirementStats={partnerRequirementStats}
              candidatesByProcess={candidatesByProcess}
              candidatesByRole={candidatesByRole}
              teamPerformance={teamPerformance}
              jobs={jobs}
              onAddJob={onAddJob}
              onDeleteJob={onDeleteJob}
              currentLogoSrc={currentLogoSrc} 
              onLogoUpload={onLogoUpload} 
              activeAdminMenuItem={activeAdminMenuItem}
              onAdminMenuItemClick={onAdminMenuItemClick}
              userType={userType}
              branding={branding}
              onUpdateBranding={onUpdateBranding}
              currentUser={currentUser}
            />
          </AdminLayout>
        );
      case UserType.CANDIDATE:
        return (
          <CandidateLayout
            userType={userType}
            onLogout={onLogout}
            activeCandidateMenuItem={activeCandidateMenuItem}
            onCandidateMenuItemClick={onCandidateMenuItemClick}
          >
            <CandidateDashboardContent
              activeCandidateMenuItem={activeCandidateMenuItem}
              jobs={jobs}
              onApplyNow={onApplyNow}
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