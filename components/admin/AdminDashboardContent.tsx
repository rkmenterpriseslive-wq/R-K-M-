
import React, { useState, useEffect, useMemo } from 'react';
import {
  AdminMenuItem,
  AdminDashboardContentProps,
  UserType,
  UserProfile, // Import UserProfile
} from '../../types';
import JobPostingForm from '../JobPostingForm';
import JobList from '../JobList';
import ManagePayrollView from './ManagePayrollView';
import CTCGeneratorView from './CTCGeneratorView';
import GenerateOfferLetterView from './GenerateOfferLetterView';
import PayslipsView from './PayslipsView';
import EmployeeManagementView from './EmployeeManagementView';
import PartnerActiveCandidatesView from './PartnerActiveCandidatesView';
import PartnerUpdateStatusView from './PartnerUpdateStatusView';
import PartnerRequirementsView from './PartnerRequirementsView';
import PartnerInvoicesView from './PartnerInvoicesView';
import PartnerSalaryUpdatesView from './PartnerSalaryUpdatesView';
// Removed generic StatCard and ProgressBarCard from direct use here for the main dashboard view.
// They might still be used within other specialized views.
import SupervisorDashboardView from '../supervisor/SupervisorDashboardView';
import StoreAttendanceView from '../supervisor/StoreAttendanceView';
import StoreEmployeesView from '../supervisor/StoreEmployeesView';
import HRDashboardView from '../hr/HRDashboardView';
import PartnerDashboardView from '../partner/PartnerDashboardView';
import VendorDirectoryView from './VendorDirectoryView';
// Fix: Changed import from default to named.
import SettingsView from './SettingsView';
import WarningLettersView from './WarningLettersView';
import ComplaintsView from './ComplaintsView';
import ReportsView from './ReportsView';
import RevenueView from './RevenueView';
import DemoRequestsView from './DemoRequestsView';
import DailyLineupsView from './DailyLineupsView';
import SelectionDashboardView from './SelectionDashboardView';
import AllCandidatesView from './AllCandidatesView';
import AttendanceView from './AttendanceView';
import { getVendors, getPanelConfig, updatePanelConfig } from '../../services/firebaseService';
// Fix: Add missing import for PartnerManageSupervisorsView
import PartnerManageSupervisorsView from './PartnerManageSupervisorsView';

// Import new dashboard specific components
import CandidatePipelineCard from './CandidatePipelineCard';
import TotalVendorsCard from './TotalVendorsCard';
import ComplaintsCard from './ComplaintsCard';
import RequirementsUpdateCard from './RequirementsUpdateCard';
import CandidatesByProcessList from './CandidatesByProcessList';
import CandidatesByRoleList from './CandidatesByRoleList';
import HRUpdatesCard from './HRUpdatesCard'; // The updated HRUpdatesCard
import RequirementBreakdownSection from './RequirementBreakdownSection';
import TeamPerformanceTable from './TeamPerformanceTable'; // NEW
import MyAccountView from './MyAccountView';
import TeamDashboardView from '../team/TeamDashboardView';


const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  pipelineStats,
  vendorStats,
  complaintStats,
  partnerRequirementStats,
  candidatesByProcess,
  candidatesByRole,
  hrUpdatesStats,
  roleWiseJobData, // NEW
  storeWiseJobData, // NEW
  partnerWiseJobData, // NEW
  teamWiseJobData, // NEW
  teamPerformance, // NEW
  teamMembers,
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  currentLogoSrc,
  onLogoUpload,
  activeAdminMenuItem,
  onAdminMenuItemClick,
  userType,
  branding,
  onUpdateBranding,
  currentUser,
  currentUserProfile,
  allUsers, // NEW: Accept allUsers prop
  candidates,
}) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [panelConfig, setPanelConfig] = useState<any>(null);
  const [activeJobBoardTab, setActiveJobBoardTab] = useState<'list' | 'post'>('list');

  useEffect(() => {
    getVendors().then(setVendors);
    getPanelConfig().then(setPanelConfig);
  }, []);

  const teamMemberDetails = useMemo(() => {
    if (!currentUserProfile || !teamMembers) return null;
    return teamMembers.find(tm => tm.email === currentUserProfile.email);
  }, [currentUserProfile, teamMembers]);

  const handleUpdatePanelConfig = async (config: any) => {
    await updatePanelConfig(config);
    setPanelConfig(config);
  };

  const renderContent = () => {
    switch (activeAdminMenuItem) {
      case AdminMenuItem.Dashboard:
        if (userType === UserType.TEAM || userType === UserType.TEAMLEAD) {
            return (
                <TeamDashboardView 
                    currentUserProfile={currentUserProfile}
                    teamPerformance={teamPerformance}
                    candidates={candidates}
                    onNavigate={onAdminMenuItemClick}
                    pipelineStats={pipelineStats}
                    vendorStats={vendorStats}
                    complaintStats={complaintStats}
                    partnerRequirementStats={partnerRequirementStats}
                    candidatesByProcess={candidatesByProcess}
                    candidatesByRole={candidatesByRole}
                    hrUpdatesStats={hrUpdatesStats}
                    userType={userType}
                    roleWiseJobData={roleWiseJobData}
                    storeWiseJobData={storeWiseJobData}
                    partnerWiseJobData={partnerWiseJobData}
                    teamWiseJobData={teamWiseJobData}
                />
            );
        }
        if (userType === UserType.HR) return <HRDashboardView onNavigate={onAdminMenuItemClick} />;
        if (userType === UserType.PARTNER) return (
            <PartnerDashboardView 
                onNavigate={onAdminMenuItemClick} 
                partnerRequirementStats={partnerRequirementStats}
                activeCandidatesCount={0} // Mocked
                pendingInvoicesCount={0} // Mocked
                supervisorsCount={0} // Mocked
            />
        );
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <CandidatePipelineCard pipelineStats={pipelineStats} />
              <TotalVendorsCard vendorStats={vendorStats} />
              <RequirementsUpdateCard partnerRequirementStats={partnerRequirementStats} />
              <ComplaintsCard complaintStats={complaintStats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CandidatesByProcessList data={candidatesByProcess} />
              <CandidatesByRoleList data={candidatesByRole} />
            </div>

            <HRUpdatesCard 
                totalSelected={hrUpdatesStats.totalSelected}
                totalOfferReleased={hrUpdatesStats.totalOfferReleased}
                onboardingPending={hrUpdatesStats.onboardingPending}
                newJoiningToday={hrUpdatesStats.newJoiningToday}
                newJoiningWeek={hrUpdatesStats.newJoiningWeek}
                newJoiningMonth={hrUpdatesStats.newJoiningMonth}
            />

            <RequirementBreakdownSection
              teamWiseJobData={teamWiseJobData}
              roleWiseJobData={roleWiseJobData}
              storeWiseJobData={storeWiseJobData}
              partnerWiseJobData={partnerWiseJobData}
            />

            <TeamPerformanceTable data={teamPerformance} currentUserProfile={currentUserProfile} />
          </div>
        );

      case AdminMenuItem.DailyLineups:
        return <DailyLineupsView currentUserProfile={currentUserProfile} />;

      case AdminMenuItem.SelectionDashboard:
        return <SelectionDashboardView allUsers={allUsers} candidates={candidates} currentUserProfile={currentUserProfile} />;

      case AdminMenuItem.AllCandidates:
        return <AllCandidatesView candidates={candidates} currentUserProfile={currentUserProfile} />;

      case AdminMenuItem.Attendance:
        return <AttendanceView currentUserProfile={currentUserProfile} />;

      case AdminMenuItem.ManageJobBoard:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveJobBoardTab('list')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeJobBoardTab === 'list' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Active Postings
                    </button>
                    <button 
                        onClick={() => setActiveJobBoardTab('post')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeJobBoardTab === 'post' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        + Post New Job
                    </button>
                </div>
                <h2 className="text-xl font-black text-gray-800 hidden sm:block">Manage Job Board</h2>
            </div>

            {activeJobBoardTab === 'post' ? (
              <div className="animate-fade-in">
                  <JobPostingForm onAddJob={(job) => { onAddJob(job); setActiveJobBoardTab('list'); }} vendors={vendors} panelConfig={panelConfig} />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Job Listings</h3>
                </div>
                <JobList jobs={jobs} currentUserType={userType} onDeleteJob={onDeleteJob} />
              </div>
            )}
          </div>
        );

      case AdminMenuItem.VendorDirectory:
        return <VendorDirectoryView />;

      case AdminMenuItem.WarningLetters:
        return <WarningLettersView candidates={candidates} currentUserProfile={currentUserProfile} />;

      case AdminMenuItem.Complaints:
        return <ComplaintsView candidates={candidates} currentUserProfile={currentUserProfile} />;

      case AdminMenuItem.Reports:
        return <ReportsView allUsers={allUsers} />;

      case AdminMenuItem.Revenue:
        return <RevenueView />;

      case AdminMenuItem.DemoRequests:
        return <DemoRequestsView />;

      case AdminMenuItem.ManagePayroll:
        return <ManagePayrollView />;
      case AdminMenuItem.CTCGenerate:
        return <CTCGeneratorView />;
      case AdminMenuItem.GenerateOfferLetter:
        return <GenerateOfferLetterView logoSrc={currentLogoSrc} />;
      case AdminMenuItem.Payslips:
        return <PayslipsView />;
      case AdminMenuItem.EmployeeManagement:
        return <EmployeeManagementView />;
      case AdminMenuItem.MyProfile:
        return <MyAccountView profile={currentUserProfile || null} teamDetails={teamMemberDetails || null} />;

      case AdminMenuItem.PartnerActiveCandidates:
        return <PartnerActiveCandidatesView currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.PartnerUpdateStatus:
        return <PartnerUpdateStatusView />;
      case AdminMenuItem.PartnerRequirements:
        return <PartnerRequirementsView currentUser={currentUser} currentUserProfile={currentUserProfile} jobs={jobs} />;
      case AdminMenuItem.PartnerInvoices:
        return <PartnerInvoicesView currentUser={currentUser} />;
      case AdminMenuItem.PartnerSalaryUpdates:
        return <PartnerSalaryUpdatesView currentUser={currentUser} />;
      case AdminMenuItem.ManageSupervisors:
        return <PartnerManageSupervisorsView />;

      case AdminMenuItem.SupervisorDashboard:
        return <SupervisorDashboardView />;
      case AdminMenuItem.StoreAttendance:
        return <StoreAttendanceView currentUserProfile={currentUserProfile} />;
      case AdminMenuItem.StoreEmployees:
        return <StoreEmployeesView />;

      case AdminMenuItem.Settings:
        return (
          <SettingsView 
            branding={branding} 
            onUpdateBranding={onUpdateBranding} 
            currentLogoSrc={currentLogoSrc} 
            onLogoUpload={onLogoUpload} 
            currentUserProfile={currentUserProfile}
            panelConfig={panelConfig}
            onUpdatePanelConfig={handleUpdatePanelConfig}
            vendors={vendors}
            allUsers={allUsers} // NEW: Pass allUsers prop
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 italic font-medium">This module is currently under development.</p>
          </div>
        );
    }
  };

  return <div className="animate-fade-in">{renderContent()}</div>;
};

export default AdminDashboardContent;
