
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header';
// Fix: Changed LoginPanel import from default to named export
import { LoginPanel } from './components/LoginPanel';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import Modal from './components/Modal';
import RequestDemoModal from './components/RequestDemoModal';
import ApplyJobModal from './components/ApplyJobModal';
// Added missing Complaint import from types.ts
import { UserType, Job, AdminMenuItem, CandidateMenuItem, AppUser, BrandingConfig, CandidatePipelineStats, VendorStats, Complaint, ComplaintStats, PartnerRequirementStats, ProcessMetric, RoleMetric, UserProfile, DailyLineup, Candidate, HRUpdatesStats, RoleWiseData, StoreWiseData, PartnerWiseData, TeamWiseData, TeamMemberPerformance, TeamMember } from './types';
import { onJobsChange, createJob, deleteJob, updateJob, onAuthChange, signOutUser, seedDatabaseWithInitialData, getUserProfile, updateUserProfile, onDailyLineupsChange, onCandidatesChange, onUsersChange, onComplaintsChange, onAllPartnerRequirementsChange, onTeamMembersChange, onBrandingConfigChange, updateBrandingConfig, updateLogoSrc } from './services/firebaseService';
import { ref, set, getDatabase, onValue, Unsubscribe } from 'firebase/database';

// --- App Component ---

interface DashboardStats {
  pipeline: CandidatePipelineStats;
  vendor: VendorStats;
  complaint: ComplaintStats;
  partnerRequirement: PartnerRequirementStats;
  hrUpdates: HRUpdatesStats; // Added HR Updates Stats
  process: ProcessMetric[];
  role: RoleMetric[];
  // NEW: Add aggregated job data
  roleWiseJobData: RoleWiseData[];
  storeWiseJobData: StoreWiseData[];
  partnerWiseJobData: PartnerWiseData[];
  teamWiseJobData: TeamWiseData[];
  teamPerformance: TeamMemberPerformance[]; // NEW
}

// Moved default branding config here, will be used for initial seed if Firebase is empty.
const defaultBranding: BrandingConfig = {
  portalName: 'R.K.M ENTERPRISE',
  hireTalent: {
      title: 'Hire Top Talent',
      description: 'Post your job openings and find the perfect candidates for your business.',
      link: '#',
      backgroundImage: 'https://rkm-pro-502a5.web.app/images/hiring.png',
  },
  becomePartner: {
      title: 'Become a Partner',
      description: 'Expand your business by collaborating with us and accessing our network.',
      link: '#',
      backgroundImage: 'https://rkm-pro-502a5.web.app/images/partner.png',
  }
};
const defaultLogo = 'https://rkm-pro-502a5.web.app/images/rkm.png';

const USER_SESSION_KEY = 'rkm_user';

const App: React.FC = () => {
  const [currentUserType, setCurrentUserType] = useState<UserType>(UserType.NONE);
  const [currentAppUser, setCurrentAppUser] = useState<AppUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [showLoginPanelForType, setShowLoginPanelForType] = useState<UserType>(UserType.NONE);
  const [showRequestDemoModal, setShowRequestDemoModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeAdminMenuItem, setActiveAdminMenuItem] = useState<AdminMenuItem>(AdminMenuItem.Dashboard);
  const [activeCandidateMenuItem, setActiveCandidateMenuItem] = useState<CandidateMenuItem>(CandidateMenuItem.CVGenerator);
  const [isCvComplete, setIsCvComplete] = useState(false);
  const [applyingForJob, setApplyingForJob] = useState<Job | null>(null);
  const [isViewDashboard, setIsViewDashboard] = useState(false);

  // Raw data for stats calculation
  const [lineups, setLineups] = useState<DailyLineup[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]); // Centralized allUsers state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // New: Team Members state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [partnerReqs, setPartnerReqs] = useState<any[]>([]);
  
  // Branding state now initialized to defaults, will be overwritten by Firebase listener
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [logoSrc, setLogoSrc] = useState<string | null>(defaultLogo);


    interface AggregatedDataIntermediateBase {
      location: Set<string>;
      store: Set<string>;
      brand: Set<string>;
      partner: Set<string>;
      totalOpenings: number;
      pending: number;
      approved: number;
    }

    interface RoleWiseDataIntermediate extends AggregatedDataIntermediateBase {
        role: string;
    }

    interface StoreWiseDataIntermediate extends AggregatedDataIntermediateBase {
        storeName: string;
        role: Set<string>;
    }

    interface PartnerWiseDataIntermediate extends AggregatedDataIntermediateBase {
        partnerName: string;
        role: Set<string>;
    }

    interface TeamWiseDataIntermediate extends AggregatedDataIntermediateBase {
        recruiterName: string;
        role: Set<string>;
    }

    const roleWiseJobData: RoleWiseData[] = useMemo(() => {
        const aggregated: { [key: string]: RoleWiseDataIntermediate } = {};
        jobs.forEach(job => {
            const key = job.title;
            if (!aggregated[key]) {
                aggregated[key] = {
                    role: job.title,
                    location: new Set<string>(),
                    store: new Set<string>(),
                    brand: new Set<string>(),
                    partner: new Set<string>(),
                    totalOpenings: 0,
                    pending: 0, 
                    approved: 0,
                };
            }
            aggregated[key].totalOpenings += job.numberOfOpenings;
            aggregated[key].location.add(job.jobCity);
            aggregated[key].store.add(job.storeName || job.locality);
            aggregated[key].brand.add(job.jobCategory);
            aggregated[key].partner.add(job.company);
        });
        const result: RoleWiseData[] = Object.values(aggregated).map(item => ({
            role: item.role,
            location: Array.from(item.location).join(', '),
            store: Array.from(item.store).join(', '),
            brand: Array.from(item.brand).join(', '),
            partner: Array.from(item.partner).join(', '),
            totalOpenings: item.totalOpenings,
            pending: item.pending,
            approved: item.approved,
        }));
        if (result.length === 0) {
            return [{ role: 'Picker & Packer-0', location: 'Unknown City-0', store: 'Mayur Vihar-0', brand: 'Venus Food', partner: 'N/A-0', totalOpenings: 0, pending: 0, approved: 0 }];
        }
        return result;
    }, [jobs]);

    const storeWiseJobData: StoreWiseData[] = useMemo(() => {
        const aggregated: { [key: string]: StoreWiseDataIntermediate } = {};
        jobs.forEach(job => {
            const key = job.storeName || job.locality;
            if (!aggregated[key]) {
                aggregated[key] = {
                    storeName: key,
                    location: new Set<string>(),
                    store: new Set<string>().add(key),
                    role: new Set<string>(),
                    brand: new Set<string>(),
                    partner: new Set<string>(),
                    totalOpenings: 0,
                    pending: 0,
                    approved: 0,
                };
            }
            aggregated[key].totalOpenings += job.numberOfOpenings;
            aggregated[key].location.add(job.jobCity);
            aggregated[key].role.add(job.title);
            aggregated[key].brand.add(job.jobCategory);
            aggregated[key].partner.add(job.company);
        });
        const result: StoreWiseData[] = Object.values(aggregated).map(item => ({
            storeName: item.storeName,
            location: Array.from(item.location).join(', '),
            role: Array.from(item.role).join(', '),
            brand: Array.from(item.brand).join(', '),
            partner: Array.from(item.partner).join(', '),
            totalOpenings: item.totalOpenings,
            pending: item.pending,
            approved: item.approved,
        }));
        if (result.length === 0) {
            return [{ storeName: 'Mayur Vihar-0', location: 'Unknown City-0', role: 'Picker & Packer-0', brand: 'Venus Food', partner: 'N/A-0', totalOpenings: 0, pending: 0, approved: 0 }];
        }
        return result;
    }, [jobs]);

    const partnerWiseJobData: PartnerWiseData[] = useMemo(() => {
        const aggregated: { [key: string]: PartnerWiseDataIntermediate } = {};
        jobs.forEach(job => {
            const key = job.company;
            if (!aggregated[key]) {
                aggregated[key] = {
                    partnerName: key,
                    brand: new Set<string>(),
                    location: new Set<string>(),
                    role: new Set<string>(),
                    store: new Set<string>(),
                    partner: new Set<string>().add(key),
                    totalOpenings: 0,
                    pending: 0, 
                    approved: 0, 
                };
            }
            aggregated[key].totalOpenings += job.numberOfOpenings;
            aggregated[key].brand.add(job.jobCategory);
            aggregated[key].location.add(job.jobCity);
            aggregated[key].role.add(job.title);
            aggregated[key].store.add(job.storeName || job.locality);
        });
        const result: PartnerWiseData[] = Object.values(aggregated).map(item => ({
            partnerName: item.partnerName,
            brand: Array.from(item.brand).join(', '),
            location: Array.from(item.location).join(', '),
            role: Array.from(item.role).join(', '),
            store: Array.from(item.store).join(', '),
            totalOpenings: item.totalOpenings,
            pending: item.pending,
            approved: item.approved,
        }));
         if (result.length === 0) {
            return [{ partnerName: 'N/A-0', brand: 'Venus Food', location: 'Unknown City-0', role: 'Picker & Packer-0', store: 'Mayur Vihar-0', totalOpenings: 0, pending: 0, approved: 0 }];
        }
        return result;
    }, [jobs]);

    const teamWiseJobData: TeamWiseData[] = useMemo(() => {
        const aggregated: { [key: string]: TeamWiseDataIntermediate } = {}; // Key by recruiter UID
        
        const relevantRecruitersMap = new Map<string, { userProfile: UserProfile, teamMember?: TeamMember }>();
        allUsers.filter(user => [UserType.TEAM, UserType.TEAMLEAD].includes(user.userType))
            .forEach(user => {
                const teamMemberRecord = teamMembers.find(tm => tm.email === user.email);
                relevantRecruitersMap.set(user.uid, { userProfile: user, teamMember: teamMemberRecord });
            });

        jobs.forEach(job => {
            const recruiterId = job.adminId;
            const recruiterInfo = relevantRecruitersMap.get(recruiterId);

            if (recruiterInfo) {
                const { userProfile, teamMember } = recruiterInfo;

                const matchesLocation = !teamMember?.workingLocations || teamMember.workingLocations.length === 0 || teamMember.workingLocations.includes(job.jobCity);
                const matchesVendor = !teamMember?.vendors || teamMember.vendors.length === 0 || teamMember.vendors.includes(job.jobCategory);

                if (!matchesLocation || !matchesVendor) {
                    return; 
                }

                const recruiterName = userProfile.name || `Team Member (${userProfile.uid.slice(0, 4)}...)`;
                
                if (!aggregated[recruiterId]) {
                    aggregated[recruiterId] = {
                        recruiterName: recruiterName,
                        location: new Set<string>(),
                        store: new Set<string>(),
                        brand: new Set<string>(),
                        partner: new Set<string>(),
                        role: new Set<string>(),
                        totalOpenings: 0,
                        pending: 0, 
                        approved: 0, 
                    };
                }
                aggregated[recruiterId].totalOpenings += job.numberOfOpenings;
                aggregated[recruiterId].location.add(job.jobCity);
                aggregated[recruiterId].store.add(job.storeName || job.locality);
                aggregated[recruiterId].brand.add(job.jobCategory);
                aggregated[recruiterId].partner.add(job.company);
                aggregated[recruiterId].role.add(job.title);
            }
        });
        const result: TeamWiseData[] = Object.values(aggregated).map(item => ({
            recruiterName: item.recruiterName,
            location: Array.from(item.location).join(', '),
            store: Array.from(item.store).join(', '),
            brand: Array.from(item.brand).join(', '),
            partner: Array.from(item.partner).join(', '),
            role: Array.from(item.role).join(', '),
            totalOpenings: item.totalOpenings,
            pending: item.pending,
            approved: item.approved,
        }));
        if (result.length === 0) {
            return [{ recruiterName: 'Recruiter-0', role: 'Picker & Packer-0', location: 'Unknown City-0', store: 'Mayur Vihar-0', brand: 'Venus Food', partner: 'N/A-0', totalOpenings: 0, pending: 0, approved: 0 }];
        }
        return result;
    }, [jobs, allUsers, teamMembers]);

  const teamPerformance: TeamMemberPerformance[] = useMemo(() => {
      // Key the performance map by recruiter UID for uniqueness and reliable lookup
      const performanceMap: { [recruiterUid: string]: Omit<TeamMemberPerformance, 'name' | 'role'> & { userProfile: UserProfile; teamMember?: TeamMember; } } = {};

      // 1. Initialize map with ONLY TeamLead and Team users
      // This explicitly filters out Admins/HRs from the primary display of this report
      const relevantUsers = allUsers.filter(user => 
          [UserType.TEAMLEAD, UserType.TEAM].includes(user.userType)
      );

      relevantUsers.forEach(user => {
          const teamMemberRecord = teamMembers.find(tm => tm.email === user.email);
          const reportingManagerName = teamMemberRecord?.reportingManager || 'N/A';
          const managerUserProfile = allUsers.find(u => u.name === reportingManagerName); // Lookup manager's user profile by name
          
          performanceMap[user.uid] = {
              userProfile: user,
              teamMember: teamMemberRecord,
              total: 0,
              selected: 0,
              pending: 0,
              rejected: 0,
              quit: 0,
              successRate: 0,
              reportingManagerName: reportingManagerName,
              reportingManagerUserType: managerUserProfile?.userType || UserType.NONE, // Default to NONE if not found
          };
      });

      // 2. Aggregate candidate data based on recruiterUid
      candidates.forEach(candidate => {
          const recruiterUid = candidate.recruiter;
          
          // Only count candidates if their recruiter is present in our filtered performanceMap
          // This excludes candidates sourced by Admin/HR if they are not also Team/TeamLead users
          if (recruiterUid && performanceMap[recruiterUid]) {
              const stats = performanceMap[recruiterUid];
              stats.total++;

              if (['Selected', 'Hired'].includes(candidate.status)) {
                  stats.selected++;
              } else if (['Rejected'].includes(candidate.status)) {
                  stats.rejected++;
              } else if (['Quit'].includes(candidate.status)) {
                  stats.quit++;
              } else {
                  stats.pending++;
              }
          }
      });

      // 3. Final mapping to TeamMemberPerformance structure
      return Object.values(performanceMap).map(stats => {
          const name = stats.userProfile.name || 'Unknown';
          // Prioritize the specific role from TeamMember record, otherwise use UserType
          const role = stats.teamMember?.role || stats.userProfile.userType || 'N/A'; 

          const totalHandled = stats.total;
          const successRate = totalHandled > 0 ? (stats.selected / totalHandled) * 100 : 0;

          return {
              name,
              role: typeof role === 'string' ? role : 'N/A',
              total: stats.total,
              selected: stats.selected,
              pending: stats.pending,
              rejected: stats.rejected,
              quit: stats.quit,
              successRate: parseFloat(successRate.toFixed(2)),
              reportingManagerName: stats.reportingManagerName,
              reportingManagerUserType: stats.reportingManagerUserType,
          };
      }).sort((a, b) => {
          // Primary sort: by reporting manager name, with 'N/A' last
          const managerNameA = a.reportingManagerName === 'N/A' ? 'ZZZ' : a.reportingManagerName || '';
          const managerNameB = b.reportingManagerName === 'N/A' ? 'ZZZ' : b.reportingManagerName || '';
          const managerComparison = managerNameA.localeCompare(managerNameB);
          if (managerComparison !== 0) return managerComparison;

          // Secondary sort: TeamLead before Team, then by name
          const typeOrderA = a.reportingManagerUserType === UserType.TEAMLEAD ? 0 : (a.reportingManagerUserType === UserType.TEAM ? 1 : 2);
          const typeOrderB = b.reportingManagerUserType === UserType.TEAMLEAD ? 0 : (b.reportingManagerUserType === UserType.TEAM ? 1 : 2);
          if (typeOrderA !== typeOrderB) return typeOrderA - typeOrderB;

          return (a.name || '').localeCompare(b.name || '');
      });
  }, [candidates, allUsers, teamMembers]);


  // Combined stats object
  const dashboardStats: DashboardStats = useMemo(() => {
    const activeCount = candidates.filter(c => c.status === 'Sourced' || c.status === 'Screening').length;
    const interviewCount = candidates.filter(c => c.status === 'Interview').length;
    const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;
    const quitCount = candidates.filter(c => c.status === 'Quit').length;

    const activeComplaints = complaints.filter(c => c.status === 'Active').length;
    const closedComplaints = complaints.filter(c => c.status === 'Closed').length;

    const pendingReqs = partnerReqs.filter(r => r.submissionStatus === 'Pending Review').reduce((acc, r) => acc + (r.openings || 0), 0);
    const approvedReqs = partnerReqs.filter(r => r.submissionStatus === 'Approved').reduce((acc, r) => acc + (r.openings || 0), 0);
    
    // HR Updates Stats
    const totalSelected = candidates.filter(c => c.status === 'Selected' || c.status === 'Hired').length;
    const totalOfferReleased = candidates.filter(c => c.status === 'Offer Sent').length;
    const onboardingPending = candidates.filter(c => c.status === 'Hired').length; // Assuming Hired means onboarding starts
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const newJoiningToday = candidates.filter(c => c.status === 'Hired' && new Date(c.date).getTime() >= startOfDay).length;
    const newJoiningWeek = candidates.filter(c => c.status === 'Hired' && new Date(c.date).getTime() >= startOfWeek).length;
    const newJoiningMonth = candidates.filter(c => c.status === 'Hired' && new Date(c.date).getTime() >= startOfMonth).length;


    return {
        pipeline: { active: activeCount, interview: interviewCount, rejected: rejectedCount, quit: quitCount },
        vendor: { total: [...new Set(lineups.map(l => l.vendor).filter(v => v !== 'Direct'))].length },
        complaint: { active: activeComplaints, closed: closedComplaints },
        partnerRequirement: { total: pendingReqs + approvedReqs, pending: pendingReqs, approved: approvedReqs },
        hrUpdates: {
            totalSelected,
            totalOfferReleased,
            onboardingPending,
            newJoiningToday,
            newJoiningWeek,
            newJoiningMonth
        },
        process: [
            { name: 'Screening', count: candidates.filter(c => c.status === 'Screening').length, color: 'bg-blue-500' },
            { name: 'Interview', count: interviewCount, color: 'bg-indigo-500' },
            { name: 'Selected', count: candidates.filter(c => c.status === 'Selected').length, color: 'bg-purple-500' },
            { name: 'Joined', count: candidates.filter(c => c.status === 'Hired').length, color: 'bg-green-500' },
        ],
        role: [
            { name: 'Picker', count: candidates.filter(c => c.role?.toLowerCase().includes('picker')).length, color: 'bg-cyan-500' },
            { name: 'Sales Executive', count: candidates.filter(c => c.role?.toLowerCase().includes('sales executive')).length, color: 'bg-teal-500' },
            { name: 'Team Leader', count: candidates.filter(c => c.role?.toLowerCase().includes('team leader')).length, color: 'bg-emerald-500' },
            { name: 'Packer', count: candidates.filter(c => c.role?.toLowerCase().includes('packer')).length, color: 'bg-blue-500' },
            { name: 'Driver', count: candidates.filter(c => c.role?.toLowerCase().includes('driver')).length, color: 'bg-purple-500' },
        ],
        // NEW: Pass aggregated job data
        roleWiseJobData,
        storeWiseJobData,
        partnerWiseJobData,
        teamWiseJobData,
        teamPerformance, // NEW
    };
  }, [lineups, candidates, complaints, partnerReqs, roleWiseJobData, storeWiseJobData, partnerWiseJobData, teamWiseJobData, teamPerformance]);

  const handleUpdateBranding = useCallback(async (newBranding: BrandingConfig) => {
    try {
        await updateBrandingConfig(newBranding);
        setBranding(newBranding);
        // alert("Branding updated successfully!"); // Optional: show a toast/alert
    } catch (error) {
        console.error("Error updating branding in Firebase:", error);
        alert("Failed to update branding.");
    }
  }, []);

  const handleLogoUpload = useCallback(async (newLogo: string) => {
      try {
          await updateLogoSrc(newLogo);
          setLogoSrc(newLogo);
          // alert("Logo uploaded successfully!"); // Optional: show a toast/alert
      } catch (error) {
          console.error("Error uploading logo to Firebase:", error);
          alert("Failed to upload logo.");
      }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      await seedDatabaseWithInitialData();
    };
    initializeApp();

    const unsubJobs = onJobsChange(setJobs);
    const unsubLineups = onDailyLineupsChange(setLineups);
    const unsubCandidates = onCandidatesChange(setCandidates);
    const unsubUsers = onUsersChange(setAllUsers); // Listen to all user profile changes
    const unsubTeamMembers = onTeamMembersChange(setTeamMembers); // New: Listen to team member changes
    const unsubComplaints = onComplaintsChange(setComplaints);
    const unsubReqs = onAllPartnerRequirementsChange(setPartnerReqs);
    
    // Listen to branding config changes from Firebase
    const unsubBranding = onBrandingConfigChange((config) => {
        if (config) {
            setBranding(config);
            setLogoSrc(config.logoSrc || defaultLogo); // Assuming logoSrc might be part of BrandingConfig or a separate node
        } else {
            // If no branding config in Firebase, set to defaults
            setBranding(defaultBranding);
            setLogoSrc(defaultLogo);
        }
    });

    return () => {
      unsubJobs();
      unsubLineups();
      unsubCandidates();
      unsubUsers(); // Unsubscribe user listener
      unsubTeamMembers(); // Unsubscribe team member listener
      unsubComplaints();
      unsubReqs();
      unsubBranding(); // Unsubscribe branding listener
    };
  }, []);

  const handleProfileUpdate = useCallback(async (profileData: Partial<UserProfile>) => {
    if (currentAppUser) {
        try {
            await updateUserProfile(currentAppUser.uid, profileData);
            alert('Details saved successfully!');
        } catch (error) {
            console.error("Failed to save details:", error);
            alert("There was an error saving your details. Please try again.");
        }
    }
  }, [currentAppUser]);

  const handleCvCompletion = useCallback(async (cvData: Partial<UserProfile>) => {
    if (currentAppUser) {
        try {
            await updateUserProfile(currentAppUser.uid, { ...cvData, isCvComplete: true });
            setIsCvComplete(true);
            setActiveCandidateMenuItem(CandidateMenuItem.JobBoard);
            alert('CV details saved! You can now apply for jobs.');
        } catch (error) {
            console.error("Failed to save CV:", error);
            alert("There was an error saving your CV. Please try again.");
        }
    }
  }, [currentAppUser]);


  useEffect(() => {
    let unsubscribeProfile: Unsubscribe = () => {};

    const unsubscribeAuth = onAuthChange((firebaseUser) => {
      unsubscribeProfile();

      if (firebaseUser) {
        const db = getDatabase();
        const userProfileRef = ref(db, `users/${firebaseUser.uid}`);
        
        unsubscribeProfile = onValue(userProfileRef, (snapshot) => {
          const userProfileData = snapshot.val();

          if (userProfileData) {
            setCurrentUserProfile(userProfileData);
            
            const userTypeFromDb = (userProfileData.userType || UserType.NONE).toUpperCase();
            const resolvedUserType = Object.values(UserType).includes(userTypeFromDb as UserType) 
                ? userTypeFromDb as UserType 
                : UserType.NONE;

            const appUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              userType: resolvedUserType,
            };

            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(appUser));
            setCurrentAppUser(appUser);
            setCurrentUserType(appUser.userType);
            
            // Set initial dashboard states based on user type
            if ([UserType.ADMIN, UserType.HR, UserType.TEAMLEAD, UserType.TEAM].includes(appUser.userType)) {
              setActiveAdminMenuItem(AdminMenuItem.Dashboard);
            }
             if (appUser.userType === UserType.PARTNER) {
              setActiveAdminMenuItem(AdminMenuItem.Dashboard);
            }
            if (appUser.userType === UserType.STORE_SUPERVISOR) {
              setActiveAdminMenuItem(AdminMenuItem.SupervisorDashboard);
            }
            if (appUser.userType === UserType.CANDIDATE) {
              const cvCompleted = userProfileData.isCvComplete || false;
              setIsCvComplete(cvCompleted);
              if (cvCompleted) {
                  setActiveCandidateMenuItem(CandidateMenuItem.JobBoard);
              } else {
                  setActiveCandidateMenuItem(CandidateMenuItem.CVGenerator);
              }
            }
          }
        });

      } else {
        localStorage.removeItem(USER_SESSION_KEY);
        setCurrentAppUser(null);
        setCurrentUserProfile(null);
        setCurrentUserType(UserType.NONE);
        setIsCvComplete(false);
        setIsViewDashboard(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);
  
  const handleLoginSuccess = () => {
    const attemptedType = showLoginPanelForType;
    setShowLoginPanelForType(UserType.NONE);
    if (attemptedType === UserType.CANDIDATE) {
        setIsViewDashboard(false); 
    } else {
        setIsViewDashboard(true);
    }
  };

  const handleLoginSelect = useCallback((type: UserType) => { setShowLoginPanelForType(type); setIsRegistering(false); }, []);
  
  const handleLogout = useCallback(async () => { 
    try {
      await signOutUser();
      setActiveAdminMenuItem(AdminMenuItem.Dashboard);
      setIsViewDashboard(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const handleCancelLogin = useCallback(() => { setShowLoginPanelForType(UserType.NONE); setIsRegistering(false); }, []);

  const handleAddJob = useCallback(async (newJob: Omit<Job, 'id' | 'postedDate' | 'adminId'>) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) return alert('Only administrators or HR can post jobs.');
    try {
      await createJob({ ...newJob, adminId: currentAppUser.uid });
      alert('Job posted successfully!');
    } catch (error) { console.error("Error creating job:", error); alert('Failed to post job.'); }
  }, [currentAppUser]);
  
  const handleUpdateJob = useCallback(async (job: Job) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) {
      alert('Only administrators or HR can update jobs.');
      return;
    }
    try {
      await updateJob(job);
      alert('Job updated successfully!');
    } catch (error) {
      console.error("Error updating job:", error);
      alert('Failed to update job.');
    }
  }, [currentAppUser]);

  const handleDeleteJob = useCallback(async (id: string) => {
    if (!currentAppUser || ![UserType.ADMIN, UserType.HR].includes(currentAppUser.userType)) {
      alert('Only administrators or HR can delete jobs.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        alert('Job deleted successfully!');
      } catch (error) {
        console.error("Error deleting job:", error);
        alert('Failed to delete job.');
      }
    }
  }, [currentAppUser]);

  const handleApplyNow = useCallback((job: Job) => {
    if (currentUserType === UserType.CANDIDATE) {
        if (!isCvComplete) {
            alert('Please complete your CV before applying for jobs.');
            setIsViewDashboard(true);
            setActiveCandidateMenuItem(CandidateMenuItem.CVGenerator);
            return;
        }
        setApplyingForJob(job);
    } else if (currentUserType === UserType.NONE) {
        alert('Please log in or create an account as an employee to apply for jobs.');
        handleLoginSelect(UserType.CANDIDATE);
    } else {
        alert(`You are logged in as a ${currentUserType.toLowerCase()}. Please log in as an employee to apply for jobs.`);
    }
  }, [currentUserType, isCvComplete, handleLoginSelect]);

  const getLoginTitle = (userType: UserType, isRegistering: boolean): string => {
    if (isRegistering) {
      return `Register - ${userType === UserType.CANDIDATE ? 'Employee' : userType}`;
    }

    switch (userType) {
      case UserType.TEAM:
        return 'Team Login';
      case UserType.PARTNER:
        return 'Partner Login';
      case UserType.CANDIDATE:
        return 'Employee Login';
      case UserType.ADMIN:
        return 'Admin Login';
      default:
        return `Login - ${userType}`;
    }
  };

  return (
    <div className="bg-gray-50 font-sans">
      <Header
        userType={currentUserType}
        onLoginSelect={handleLoginSelect}
        onLogout={handleLogout}
        onHireUsClick={() => setShowRequestDemoModal(true)}
        logoSrc={logoSrc}
        isShowingDashboard={isViewDashboard}
        onHomeClick={() => setIsViewDashboard(false)}
        onDashboardClick={() => setIsViewDashboard(true)}
      />
      <main>
        {!isViewDashboard ? (
          <HomePage
            jobs={jobs}
            onApplyNow={handleApplyNow}
            currentUserType={currentUserType}
            onLoginSelect={handleLoginSelect}
            onNavigateToAdminJobBoard={() => {
                setIsViewDashboard(true);
                setActiveAdminMenuItem(AdminMenuItem.ManageJobBoard);
            }}
            branding={branding}
          />
        ) : (
          <Dashboard
            userType={currentUserType}
            jobs={jobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            currentLogoSrc={logoSrc}
            onLogoUpload={handleLogoUpload}
            pipelineStats={dashboardStats.pipeline}
            vendorStats={dashboardStats.vendor}
            complaintStats={dashboardStats.complaint}
            partnerRequirementStats={dashboardStats.partnerRequirement}
            hrUpdatesStats={dashboardStats.hrUpdates} // Pass new HR updates stats
            candidatesByProcess={dashboardStats.process}
            candidatesByRole={dashboardStats.role}
            // NEW: Pass aggregated job data
            roleWiseJobData={dashboardStats.roleWiseJobData}
            storeWiseJobData={dashboardStats.storeWiseJobData}
            partnerWiseJobData={dashboardStats.partnerWiseJobData}
            teamWiseJobData={dashboardStats.teamWiseJobData}
            teamPerformance={dashboardStats.teamPerformance} // NEW
            teamMembers={teamMembers}
            activeAdminMenuItem={activeAdminMenuItem}
            onAdminMenuItemClick={setActiveAdminMenuItem}
            activeCandidateMenuItem={activeCandidateMenuItem}
            onCandidateMenuItemClick={setActiveCandidateMenuItem}
            onLogout={handleLogout}
            branding={branding}
            onUpdateBranding={handleUpdateBranding}
            currentUser={currentAppUser}
            currentUserProfile={currentUserProfile}
            allUsers={allUsers} // NEW: Pass allUsers
            candidates={candidates}
            onApplyNow={handleApplyNow}
            onCvCompletion={handleCvCompletion}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </main>

      <ApplyJobModal
        isOpen={!!applyingForJob}
        onClose={() => setApplyingForJob(null)}
        job={applyingForJob}
        currentUserProfile={currentUserProfile}
      />

      {showLoginPanelForType !== UserType.NONE && (
        <Modal
          isOpen={true}
          onClose={handleCancelLogin}
          title={getLoginTitle(showLoginPanelForType, isRegistering)}
          description={showLoginPanelForType === UserType.TEAM ? 'Welcome Team Member. Please log in to access your dashboard.' : `Please log in as an ${showLoginPanelForType === UserType.CANDIDATE ? 'employee' : showLoginPanelForType.toLowerCase()} to continue.`}
        >
          <LoginPanel
            userType={showLoginPanelForType}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={(msg) => console.error("Login Error:", msg)}
            initialIsSignUp={isRegistering}
          />
        </Modal>
      )}

      <RequestDemoModal isOpen={showRequestDemoModal} onClose={() => setShowRequestDemoModal(false)} />

    </div>
  );
};

export default App;