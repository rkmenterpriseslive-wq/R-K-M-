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
  CandidateMenuItem
} from '../types';
import JobPostingForm from './JobPostingForm';
import JobList from './JobList';
import LogoUploader from './LogoUploader';
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
      case UserType.TEAMLEAD: // Team Leads now use the AdminLayout
      case UserType.STORE_SUPERVISOR: // Supervisors now use the AdminLayout
      case UserType.TEAM: // Team Members now use the AdminLayout
        return (
          <AdminLayout
            userType={userType} // Pass userType to AdminLayout
            currentLogoSrc={currentLogoSrc}
            onLogoUpload={onLogoUpload}
            onLogout={onLogout}
            activeAdminMenuItem={activeAdminMenuItem} // Pass active menu item
            onAdminMenuItemClick={onAdminMenuItemClick} // Pass click handler
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
              activeAdminMenuItem={activeAdminMenuItem} // Pass active menu item for conditional rendering
              onAdminMenuItemClick={onAdminMenuItemClick} // Pass handler down
              userType={userType} // Pass userType for section filtering
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
        return (
          <div className="p-6 md:p-8 text-center text-gray-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h2>
            <p>Please log in to access your dashboard.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex-grow"> {/* Removed container mx-auto mt-8 as AdminLayout will handle structure */}
      {renderDashboardContent()}
    </main>
  );
};

export default Dashboard;