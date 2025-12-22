
import React, { useMemo } from 'react';
import {
    UserProfile,
    TeamMemberPerformance,
    Candidate,
    AdminMenuItem,
    CandidatePipelineStats,
    VendorStats,
    ComplaintStats,
    PartnerRequirementStats,
    ProcessMetric,
    RoleMetric,
    HRUpdatesStats,
    UserType,
    RoleWiseData,
    StoreWiseData,
    PartnerWiseData,
    TeamWiseData,
} from '../../types';
import CandidatePipelineCard from '../admin/CandidatePipelineCard';
import TotalVendorsCard from '../admin/TotalVendorsCard';
import ComplaintsCard from '../admin/ComplaintsCard';
import RequirementsUpdateCard from '../admin/RequirementsUpdateCard';
import CandidatesByProcessList from '../admin/CandidatesByProcessList';
import CandidatesByRoleList from '../admin/CandidatesByRoleList';
import HRUpdatesCard from '../admin/HRUpdatesCard';
import TeamPerformanceTable from '../admin/TeamPerformanceTable';
import RequirementBreakdownSection from '../admin/RequirementBreakdownSection';

interface TeamDashboardViewProps {
    currentUserProfile: UserProfile | null;
    teamPerformance: TeamMemberPerformance[];
    candidates: Candidate[];
    onNavigate: (item: AdminMenuItem) => void;
    pipelineStats: CandidatePipelineStats;
    vendorStats: VendorStats;
    complaintStats: ComplaintStats;
    partnerRequirementStats: PartnerRequirementStats;
    candidatesByProcess: ProcessMetric[];
    candidatesByRole: RoleMetric[];
    hrUpdatesStats: HRUpdatesStats;
    userType: UserType;
    roleWiseJobData: RoleWiseData[];
    storeWiseJobData: StoreWiseData[];
    partnerWiseJobData: PartnerWiseData[];
    teamWiseJobData: TeamWiseData[];
}

const TeamDashboardView: React.FC<TeamDashboardViewProps> = ({
    currentUserProfile,
    teamPerformance,
    pipelineStats,
    vendorStats,
    complaintStats,
    partnerRequirementStats,
    candidatesByProcess,
    candidatesByRole,
    hrUpdatesStats,
    userType,
    roleWiseJobData,
    storeWiseJobData,
    partnerWiseJobData,
    teamWiseJobData,
}) => {

    const performanceDataToShow = useMemo(() => {
        if (!currentUserProfile) return [];

        if (userType === UserType.TEAMLEAD) {
            // Team lead sees their own performance and their direct reports' performance.
            return teamPerformance.filter(
                (p) => p.reportingManagerName === currentUserProfile.name || p.name === currentUserProfile.name
            );
        }

        if (userType === UserType.TEAM) {
            // Team member sees only their own performance.
            return teamPerformance.filter((p) => p.name === currentUserProfile.name);
        }

        // Fallback for any other case
        return teamPerformance;
    }, [teamPerformance, currentUserProfile, userType]);


    return (
        <div className="space-y-8">
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

            {userType === UserType.TEAMLEAD && (
                <RequirementBreakdownSection
                    teamWiseJobData={teamWiseJobData}
                    roleWiseJobData={roleWiseJobData}
                    storeWiseJobData={storeWiseJobData}
                    partnerWiseJobData={partnerWiseJobData}
                />
            )}

            <TeamPerformanceTable data={performanceDataToShow} currentUserProfile={currentUserProfile} />
        </div>
    );
};

export default TeamDashboardView;
